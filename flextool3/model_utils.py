"""Utilities for the ''model'' module."""
from .utils import get_and_validate
from .models import Project
from .exception import FlexToolException


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
