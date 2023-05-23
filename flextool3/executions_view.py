"""Utilities and helpers for executions interface."""
from dataclasses import dataclass, field
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
from spinedb_api.purge import purge
from .exception import FlexToolException, ExecutionNotFound
from .view_utils import resolve_project
from .models import Project, Scenario, ScenarioExecution
from .utils import Database, database_map, get_and_validate
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


@unique
class ExecutionType(Enum):
    """Execution type codes."""

    SOLVE = "solve"
    IMPORT_EXCEL = "import excel"


@dataclass
class Execution:
    """Execution information."""

    status: Status = Status.RUNNING
    log: str = ""
    execution_time: datetime = None
    execution_time_offset: int = None

    def has_results(self, project):
        """Checks if execution produced expected results.

        Args:
            project (Project): project instance

        Returns:
            bool: True if results were produced, False otherwise
        """
        return True

    def prepare_run(self, project):
        """Prepares project for execution.

        Args:
            project (Project): project instance
        """

    def complete_finishing(self, project):
        """Performs tasks related to successfully finished execution.

        Args:
            project (Project): project instance
        """

    def interpreter_arguments(self, project):
        """Makes list of Python interpreter arguments for the execution.

        Args:
            project (Project): project instance

        Returns:
            list of str: interpreter arguments
        """
        raise NotImplementedError()


@dataclass
class SolveModel(Execution):
    """Execution information when solving the model."""

    scenarios: list = field(default_factory=list)

    def has_results(self, project):
        """See base class."""
        return _has_file_changed(project.results_database_path(), self.execution_time)

    def complete_finishing(self, project):
        """See base class."""
        _save_scenarios(
            project,
            self.scenarios,
            self.log,
            self.execution_time,
            self.execution_time_offset,
        )

    def interpreter_arguments(self, project):
        """See base class."""
        temp_dir, script_path = _make_solve_model_mod_script(self.scenarios)
        _temporary_mod_script_dirs[project.id] = temp_dir
        return solve_model_interpreter_arguments(project.path, script_path)


@dataclass
class ImportExcel(Execution):
    """Execution information when importing input data from Excel file."""

    file_path: Path = None

    def prepare_run(self, project):
        """See base class."""
        with database_map(project, Database.MODEL) as db_map:
            success = purge(
                db_map,
                {
                    "object": True,
                    "relationship": True,
                    "alternative": True,
                    "scenario": True,
                },
            )
            if not success:
                raise FlexToolException("purge failed.")

    def has_results(self, project):
        """See base class."""
        return _has_file_changed(project.model_database_path(), self.execution_time)

    def interpreter_arguments(self, project):
        """See base class."""
        temp_dir, script_path = _make_excel_import_mod_script(self.file_path)
        _temporary_mod_script_dirs[project.id] = temp_dir
        return import_excel_interpreter_arguments(project.path, script_path)


def is_busy_executing(project_id):
    """Tests if an execution is currently running.

    Args:
        project_id (int): project id

    Returns:
        bool: True if an execution is running, False otherwise
    """
    execution = _executions.get(project_id)
    return execution is not None and execution.status == Status.RUNNING


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
    if isinstance(execution, ImportExcel):
        return JsonResponse(
            {"type": ExecutionType.IMPORT_EXCEL.value, "status": execution.status.value}
        )
    elif isinstance(execution, SolveModel):
        return JsonResponse(
            {
                "type": ExecutionType.SOLVE.value,
                "status": execution.status.value,
                "scenarios": execution.scenarios,
            }
        )
    raise RuntimeError("unreachable code")


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


def solve_model(request, request_body):
    """Starts executing a model solve.

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
    return _try_starting_execution(project, SolveModel, scenarios=scenarios)


def _try_starting_execution(project, execution_class, **kwargs):
    """Tries starting a new execution.

    If previous execution does not exist or is not running, starts a new one.
    If previous execution is of different class, reports a busy state

    Args:
        project (Project): project instance
        execution_class (Type): a child of Execution
        **kwargs: keyword arguments forwarded to execution_class constructor

    Returns:
        HTTPResponse: response to client
    """
    execution = _executions.get(project.id)
    if execution is not None and execution.status == Status.RUNNING:
        if isinstance(execution, execution_class):
            return JsonResponse({"status": "in progress"})
        return JsonResponse({"status": "busy"})
    execution = execution_class(**kwargs)
    _executions[project.id] = execution
    try:
        execution.prepare_run(project)
    except FlexToolException as error:
        return HttpResponseBadRequest(str(error))
    start(execution, project, sys.executable)
    return JsonResponse({"status": "started"})


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
    """Checks execution and returns its status and log.

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
                    False if return_code != 0 else execution.has_results(project)
                )
                execution.status = (
                    Status.FINISHED
                    if return_code == 0 and has_results
                    else Status.ERROR
                )
                if execution.status == Status.FINISHED:
                    execution.complete_finishing(project)
            elif execution_status == task_loop.Status.ABORTED:
                executor.remove(project.id)
                _cleanup_script_temp_dir(project.id)
                execution.status = Status.ABORTED
        except ExecutionNotFound:
            _cleanup_script_temp_dir(project.id)
            execution.status = Status.ABORTED
    return {"status": execution.status.value, "log": execution.log.split("\n")}


def start(execution, project, interpreter):
    """Starts executing given command.

    Args:
        execution (Execution): execution instance
        project (Project): project instance
        interpreter (str): Python interpreter executable
    """
    execution.execution_time = timezone.now()
    execution.execution_time_offset = time.localtime().tm_gmtoff
    execution.log = ""
    execution.status = Status.RUNNING
    executor.start(project.id, interpreter, execution.interpreter_arguments(project))


def solve_model_interpreter_arguments(project_path, mod_script_path):
    """Returns Python interpreter arguments for solving the model.

    Args:
        project_path (Path): path to project directory
        mod_script_path (Path): path to project modification script

    Returns:
        list of str: command line arguments
    """
    return [
        "-mspinetoolbox",
        "--mod-script",
        str(mod_script_path),
        "--execute-only",
        str(project_path),
        "--select",
        "Input_data",
        "Export_to_CSV",
        "FlexTool3",
        "Import_results",
        "Results",
    ]


def import_excel_interpreter_arguments(project_path, mod_script_path):
    """Returns Python interpreter arguments for importing Excel file.

    Args:
        project_path (Path): path to project directory
        mod_script_path (Path): path to project modification script

    Returns:
        list of str: command line arguments
    """
    return [
        "-mspinetoolbox",
        "--mod-script",
        str(mod_script_path),
        "--execute-only",
        str(project_path),
        "--select",
        "Import_from_Excel",
    ]


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


def import_excel_input(request, request_body):
    """Starts executing a model solve.

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
    file_path = project.excel_input_file_path()
    if not file_path:
        return HttpResponseBadRequest("Excel file has not been uploaded.")
    return _try_starting_execution(project, ImportExcel, file_path=file_path)


def _cleanup_script_temp_dir(project_id):
    """Frees project modification script's temporary directory.

    Args:
        project_id (int): project id
    """
    temp_dir = _temporary_mod_script_dirs.pop(project_id, None)
    if temp_dir is None:
        return
    temp_dir.cleanup()


def _make_solve_model_mod_script(scenarios):
    """Writes project modification script for solve model to a temporary file.

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


def _make_excel_import_mod_script(file_path):
    """Writes project modification script for Excel import to a temporary file.

    Args:
        file_path (Path): path to importee

    Returns:
        tuple: temporary directory containing the script file and path to the file
    """
    template_path = (
        Path(__file__).parent / "excel_import_project_modification_script_template.py"
    )
    with open(template_path) as template_file:
        template = template_file.read()
    script_contents = template.format(file_name=file_path.name)
    temp_dir = TemporaryDirectory()  # pylint: disable=consider-using-with
    script_path = Path(temp_dir.name) / _MOD_SCRIPT_NAME
    with open(script_path, "w", encoding="utf-8") as script_file:
        script_file.write(script_contents)
    return temp_dir, script_path


def _has_file_changed(database_path, time_point):
    """Checks if a database has been modified after given time.

    Args:
        database_path (Path): path to file
        time_point (datetime): time after which modification is expected to have happened
    """
    if not database_path.exists():
        return False
    modification_time = datetime.fromtimestamp(
        database_path.stat().st_mtime, timezone.utc
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
