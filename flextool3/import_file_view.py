"""Utilities and helpers for the import model database interface."""
from django.http import HttpResponseBadRequest, JsonResponse

from .executions_view import is_busy_executing


def save_imported_file(request, project):
    """Overwrites project's input file (input database or input Excel).

    Args:
        request (HTTPRequest): client's request
        project (Project): project

    Returns:
        HttpResponse: server's response
    """
    if (source := request.FILES.get("model_database")) is not None:
        path = project.model_database_path()
    elif (source := request.FILES.get("excel_input")) is not None:
        if is_busy_executing(project.id):
            return HttpResponseBadRequest("Project is being executed")
        path = project.excel_input_file_path()
    else:
        return HttpResponseBadRequest("Request doesn't contain recognized file names.")
    with open(path, "wb+") as destination:
        for chunk in source.chunks():
            destination.write(chunk)
    return JsonResponse({})
