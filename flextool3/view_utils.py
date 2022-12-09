"""Utilities for views."""
from .exception import FlexToolException
from .models import Project, ScenarioExecution
from .utils import get_and_validate


def resolve_project(request, body):
    """Resolves target project according to client request.

    Args:
        request (HttpRequest): request object
        body (dict): request body

    Returns:
        Project: target project
    """
    project_id = get_and_validate(body, "projectId", int)
    try:
        # pylint: disable=no-member
        project = Project.objects.get(id=project_id, user=request.user.id)
    except Project.DoesNotExist as error:  # pylint: disable=no-member
        raise FlexToolException("Project does not exist.") from error
    return project


def resolve_scenario_execution(project, body_or_id):
    """Resolves scenario execution.

    Args:
        project (Project): a project
        body_or_id (dict or int): request body or scenario execution id

    Returns:
        ScenarioExecution: scenario execution
    """
    if not isinstance(body_or_id, int):
        scenario_execution_id = get_and_validate(body_or_id, "scenarioExecutionId", int)
    else:
        scenario_execution_id = body_or_id
    try:
        # pylint: disable=no-member
        scenario_execution = ScenarioExecution.objects.get(id=scenario_execution_id)
    except ScenarioExecution.DoesNotExist as error:  # pylint: disable=no-member
        raise FlexToolException(
            f"Scenario execution with id {scenario_execution_id} doesn't exist."
        ) from error
    if scenario_execution.scenario.project.id != project.id:
        raise FlexToolException(
            f"Scenario execution with id {scenario_execution_id} doesn't exist."
        )
    return scenario_execution

