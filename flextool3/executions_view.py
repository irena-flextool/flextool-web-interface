"""Utilities and helpers for executions interface."""
from dataclasses import dataclass
from datetime import datetime
from enum import Enum, unique
from pathlib import Path
import sys
from tempfile import TemporaryDirectory
import time
from django.http import (
    HttpResponseBadRequest,
    JsonResponse,
)
from django.utils import timezone
from .exception import FlexToolException, ExecutionNotFound
from .model_utils import resolve_project
from .models import Scenario, ScenarioExecution
from .utils import get_and_validate
from . import executor, task_loop

_MOD_SCRIPT_NAME = "mod_script.py"

_temporary_mod_script_dirs = {}

_executions = {}


@unique
class Status(Enum):
    """Execution status codes."""

    YET_TO_START = "YS"
    FINISHED = "OK"
    RUNNING = "RU"
    ERROR = "ER"
    ABORTED = "AB"


@dataclass
class Execution:
    """Execution information."""

    scenarios: list
    status: Status = Status.YET_TO_START
    log: str = ""
    execution_time: datetime = None
    execution_time_offset: int = None


def current_execution(request, request_body):
    """Returns the state of current execution.

    Args:
        request (HTTPRequest): client's request
        request_body (dict): request body

    Returns:
        HTTPResponse: response to client
    """
    try:
        project = resolve_project(request, request_body)
    except FlexToolException as error:
        return HttpResponseBadRequest(str(error))
    execution = _executions.get(project.id)
    if execution is None:
        return JsonResponse({"status": Status.YET_TO_START.value, "scenarios": []})
    return JsonResponse(
        {"status": execution.status.value, "scenarios": execution.scenarios}
    )


def abort_execution(request, request_body):
    """Aborts an ongoing execution.

    Args:
        request (HTTPRequest): client's request
        request_body (dict): request body

    Returns:
        HTTPResponse: response to client
    """
    try:
        project = resolve_project(request, request_body)
    except FlexToolException as error:
        return HttpResponseBadRequest(str(error))
    if project.id not in _executions:
        return HttpResponseBadRequest("Execution does not exist.")
    executor.abort(project.id)
    return JsonResponse({"status": "abort started"})


def execute(request, request_body):
    """Starts executing an execution.

    Args:
        request (HTTPRequest): client's request
        request_body (dict): request body

    Returns:
        HTTPResponse: response to client
    """
    try:
        project = resolve_project(request, request_body)
        scenarios = get_and_validate(request_body, "scenarios", list)
    except FlexToolException as error:
        return HttpResponseBadRequest(str(error))
    execution = _executions.get(project.id)
    if execution is None:
        execution = Execution(scenarios)
        _executions[project.id] = execution
    elif execution.status == Status.RUNNING:
        return JsonResponse({"status": "in progress"})
    else:
        execution.scenarios = scenarios
    start(execution, project.id, project.path, sys.executable, scenarios)
    return JsonResponse({"status": "started."})


def execution_briefing(request, request_body):
    """Generates execution briefing response.

    Args:
        request (HTTPRequest): client's request
        request_body (dict): request body

    Returns:
        HTTPResponse: execution briefing
    """
    try:
        project = resolve_project(request, request_body)
    except FlexToolException as error:
        return HttpResponseBadRequest(str(error))
    try:
        execution = _executions[project.id]
    except KeyError:
        return HttpResponseBadRequest("Project has no execution.")
    return JsonResponse({"briefing": briefing(project, execution)})


def briefing(project, execution):
    """Checks execution status and returns its status and log.

    Args:
        project (Project): execution's project
        execution (Execution): execution instance

    Returns:
        dict: execution briefing
    """
    if execution.status == Status.RUNNING:
        try:
            execution_status = executor.execution_status(project.id)
            logs = executor.read_lines(project.id)
            if logs:
                execution.log += "".join(logs)
            if execution_status == task_loop.Status.FINISHED:
                return_code = executor.execution_return_code(project.id)
                executor.remove(project.id)
                _cleanup_script_temp_dir(project.id)
                has_results = (
                    False
                    if return_code != 0
                    else _has_result_database_changed(project, execution.execution_time)
                )
                execution.status = (
                    Status.FINISHED
                    if return_code == 0 and has_results
                    else Status.ERROR
                )
                if execution.status == Status.FINISHED:
                    _save_scenarios(
                        project,
                        execution.scenarios,
                        execution.log,
                        execution.execution_time,
                        execution.execution_time_offset,
                    )
            elif execution_status == task_loop.Status.ABORTED:
                executor.remove(project.id)
                _cleanup_script_temp_dir(project.id)
                execution.status = Status.ABORTED
        except ExecutionNotFound:
            _cleanup_script_temp_dir(project.id)
            execution.status = Status.ABORTED
    return {"status": execution.status.value, "log": execution.log.split("\n")}


def start(execution, project_id, project_path, interpreter, scenarios):
    """Starts executing given command.

    Args:
        execution (Execution): execution instance
        project_id (int): project id
        project_path (Path): path to project directory
        interpreter (str): Python interpreter executable
        scenarios (list of str): list of active scenario names
    """
    temp_dir, script_path = _make_mod_script(scenarios)
    _temporary_mod_script_dirs[project_id] = temp_dir
    execution.execution_time = timezone.now()
    execution.execution_time_offset = time.localtime().tm_gmtoff
    execution.log = ""
    execution.status = Status.RUNNING
    executor.start(project_id, interpreter, arguments(project_path, script_path))


def arguments(project_path, mod_script_path=None):
    """Returns Python interpreter arguments.

    Args:
        project_path (Path): path to project directory
        mod_script_path (Path): path to project modification script

    Returns:
        list of str: command line arguments
    """
    interpreter_arguments = [
        "-mspinetoolbox",
        "--execute-only",
        str(project_path),
        "--select",
        "Input_data",
        "Export_to_CSV",
        "FlexTool3",
        "Import_results",
        "Results",
    ]
    if mod_script_path is not None:
        interpreter_arguments = (
            interpreter_arguments[:1]
            + ["--mod-script", str(mod_script_path)]
            + interpreter_arguments[1:]
        )
    return interpreter_arguments


def clear_execution(project_id):
    """Removes project's execution if it exists.

    Args:
        project_id (int): project id
    """
    execution = _executions.pop(project_id, None)
    if execution is None:
        return
    if execution.status == Status.RUNNING:
        executor.abort(project_id)


def _cleanup_script_temp_dir(project_id):
    """Frees project modification script's temporary directory.

    Args:
        project_id (int): project id
    """
    temp_dir = _temporary_mod_script_dirs.pop(project_id, None)
    if temp_dir is None:
        return
    temp_dir.cleanup()


def _make_mod_script(scenarios):
    """Writes project modification script to a temporary file.

    Args:
        scenarios (list of str): active scenario names

    Returns:
        tuple: temporary directory containing the script file and path to the file
    """
    quoted_scenarios = (f"'{s}'" for s in scenarios)
    template_path = Path(__file__).parent / "project_modification_script_template.py"
    with open(template_path) as template_file:
        template = template_file.read()
    script_contents = template.format(scenarios=", ".join(quoted_scenarios))
    temp_dir = TemporaryDirectory()  # pylint: disable=consider-using-with
    script_path = Path(temp_dir.name) / _MOD_SCRIPT_NAME
    with open(script_path, "w", encoding="utf-8") as script_file:
        script_file.write(script_contents)
    return temp_dir, script_path


def _has_result_database_changed(project, time_point):
    """Checks if the result database has been modified after given time.

    Args:
        project (Project): project
        time_point (datetime): time after which modification is expected to have happened
    """
    result_database_path = project.results_database_path()
    if not result_database_path.exists():
        return False
    modification_time = datetime.fromtimestamp(
        result_database_path.stat().st_mtime, timezone.utc
    )
    return time_point < modification_time


def _save_scenarios(project, scenarios, log, execution_time, execution_time_offset):
    """Stores executed scenarios to server database.

    Args:
        project (Project): project
        scenarios (list of str): scenario names
        log (str): execution log
        execution_time (datetime) execution time in UTC
        execution_time_offset (int): local timezone offset in seconds
    """
    for scenario_name in scenarios:
        try:
            # pylint: disable=no-member
            scenario = Scenario.objects.get(project=project, name=scenario_name)
        except Scenario.DoesNotExist:  # pylint: disable=no-member
            scenario = Scenario(project=project, name=scenario_name)
            scenario.save()
        scenario_execution = ScenarioExecution(
            scenario=scenario,
            execution_time=execution_time,
            execution_time_offset=execution_time_offset,
            log=log,
        )
        scenario_execution.save()
