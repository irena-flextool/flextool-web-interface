from bisect import bisect_left
import csv
import datetime
import re

from django.http import HttpResponseBadRequest, JsonResponse

from .dict_utils import get_and_validate
from .exception import FlextoolException
from .models import Scenario, ScenarioExecution
from .time_utils import naive_local_time
from .utils import Database, database_map


def number_to_float(x):
    """Converts x to float if possible.

    Args:
        x (Any): a value

    Returns:
        float or Any: float or x if conversion was unsuccessful
    """
    try:
        return float(x)
    except ValueError:
        return x


def get_scenario_list(project):
    """Generates a response that contains project's scenarios and their execution dates.

    Args:
        project (Project): a project

    Returns:
        HTTPResponse: a response object
    """
    scenarios = Scenario.objects.filter(project=project.id)
    scenarios_and_executions = {}
    for scenario in scenarios:
        scenario_executions = ScenarioExecution.objects.filter(scenario=scenario)
        for execution in scenario_executions:
            scenarios_and_executions.setdefault(scenario.name, []).append(
                {
                    "scenario_execution_id": execution.id,
                    "time_stamp": execution.execution_time.isoformat(),
                }
            )
    scenarios_and_executions = {
        name: sorted(executions, key=lambda x: x["time_stamp"], reverse=True)
        for name, executions in scenarios_and_executions.items()
    }
    return JsonResponse({"scenarios": scenarios_and_executions})


def _resolve_scenario_execution(project, body):
    """Resolves scenario execution.

    Args:
        project (Project): a project
        body (dict): request body

    Returns:
        ScenarioExecution: scenario execution
    """
    scenario_execution_id = get_and_validate(body, "scenarioExecutionId", int)
    try:
        scenario_execution = ScenarioExecution.objects.get(id=scenario_execution_id)
    except ScenarioExecution.DoesNotExist:
        raise FlextoolException(
            f"Scenario execution with id {scenario_execution_id} doesn't exist."
        )
    if scenario_execution.scenario.project.id != project.id:
        raise FlextoolException(
            f"Scenario execution with id {scenario_execution_id} doesn't exist."
        )
    return scenario_execution


def get_summary(project, body):
    """Generates a response that contains project's latest execution summary.

    Args:
        project (Project): a project
        body (dict): request body

    Returns:
        HTTPResponse: a response object
    """
    try:
        scenario_execution = _resolve_scenario_execution(project, body)
    except FlextoolException as error:
        return HttpResponseBadRequest(str(error))
    summary_path = scenario_execution.summary_path()
    if summary_path is None:
        return JsonResponse({"summary": []})
    with open(summary_path, encoding="utf-8") as summary_file:
        reader = csv.reader(summary_file)
        summary_rows = [[number_to_float(i) for i in row] for row in reader]
    return JsonResponse({"summary": summary_rows})


def get_result_alternative(project, body):
    """Searches for the alternative in results database corresponding to given scenario execution.

    Args:
        project (Project): a project
        body (dict): request body

    Returns:
        HTTPResponse: a response object
    """
    try:
        scenario_execution = _resolve_scenario_execution(project, body)
    except FlextoolException as error:
        return HttpResponseBadRequest(str(error))
    target_scenario_name = scenario_execution.scenario.name
    candidate_alternatives = []
    result_alternative_name_test = re.compile(
        r"^.+__.+@[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}$"
    )
    with database_map(project, Database.RESULT) as db_map:
        for alternative in db_map.query(db_map.alternative_sq):
            if result_alternative_name_test.match(alternative.name) is None:
                continue
            scenario_name = alternative.name.partition("__")[0]
            if scenario_name == target_scenario_name:
                time_string = alternative.name.partition("@")[-1]
                candidate_alternatives.append(
                    (alternative.id, datetime.datetime.fromisoformat(time_string))
                )
    if not candidate_alternatives:
        return JsonResponse({"alternative_id": None})
    candidate_alternatives.sort(key=lambda s: s[1])
    local_time_point = naive_local_time(
        scenario_execution.execution_time, scenario_execution.execution_time_offset
    )
    i = bisect_left([s[1] for s in candidate_alternatives], local_time_point)
    alternative_id = (
        candidate_alternatives[i][0] if i != len(candidate_alternatives) else None
    )
    return JsonResponse({"alternative_id": alternative_id})
