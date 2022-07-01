"""Helper functions and utilities for the analysis interface."""
from django.http import (
    HttpResponseBadRequest,
    JsonResponse,
)
from .exception import FlexToolException
from .utils import Database, database_map, get_and_validate, Key


def get_entity_classes(project):
    """Queries entity classes in of project's results database.

    Args:
        project (Project): target project

    Returns:
        HttpResponse: entity classes
    """
    with database_map(project, Database.RESULT) as db_map:
        classes = [row._asdict() for row in db_map.query(db_map.entity_class_sq)]
        return JsonResponse({"classes": classes})


def get_relationship_class_object_classes(project, request_body):
    """Queries relationship class' object classes.

    Required entries in request body:

    - 'relationship_class_id': relationship class id for filtering

    Args:
        project (Project): target project
        request_body (dict): request body

    Returns:
        HttpResponse: relationships
    """
    try:
        class_id = get_and_validate(request_body, Key.RELATIONSHIP_CLASS_ID.value, int)
    except FlexToolException as error:
        return HttpResponseBadRequest(str(error))
    with database_map(project, Database.RESULT) as db_map:
        subquery = db_map.ext_relationship_class_sq
        object_classes_by_dimension = {}
        for row in db_map.query(subquery).filter(subquery.c.id == class_id):
            object_classes_by_dimension[row.dimension] = row.object_class_name
        if not object_classes_by_dimension:
            return HttpResponseBadRequest(
                f"Couldn't find relationship class with id {class_id}"
            )
        object_classes = len(object_classes_by_dimension) * [None]
        for dimension, name in object_classes_by_dimension.items():
            object_classes[dimension] = name
        return JsonResponse({"object_classes": object_classes})
