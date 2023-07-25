import json
from operator import attrgetter

from django.http import JsonResponse, HttpResponseBadRequest
from sqlalchemy.sql.expression import Alias, and_

from .utils import Database, database_map, EntityType, get_and_validate
from .view_utils import resolve_scenario_execution


def get_entity_classes(project):
    """Gathers entity classes from the results database.

    Args:
        project (Project): a project

    Returns:
        HTTPResponse: a response object
    """
    entity_classes = []
    with database_map(project, Database.RESULT) as db_map:
        subquery = db_map.entity_class_sq
        for row in db_map.query(subquery).order_by(subquery.c.name):
            entity_classes.append({"name": row.name})
    return JsonResponse({"entity_classes": entity_classes})


def get_entities(project, body):
    """Gathers entities from the results database.

    Args:
        project (Project): a project
        body (dict): request body

    Returns:
        HTTPResponse: a response object
    """
    classes = get_and_validate(body, "classes", list)
    entities = []
    with database_map(project, Database.RESULT) as db_map:
        subquery = db_map.ext_object_sq
        for row in (
            db_map.query(subquery)
            .filter(subquery.c.class_name.in_(classes))
            .order_by(subquery.c.name)
        ):
            entities.append({"names": [row.name], "class_name": row.class_name})
        subquery = db_map.wide_relationship_sq
        for row in (
            db_map.query(subquery)
            .filter(subquery.c.class_name.in_(classes))
            .order_by(subquery.c.name)
        ):
            entities.append(
                {"names": row.object_name_list.split(","), "class_name": row.class_name}
            )
    return JsonResponse({"entities": entities})


def get_parameters(project, body):
    """Gathers parameters from the results database.

    Args:
        project (Project): a project
        body (dict): request body

    Returns:
        HTTPResponse: a response object
    """
    classes = get_and_validate(body, "classes", list)
    parameters = []
    with database_map(project, Database.RESULT) as db_map:
        subquery = db_map.entity_class_sq
        class_names = {}
        for row in db_map.query(subquery).filter(subquery.c.name.in_(classes)):
            class_names[row.id] = row.name
        subquery = db_map.parameter_definition_sq
        for row in (
            db_map.query(subquery)
            .filter(subquery.c.entity_class_id.in_(class_names))
            .order_by(subquery.c.name)
        ):
            parameters.append(
                {"name": row.name, "class_name": class_names[row.entity_class_id]}
            )
    return JsonResponse({"parameters": parameters})


def get_value_indexes(project, body):
    """Gathers parameter value indexes from the results database.

    Args:
        project (Project): a project
        body (dict): request body

    Returns:
        HTTPResponse: a response object
    """
    alternative_to_execution = _execution_alternatives(project, body)
    alternative_ids = (
        list(alternative_to_execution) if alternative_to_execution is not None else []
    )
    classes = get_and_validate(body, "classes", list)
    parameters = get_and_validate(body, "parameters", list)
    indexes = []
    with database_map(project, Database.RESULT) as db_map:
        entity_class_types = _fetch_entity_class_types(db_map)
        object_classes = [
            class_
            for class_ in classes
            if entity_class_types.get(class_) == EntityType.OBJECT
        ]
        if object_classes:
            filter_conditions = _make_object_filter(
                object_classes,
                [],
                parameters,
                alternative_ids,
                db_map.object_parameter_value_sq,
            )
            indexes.extend(
                _query_parameter_dimensions(
                    EntityType.OBJECT, filter_conditions, db_map
                )
            )
        relationship_classes = [
            class_
            for class_ in classes
            if entity_class_types.get(class_) == EntityType.RELATIONSHIP
        ]
        if relationship_classes:
            filter_conditions = _make_relationship_filter(
                relationship_classes,
                parameters,
                alternative_ids,
                db_map.relationship_parameter_value_sq,
            )
            indexes.extend(
                _query_parameter_dimensions(
                    EntityType.RELATIONSHIP, filter_conditions, db_map
                )
            )
    return JsonResponse({"indexes": indexes})


def get_parameter_values(project, body):
    """Gathers parameters from the results database.

    Args:
        project (Project): a project
        body (dict): request body

    Returns:
        HTTPResponse: a response object
    """
    alternative_to_execution = _execution_alternatives(project, body)
    alternative_ids = list(alternative_to_execution)
    classes = get_and_validate(body, "classes", list)
    parameters = get_and_validate(body, "parameters", list)
    objects = get_and_validate(body, "objects", list, required=False)
    values = []
    with database_map(project, Database.RESULT) as db_map:
        entity_class_types = _fetch_entity_class_types(db_map)
        object_classes = [
            class_
            for class_ in classes
            if entity_class_types.get(class_) == EntityType.OBJECT
        ]
        if object_classes:
            filter_conditions = _make_object_filter(
                object_classes,
                objects if objects is not None else [],
                parameters if parameters is not None else [],
                alternative_ids,
                db_map.object_parameter_value_sq,
            )
            values += _query_parameter_values(
                EntityType.OBJECT,
                filter_conditions,
                None,
                alternative_to_execution,
                db_map,
            )
        relationship_classes = [
            class_
            for class_ in classes
            if entity_class_types.get(class_) == EntityType.RELATIONSHIP
        ]
        if relationship_classes:
            filter_conditions = _make_relationship_filter(
                relationship_classes,
                parameters if parameters is not None else [],
                alternative_ids,
                db_map.relationship_parameter_value_sq,
            )
            values += _query_parameter_values(
                EntityType.RELATIONSHIP,
                filter_conditions,
                objects if objects is not None else [],
                alternative_to_execution,
                db_map,
            )
    return JsonResponse({"values": values})


def _query_parameter_values(
    entity_type, filter_conditions, accept_objects, alternative_to_execution, db_map
):
    """Reads parameter values from database.

    Args:
        entity_type (EntityType): entity type
        filter_conditions (tuple): query filters
        accept_objects (list of list, optional): object names per dimension
        alternative_to_execution (dict): mapping from alternative id to scenario execution
        db_map (DatabaseMappingBase):

    Returns:
        dict: parameter value records
    """
    records = []
    get_class_name, get_object_names, get_object_labels = _entity_handling_functions(
        entity_type
    )
    subquery = {
        EntityType.OBJECT: db_map.object_parameter_value_sq,
        EntityType.RELATIONSHIP: db_map.relationship_parameter_value_sq,
    }[entity_type]
    for row in db_map.query(subquery).filter(and_(*filter_conditions)):
        objects = get_object_names(row)
        if (
            entity_type == EntityType.RELATIONSHIP
            and accept_objects
            and _reject_objects(objects, accept_objects)
        ):
            continue
        execution = alternative_to_execution[row.alternative_id]
        record = {
            "class": get_class_name(row),
            "object_classes": get_object_labels(row),
            "objects": objects,
            "parameter": row.parameter_name,
            "scenario": execution.scenario.name,
            "time_stamp": execution.execution_time.isoformat(),
            "type": row.type,
            "value": str(row.value, encoding="utf-8"),
        }
        records.append(record)
    return records


def _query_parameter_dimensions(entity_type, filter_conditions, db_map):
    """Reads parameter value dimensions from the first suitable parameter value found in database.

    Args:
        entity_type (EntityType): entity type
        filter_conditions (tuple): query filters
        db_map (DatabaseMappingBase):

    Returns:
        list: dimension records
    """
    dimensions = {}
    get_class_name, get_object_names, get_object_labels = _entity_handling_functions(
        entity_type
    )
    subquery = {
        EntityType.OBJECT: db_map.object_parameter_value_sq,
        EntityType.RELATIONSHIP: db_map.relationship_parameter_value_sq,
    }[entity_type]
    queried_fingerprints = set()
    for row in db_map.query(subquery).filter(and_(*filter_conditions)):
        fingerprint = (row.entity_class_id, row.parameter_id, row.alternative_id)
        if fingerprint in queried_fingerprints:
            continue
        else:
            queried_fingerprints.add(fingerprint)
        value = json.loads(row.value)
        indexes = {}
        _collect_indexes(value, indexes)
        for i, (name, index) in enumerate(indexes.items()):
            existing = dimensions.get(name)
            if existing is not None:
                existing["indexes"] = sorted(set(existing["indexes"]) | index)
                existing_class_and_parameter = set(
                    zip(existing["class_names"], existing["parameter_names"])
                )
                class_name = get_class_name(row)
                parameter = row.parameter_name
                if (class_name, parameter) not in existing_class_and_parameter:
                    existing["class_names"].append(class_name)
                    existing["parameter_names"].append(parameter)
            else:
                dimensions[name] = {
                    "index_name": name,
                    "indexes": sorted(index),
                    "depth": i,
                    "class_names": [get_class_name(row)],
                    "parameter_names": [row.parameter_name],
                }
    return list(dimensions.values())


def _entity_handling_functions(entity_type):
    """Generates a callable suitable for retrieving information
    from database row of given entity type.

    Args:
        entity_type (EntityType): entity type

    Returns:
        tuple: functions needed to query specified entity type
    """
    class_name_fields = {
        EntityType.OBJECT: "object_class_name",
        EntityType.RELATIONSHIP: "relationship_class_name",
    }
    object_lists = {
        EntityType.OBJECT: lambda r: [r.object_name],
        EntityType.RELATIONSHIP: lambda r: r.object_name_list.split(","),
    }
    object_labels = {
        EntityType.OBJECT: lambda r: [r.object_class_name],
        EntityType.RELATIONSHIP: lambda r: r.object_class_name_list.split(","),
    }
    get_class_name = attrgetter(class_name_fields[entity_type])
    get_object_names = object_lists[entity_type]
    get_object_labels = object_labels[entity_type]
    return get_class_name, get_object_names, get_object_labels


def _make_object_filter(object_classes, objects, parameters, alternative_ids, subquery):
    """Creates object parameter value query filters.

    Args:
        object_classes (list of str): object class names
        objects (list of list): object names per dimension
        parameters (list of str): parameter definition names
        alternative_ids (list of int): alternative ids
        subquery (Alias): object parameter value subquery

    Returns:
        tuple: query filters
    """
    filters = ()
    if object_classes:
        filters = filters + (subquery.c.object_class_name.in_(object_classes),)
    if objects and objects[0]:
        filters = filters + (subquery.c.object_name.in_(objects[0]),)
    if parameters:
        filters = filters + (subquery.c.parameter_name.in_(parameters),)
    if alternative_ids:
        filters = filters + (subquery.c.alternative_id.in_(alternative_ids),)
    return filters


def _make_relationship_filter(
    relationship_classes, parameters, alternative_ids, subquery
):
    """Creates relationship parameter value query filters.

    Args:
        relationship_classes (list of str): relationship class names
        parameters (list of str): parameter names
        alternative_ids (list of int): alternative ids
        subquery (Alias): relationship parameter value subquery

    Returns:
        tuple: query filters
    """
    filters = ()
    if relationship_classes:
        filters = filters + (
            subquery.c.relationship_class_name.in_(relationship_classes),
        )
    if parameters:
        filters = filters + (subquery.c.parameter_name.in_(parameters),)
    if alternative_ids:
        filters = filters + (subquery.c.alternative_id.in_(alternative_ids),)
    return filters


def _reject_objects(objects, acceptable_objects):
    """Returns True if any object in objects list is not
    in any corresponding list of acceptable_objects.

    Args:
        objects (list of str): object names
        acceptable_objects (list of list): acceptable object names per dimension

    Return:
        bool: True if objects should be discarded, False otherwise
    """
    for object_, acceptables in zip(objects, acceptable_objects):
        if acceptables and object_ not in acceptables:
            return True
    return False


def _fetch_entity_class_types(db_map):
    """Connects entity class names to whether they are object or relationship classes.

    Args:
        db_map (DatabaseMappingBase): database mapping

    Returns:
        dict: map from entity class name to entity type
    """
    return {
        row.name: EntityType.OBJECT if row.type_id == 1 else EntityType.RELATIONSHIP
        for row in db_map.query(db_map.entity_class_sq)
    }


def _collect_indexes(value, indexes, depth=0):
    """Recursively collects indexes and index names from parameter value.

    Args:
        value (dict): (unparsed) parameter value in database format
        indexes (dict): value indexes
    """
    index = indexes.setdefault(value.get("index_name", f"x_{depth}"), set())
    if isinstance(value["data"], list):
        for row in value["data"]:
            index.add(row[0])
            if isinstance(row[1], dict):
                _collect_indexes(row[1], indexes, depth + 1)
    else:
        for i, y in value["data"].items():
            index.add(i)
            if isinstance(y, dict):
                _collect_indexes(y, indexes, depth + 1)


def _execution_alternatives(project, body):
    """Collects alternatives corresponding to request's scenario executions.

    Args:
        project (project): a project
        body (dict): request body

    Returns:
        dict: mapping from alternative id to execution
    """
    scenario_execution_ids = get_and_validate(body, "scenarioExecutionIds", list)
    scenario_executions = [
        resolve_scenario_execution(project, id_) for id_ in scenario_execution_ids
    ]
    return {
        execution.results_alternative_id(): execution
        for execution in scenario_executions
    }


def get_default_plot_specification(project):
    """Sends the default plot specification to client.

    Args:
        project (Project): a project

    Returns:
        HTTPResponse: a response object
    """
    specification_path = project.default_plot_specification_path()
    if not specification_path.exists():
        return JsonResponse({"plot_specification": json.dumps({"plots": []})})
    return JsonResponse(
        {"plot_specification": specification_path.read_text(encoding="utf-8")}
    )


def get_custom_plot_specification_names(project):
    """Sends the names of all custom plot specifications to client.

    Args:
        project (Project): a project

    Returns:
        HTTPResponse: a response object
    """
    specification_directory = project.custom_plot_specifications_directory()
    return JsonResponse(
        {"names": [path.stem for path in specification_directory.glob("*.json")]}
    )


def get_custom_plot_specification(project, body):
    """Sends a custom plot specification to client.

    Args:
        project (Project): a project
        body (dict): request body

    Returns:
        HTTPResponse: a response object
    """
    name = get_and_validate(body, "name", str)
    specification_directory = project.custom_plot_specifications_directory()
    specification_path = specification_directory / (name + ".json")
    if not specification_path.exists():
        return HttpResponseBadRequest("Specification not found.")
    return JsonResponse(
        {"plot_specification": specification_path.read_text(encoding="utf-8")}
    )


def set_default_plot_specification(project, body):
    """Sets a new default plot specification.

    Args:
        project (Project): a project
        body (dict): request body

    Returns:
        HTTPResponse: a response object
    """
    plot_specification = get_and_validate(body, "specification", dict)
    specification_path = project.default_plot_specification_path()
    specification_path.write_text(
        json.dumps(plot_specification, sort_keys=True, indent=2), encoding="utf-8"
    )
    return JsonResponse({"status": "ok"})


def set_custom_plot_specification(project, body):
    """Sets a custom plot specification.

    Args:
        project (Project): a project
        body (dict): request body

    Returns:
        HTTPResponse: a response object
    """
    name = get_and_validate(body, "name", str)
    plot_specification = get_and_validate(body, "specification", dict)
    specification_directory = project.custom_plot_specifications_directory()
    specification_path = specification_directory / (name + ".json")
    specification_path.write_text(
        json.dumps(plot_specification, sort_keys=True, indent=2), encoding="utf-8"
    )
    return JsonResponse({"status": "ok"})


def remove_custom_plot_specification(project, body):
    """Removes a custom plot specification.

    Args:
        project (Project): a project
        body (dict): request body

    Returns:
        HTTPResponse: a response object
    """
    name = get_and_validate(body, "name", str)
    specification_directory = project.custom_plot_specifications_directory()
    specification_path = specification_directory / (name + ".json")
    try:
        specification_path.unlink()
    except FileNotFoundError:
        return HttpResponseBadRequest("Specification not found.")
    return JsonResponse({"status": "ok"})


def rename_custom_plot_specification(project, body):
    """Renames a custom plot specification.

    Args:
        project (Project): a project
        body (dict): request body

    Returns:
        HTTPResponse: a response object
    """
    name = get_and_validate(body, "name", str)
    new_name = get_and_validate(body, "newName", str)
    specification_directory = project.custom_plot_specifications_directory()
    specification_path = specification_directory / (name + ".json")
    if not specification_path.exists():
        return HttpResponseBadRequest("Specification not found.")
    target_path = specification_path.parent / (new_name + ".json")
    if target_path.exists():
        return JsonResponse({"status": "exists"})
    specification_path.rename(target_path)
    return JsonResponse({"status": "ok"})
