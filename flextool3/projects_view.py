"""Utilities and helpers for the projects interface."""
import re
from django.http import (
    HttpResponseBadRequest,
    JsonResponse,
)
from .exception import FlexToolException
from .executions_view import clear_execution
from .models import Project, PROJECT_NAME_LENGTH
from .utils import FLEXTOOL_PROJECTS_ROOT, FLEXTOOL_PROJECT_TEMPLATE, get_and_validate


def project_list(user_id):
    """Stores a list of available projects into a JSON response.

    Args:
        user_id (int): user's id

    Returns:
        HttpResponse: response to client
    """
    # pylint: disable=no-member
    response = {
        "projects": [
            project.project_list_data()
            for project in Project.objects.filter(user_id=user_id)
        ]
    }
    return JsonResponse(response)


def create_project(user, request_body):
    """Creates a new project.

    Args:
        user (User): project's owner
        request_body (dict): client request body

    Returns:
        HttpResponse: response to client
    """
    try:
        project_name = request_body["name"]
    except KeyError as missing:
        return HttpResponseBadRequest(f"Missing '{missing}'")
    project_name = project_name[:PROJECT_NAME_LENGTH].strip()
    if re.match(r"(^\w&)|(^\w(\w|\s|-|_|\.)*\w$)", project_name) is None:
        return HttpResponseBadRequest("Invalid project name.")
    try:
        new_project = Project.create(
            user,
            project_name,
            FLEXTOOL_PROJECTS_ROOT,
            FLEXTOOL_PROJECT_TEMPLATE,
        )
    except FlexToolException as error:
        return HttpResponseBadRequest(str(error))
    new_project.save()
    return JsonResponse({"project": new_project.project_list_data()})


def destroy_project(user, request_body):
    """Destroys a project by it from the database and removing the project directory.

    Args:
        user (User): project owner
        request_body (dict): destroy request body

    Returns:
        HttpResponse: response to be sent to client
    """
    try:
        id_ = get_and_validate(request_body, "id", int)
    except FlexToolException as error:
        return HttpResponseBadRequest(str(error))
    try:
        # pylint: disable=no-member
        project = Project.objects.get(user_id=user.id, pk=id_)
    except Project.DoesNotExist:  # pylint: disable=no-member
        return HttpResponseBadRequest("Project does not exist.")
    project.remove_project_dir()
    clear_execution(project.id)
    project.delete()
    return JsonResponse({"id": id_})
