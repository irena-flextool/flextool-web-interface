"""Utilities and helpers for the summary interface."""
import csv

from django.http import HttpResponseBadRequest, JsonResponse

from .exception import FlexToolException
from .models import Scenario, ScenarioExecution
from .view_utils import resolve_scenario_execution


def number_to_float(value):
    """Converts x to float if possible.

    Args:
        value (Any): a value

    Returns:
        float or Any: float or x if conversion was unsuccessful
    """
    try:
        return float(value)
    except ValueError:
        return value


def get_scenario_list(project):
    """Generates a response that contains project's scenarios and their execution dates.

    Args:
        project (Project): a project

    Returns:
        HTTPResponse: a response object
    """
    # pylint: disable=no-member
    scenarios = Scenario.objects.filter(project=project.id)
    scenarios_and_executions = {}
    for scenario in scenarios:
        # pylint: disable=no-member
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


def get_summary(project, body):
    """Generates a response that contains project's latest execution summary.

    Args:
        project (Project): a project
        body (dict): request body

    Returns:
        HTTPResponse: a response object
    """
    try:
        scenario_execution = resolve_scenario_execution(project, body)
    except FlexToolException as error:
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
        scenario_execution = resolve_scenario_execution(project, body)
    except FlexToolException as error:
        return HttpResponseBadRequest(str(error))
    return JsonResponse({"alternative_id": scenario_execution.results_alternative_id()})


def get_output_directory(project, body):
    """Finds the path to the tool's results directory.

    Args:
        project (Project): a project
        body (dict): request body

    Returns:
        HTTPResponse: a response object
    """
    try:
        scenario_execution = resolve_scenario_execution(project, body)
    except FlexToolException as error:
        return HttpResponseBadRequest(str(error))
    summary_path = scenario_execution.summary_path()
    if summary_path is None:
        return JsonResponse({"directory": None})
    return JsonResponse({"directory": str(summary_path.parent)})


def destroy_execution(project, body):
    """Removes given scenario execution deleting result files and database records.

    Args:
        project (Project): a project
        body (dict): request body

    Returns:
        HTTPResponse: a response object
    """
    try:
        scenario_execution = resolve_scenario_execution(project, body)
    except FlexToolException as error:
        return HttpResponseBadRequest(str(error))
    scenario_execution.delete()
    return JsonResponse({})
