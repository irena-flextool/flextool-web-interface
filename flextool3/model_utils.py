from .dict_utils import get_and_validate
from .models import Project
from .exception import FlextoolException


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
        project = Project.objects.get(id=project_id, user=request.user.id)
    except Project.DoesNotExist:
        raise FlextoolException("Project does not exist.")
    return project
