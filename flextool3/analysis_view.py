import json

from django.http import JsonResponse, HttpResponseBadRequest
from sqlalchemy.sql.expression import Alias, and_

from .exception import FlexToolException
from .subquery import parameter_value_sq, wide_entity_sq
from .utils import Database, database_map, get_and_validate
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
        subquery = wide_entity_sq(db_map)
        for row in (
            db_map.query(subquery)
            .filter(subquery.c.entity_class_name.in_(classes))
            .order_by(subquery.c.name)
        ):
            names = [row.name] if not row.element_name_list else row.element_name_list.split(",")
            entities.append({"names": names, "class_name": row.entity_class_name})
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
        subquery = parameter_value_sq(db_map)
        filter_conditions = _make_entity_filter(
            classes,
            parameters,
            alternative_ids,
            subquery,
        )
        indexes.extend(
            _query_parameter_dimensions(
                filter_conditions, subquery, db_map
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
    elements = get_and_validate(body, "objects", list, required=False)
    with database_map(project, Database.RESULT) as db_map:
        subquery = parameter_value_sq(db_map)
        filter_conditions = _make_entity_filter(
            classes,
            parameters if parameters is not None else [],
            alternative_ids,
            subquery,
        )
        values = _query_parameter_values(
            filter_conditions,
            elements,
            alternative_to_execution,
            subquery,
            db_map
        )
    return JsonResponse({"values": values})


def _query_parameter_values(
    filter_conditions, accept_elements, alternative_to_execution, subquery, db_map
):
    """Reads parameter values from database.

    Args:
        filter_conditions (tuple): query filters
        accept_elements (list of list, optional): element names per dimension
        alternative_to_execution (dict): mapping from alternative id to scenario execution
        subquery (Alias): parameter value subquery
        db_map (DatabaseMapping): database mapping

    Returns:
        dict: parameter value records
    """

    records = []
    for row in db_map.query(subquery).filter(and_(*filter_conditions)):
        elements = row.element_name_list.split(",") if row.element_name_list else [row.entity_name]
        if (
            accept_elements is not None
            and _reject_elements(elements, accept_elements)
        ):
            continue
        try:
            execution = alternative_to_execution[row.alternative_id]
        except KeyError:
            raise FlexToolException(f"No execution for alternative id.")
        dimensions = row.dimension_name_list.split(",") if row.dimension_name_list else [row.entity_class_name]
        record = {
            "class": row.entity_class_name,
            "object_classes": dimensions,
            "objects": elements,
            "parameter": row.parameter_definition_name,
            "scenario": execution.scenario.name,
            "time_stamp": execution.execution_time.isoformat(),
            "type": row.type,
            "value": str(row.value, encoding="utf-8"),
        }
        records.append(record)
    return records


def _query_parameter_dimensions(filter_conditions, subquery, db_map):
    """Reads parameter value dimensions from the first suitable parameter value found in database.

    Args:
        filter_conditions (tuple): query filters
        subquery (Alias): parameter value subquery
        db_map (DatabaseMappingBase):

    Returns:
        list: dimension records
    """
    dimensions = {}
    queried_fingerprints = set()
    for row in db_map.query(subquery).filter(and_(*filter_conditions)):
        fingerprint = (row.entity_class_name, row.parameter_definition_name, row.alternative_id)
        if fingerprint in queried_fingerprints:
            continue
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
                entity_class_name = row.entity_class_name
                parameter = row.parameter_definition_name
                if (entity_class_name, parameter) not in existing_class_and_parameter:
                    existing["class_names"].append(entity_class_name)
                    existing["parameter_names"].append(parameter)
            else:
                dimensions[name] = {
                    "index_name": name,
                    "indexes": sorted(index),
                    "depth": i,
                    "class_names": [row.entity_class_name],
                    "parameter_names": [row.parameter_definition_name],
                }
    return list(dimensions.values())


def _make_entity_filter(entity_classes, parameters, alternative_ids, subquery):
    """Creates object parameter value query filters.

    Args:
        entity_classes (list of str): entity class names
        parameters (list of str): parameter definition names
        alternative_ids (list of int): alternative ids
        subquery (Alias): object parameter value subquery

    Returns:
        tuple: query filters
    """
    filters = ()
    if entity_classes:
        filters = filters + (subquery.c.entity_class_name.in_(entity_classes),)
    if parameters:
        filters = filters + (subquery.c.parameter_definition_name.in_(parameters),)
    if alternative_ids:
        filters = filters + (subquery.c.alternative_id.in_(alternative_ids),)
    return filters


def _reject_elements(elements, acceptable_elements):
    """Returns True if any element in element list is not
    in any corresponding list of acceptable_elements.

    Args:
        elements (list of str): element names
        acceptable_elements (list of list): acceptable element names per dimension

    Return:
        bool: True if elements should be discarded, False otherwise
    """
    for element, acceptables in zip(elements, acceptable_elements):
        if acceptables and element not in acceptables:
            return True
    return False


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


def get_default_plot_specification(project, body):
    """Sends the default plot specification to client.

    Args:
        project (Project): a project
        body (dict): request body

    Returns:
        HTTPResponse: a response object
    """
    category = get_and_validate(body, "category", str)
    specification_path = project.default_plot_specification_path(category)
    if not specification_path.exists():
        return JsonResponse({"plot_specification": json.dumps({"plots": []})})
    return JsonResponse(
        {"plot_specification": specification_path.read_text(encoding="utf-8")}
    )


def get_custom_plot_specification_names(project, body):
    """Sends the names of all custom plot specifications to client.

    Args:
        project (Project): a project
        body (dict): request body

    Returns:
        HTTPResponse: a response object
    """
    category = get_and_validate(body, "category", str)
    specification_directory = project.custom_plot_specification_directory(category)
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
    category = get_and_validate(body, "category", str)
    specification_directory = project.custom_plot_specification_directory(category)
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
    category = get_and_validate(body, "category", str)
    plot_specification = get_and_validate(body, "specification", dict)
    specification_path = project.default_plot_specification_path(category)
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
    category = get_and_validate(body, "category", str)
    plot_specification = get_and_validate(body, "specification", dict)
    specification_directory = project.custom_plot_specification_directory(category)
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
    category = get_and_validate(body, "category", str)
    specification_directory = project.custom_plot_specification_directory(category)
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
    category = get_and_validate(body, "category", str)
    specification_directory = project.custom_plot_specification_directory(category)
    specification_path = specification_directory / (name + ".json")
    if not specification_path.exists():
        return HttpResponseBadRequest("Specification not found.")
    target_path = specification_path.parent / (new_name + ".json")
    if target_path.exists():
        return JsonResponse({"status": "exists"})
    specification_path.rename(target_path)
    return JsonResponse({"status": "ok"})
