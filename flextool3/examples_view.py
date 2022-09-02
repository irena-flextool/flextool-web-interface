from django.http import JsonResponse
from spinedb_api import export_data, import_data
from spinedb_api.filters.alternative_filter import alternative_filter_config
from spinedb_api.filters.tool_filter import tool_filter_config

from .utils import Database, database_map, get_and_validate


def get_example_list(project):
    """Gathers list of available examples in the initialization database.

    Args:
        project (Project): target project

    Returns:
        HttpResponse: list of examples
    """
    with database_map(project, Database.INITIALIZATION) as db_map:
        examples = [row.name for row in db_map.query(db_map.alternative_sq)]
        return JsonResponse({"examples": examples})


def add_example_to_model(project, request_body):
    """Merges relevant items from initialization database to model database.

    Args:
        project (Project): target project
        request_body (dict): request body

    Returns:
        HttpResponse: list of examples
    """
    example_name = get_and_validate(request_body, "name", str)
    filter_config = [
        alternative_filter_config([example_name]),
        tool_filter_config("FlexTool3"),
    ]
    with database_map(project, Database.INITIALIZATION, filter_config) as db_map:
        data = export_data(db_map)
    with database_map(project, Database.MODEL) as db_map:
        import_count, import_errors = import_data(db_map, **data)
        if import_count > 0:
            db_map.commit_session(f"Initialized '{example_name}'.")
    if import_errors:
        return JsonResponse({"status": "error"})
    return JsonResponse({"status": "ok"})
