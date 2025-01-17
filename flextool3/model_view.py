"""Utilities and helpers for the model interface."""
from django.http import (
    HttpResponseBadRequest,
    JsonResponse,
)
from django.urls import reverse
from spinedb_api import (
    to_database,
    SpineIntegrityError,
    SpineDBAPIError,
)
from .exception import FlexToolException
from .subquery import parameter_definition_sq, parameter_value_sq, wide_entity_class_sq, wide_entity_sq
from .utils import Database, database_map, get_and_validate, Key


def get_object_classes(project, database):
    """Queries object classes in one of project's databases.

    Args:
        project (Project): target project
        database (Database): target database

    Returns:
        HttpResponse: object classes
    """
    classes = []
    with database_map(project, database) as db_map:
        subquery = wide_entity_class_sq(db_map)
        for row in db_map.query(subquery).filter(subquery.dimension_name_list == ""):
            classes.append({
                "name": row.name,
                "description": row.description,
            })
    return JsonResponse({"classes": classes})


def get_objects(project, database, request_body):
    """Queries objects in one of project's databases.

    Optional entries in request body:

    - 'object_class_name': object class name for filtering

    Args:
        project (Project): target project
        database (Database): target database
        request_body (dict): request body

    Returns:
        HttpResponse: objects
    """
    class_name = request_body.get(Key.OBJECT_CLASS_NAME.value)
    if class_name is not None and not isinstance(class_name, str):
        return HttpResponseBadRequest(f"Wrong '{Key.OBJECT_CLASS_NAME}' data type.")
    with database_map(project, database) as db_map:
        subquery = db_map.query(
            db_map.entity_sq.c.name
        ).subquery()
        if class_name is not None:
            subquery = (
                db_map.query(subquery)
                .filter(subquery.c.entity_class_name == class_name)
                .subquery()
            )
        objects = [
            row._asdict() for row in db_map.query(subquery).order_by(subquery.c.name)
        ]
    return JsonResponse({"objects": objects})


def get_parameter_definitions(project, database, request_body):
    """Queries entity parameter definitions in one of project's databases.

    Optional entries in request body:

    - 'class_name': entity class name for filtering

    Args:
        project (Project): target project
        database (Database): target database
        request_body (dict): request body

    Returns:
        HttpResponse: entity parameter definitions
    """
    class_name = request_body.get(Key.CLASS_NAME.value)
    if class_name is not None and not isinstance(class_name, str):
        return HttpResponseBadRequest(f"Wrong '{Key.CLASS_NAME}' data type.")
    with database_map(project, database) as db_map:
        subquery = parameter_definition_sq(db_map)
        if class_name is not None:
            subquery = (
                db_map.query(subquery)
                .filter(subquery.c.entity_class_name == class_name)
                .subquery()
            )
        definitions = [
            row._asdict() for row in db_map.query(subquery).order_by(subquery.c.name)
        ]
    for definition in definitions:
        value_bytes = definition["default_value"]
        if value_bytes is not None:
            definition["default_value"] = str(value_bytes, encoding="utf-8")
    return JsonResponse({"definitions": definitions})


def get_parameter_values(project, database, request_body):
    """Queries entity parameter values in one of project's databases.

    Optional entries in request body:

    - 'class_name': entity class name for filtering
    - 'entity_name': entity name for filtering
    - 'alternative_name' alternative id for filtering

    Args:
        project (Project): target project
        database (Database): target database
        request_body (dict): request body

    Returns:
        HttpResponse: parameter values
    """
    try:
        class_name = get_and_validate(
            request_body, Key.CLASS_NAME.value, str, required=False
        )
        entity_name = get_and_validate(
            request_body, Key.ENTITY_NAME.value, str, required=False
        )
        alternative_name = get_and_validate(
            request_body, Key.ALTERNATIVE_NAME.value, str, required=False
        )
    except FlexToolException as error:
        return HttpResponseBadRequest(str(error))
    with database_map(project, database) as db_map:
        subquery = parameter_value_sq(db_map)
        if class_name is not None:
            subquery = (
                db_map.query(subquery)
                .filter(subquery.c.entity_class_name == class_name)
                .subquery()
            )
        if entity_name is not None:
            subquery = (
                db_map.query(subquery)
                .filter(subquery.c.entity_name == entity_name)
                .subquery()
            )
        if alternative_name is not None:
            subquery = (
                db_map.query(subquery)
                .filter(subquery.c.alternative_name == alternative_name)
                .subquery()
            )
        values = [row._asdict() for row in db_map.query(subquery)]
        for value in values:
            value_bytes = value["value"]
            if value_bytes is not None:
                value["value"] = str(value_bytes, encoding="utf-8")
        return JsonResponse({"values": values})


def get_relationship_classes(project, database):
    """Queries relationship classes in one of project's databases.

    Args:
        project (Project): target project
        database (Database): target database

    Returns:
        HttpResponse: relationship classes
    """
    classes = []
    with database_map(project, database) as db_map:
        subquery = wide_entity_class_sq(db_map)
        for row in db_map.query(subquery).filter(subquery.c.element_name_list != ""):
            classes.append({
                "name": row.name,
                "description": row.description,
            })
    return JsonResponse({"classes": classes})


def _possible_elements(db_map, class_name):
    """Gather's names of all objects that qualify for elements for given relationship class.

    Args:
        db_map (DatabaseMapping): database map
        class_name (str): relationship class name

    Returns:
        list of list: object names;
            the dicts are sorted by relationship dimension
    """
    subquery = wide_entity_class_sq(db_map)
    dimensions = db_map.query(subquery).filter(subquery.c.name == class_name).first.dimension_name_list.split(",")
    objects = []
    subquery = db_map.query(db_map.entity_sq, db_map.entity_class_sq.c.name.label("entity_class_name")).join(db_map.entity_class_sq, db_map.entity_sq.c.entity_class_id == db_map.entity_class_sq.c.id).subquery()
    for dimension in dimensions:
        objects = (
            db_map.query(subquery)
            .filter(subquery.entity_class_name == dimension)
            .sort_by(subquery.name)
        )
        objects.append([o.name for o in objects])
    return objects


def get_relationships(project, database, request_body):
    """Queries relationships in one of project's databases.

    Optional entries in request body:

    - 'relationship_class_name': relationship class name for filtering

    Args:
        project (Project): target project
        database (Database): target database
        request_body (dict): request body

    Returns:
        HttpResponse: relationships
    """
    try:
        class_name = get_and_validate(
            request_body, Key.RELATIONSHIP_CLASS_NAME.value, str, required=False
        )
    except FlexToolException as error:
        return HttpResponseBadRequest(str(error))
    with database_map(project, database) as db_map:
        subquery = wide_entity_class_sq(db_map)
        if class_name is not None:
            subquery = (
                db_map.query(subquery)
                .filter(subquery.c.entity_class_name == class_name)
                .subquery()
            )
        relationships = [
            {"objects": row.element_name_list.split(",")}
            for row in db_map.query(subquery).order_by(
                subquery.c.name
            )
        ]
        return JsonResponse({"relationships": relationships})


def get_available_relationship_objects(project, request_body):
    """Queries objects of relationship's object classes in model database.

    Required entries in request body:

    - 'relationship_class_name': relationship class name

    Args:
        project (Project): target project
        request_body (dict): request body

    Returns:
        HttpResponse: lists of names of available objects for each relationship dimension
    """
    class_name = get_and_validate(request_body, Key.RELATIONSHIP_CLASS_NAME.value, str)
    with database_map(project, Database.MODEL) as db_map:
        available_objects = []
        for names in _possible_elements(db_map, class_name):
            available_objects.append(names)
        return JsonResponse({"available_objects": available_objects})


def get_parameter_value_lists(project, request_body):
    """Queries parameter value lists in model database.

    Optional entries in request body:

    - 'value_list_names': list of parameter list names for filtering

    Args:
        project (Project): target project
        request_body (dict): request body

    Returns:
        HttpResponse: parameter value lists
    """

    def concatenate_bag(bag):
        skeleton = len(bag) * [None]
        for index, value in bag.items():
            skeleton[index] = value
        return skeleton

    try:
        list_names = get_and_validate(
            request_body, Key.VALUE_LIST_NAMES.value, list, required=False
        )
    except FlexToolException as error:
        return HttpResponseBadRequest(str(error))
    if list_names is not None and any(not isinstance(name, str) for name in list_names):
        return HttpResponseBadRequest(f"Wrong data type in '{Key.VALUE_LIST_NAMES}'.")
    with database_map(project, Database.MODEL) as db_map:
        subquery = db_map.query(
            db_map.ord_list_value_sq,
            db_map.parameter_value_list_sq.c.name.label("parameter_value_list_name")
        ).join(db_map.parameter_value_list_sq, db_map.ord_value_list_sq.c.parameter_value_list_id == db_map.parameter_value_list_sq.c.id).subquery()
        if list_names is not None:
            subquery = (
                db_map.query(subquery)
                .filter(subquery.c.parameter_value_list_name.in_(list_names))
                .subquery()
            )
        value_list_items = db_map.query(subquery).all()
        collected_values = {}
        collected_types = {}
        for list_item in value_list_items:
            bag_of_values = collected_values.setdefault(
                list_item.parameter_value_list_name, {}
            )
            bag_of_values[list_item.index] = str(list_item.value, encoding="utf-8")
            bag_of_types = collected_types.setdefault(
                list_item.parameter_value_list_name, {}
            )
            bag_of_types[list_item.index] = list_item.type
        concatenated_values = {
            list_name: concatenate_bag(bag) for list_name, bag in collected_values.items()
        }
        concatenated_types = {
            list_name: concatenate_bag(bag) for list_name, bag in collected_types.items()
        }
        value_lists = []
        for list_item in value_list_items:
            values = concatenated_values.pop(list_item.parameter_value_list_name, None)
            if values is None:
                continue
            dictified = {
                "name": list_item.parameter_value_list_name,
                "value_list": values,
                "type_list": concatenated_types.pop(list_item.parameter_value_list_name),
            }
            value_lists.append(dictified)
        return JsonResponse({"lists": value_lists})


def get_commits(project):
    """Queries commits in model database.

    Args:
        project (Project): target project

    Returns:
        HttpResponse: commits
    """
    with database_map(project, Database.MODEL) as db_map:
        commits = [row._asdict() for row in db_map.query(db_map.commit_sq)]
        # The last commit is always a dummy one.
        return JsonResponse({"commits": commits})


def make_base_alternative(project):
    """Creates and commits a 'Base' alternative if no alternative exists.

    Args:
        project (Project): target project

    Returns:
        HttpResponse: status or error message
    """
    with database_map(project, Database.MODEL) as db_map:
        if db_map.query(db_map.alternative_sq).all():
            return JsonResponse({"inserted": []})
        try:
            _insert_alternatives(db_map, {"alternative": [{"name": "Base"}]})
        except FlexToolException as error:
            return HttpResponseBadRequest(
                f"Failed to create 'Base' alternative: {error}"
            )
        try:
            db_map.commit_session("Add Base alternative.")
        except SpineDBAPIError as error:
            return HttpResponseBadRequest(f"Failed to commit: {error}")
        return JsonResponse(
            {
                "alternatives": [
                    row._asdict()
                    for row in db_map.query(db_map.alternative_sq).order_by(
                        db_map.alternative_sq.c.name
                    )
                ]
            }
        )


def commit(project, request_body):
    """Updates model database.

    Args:
        project (Project): target project
        request_body (dict): request body

    Returns:
        HttpResponse: commit status or error message
    """
    try:
        commit_message = get_and_validate(request_body, "message", str)
    except FlexToolException as error:
        return HttpResponseBadRequest(str(error))
    with database_map(project, Database.MODEL) as db_map:
        try:
            _delete_from_model(db_map, request_body)
            inserted = _insert_to_model(db_map, request_body)
            _update_model(db_map, request_body)
        except SpineIntegrityError as error:
            return HttpResponseBadRequest(f"Database integrity error: {error}")
        except FlexToolException as error:
            return HttpResponseBadRequest(str(error))
        try:
            db_map.commit_session(commit_message)
        except SpineDBAPIError as error:
            return HttpResponseBadRequest(f"Failed to commit: {error}")
        for item_type, items in inserted.items():
            inserted[item_type] = {name: id_.db_id for name, id_ in items.items()}
        return JsonResponse({"inserted": inserted} if inserted else {})


def _update_model(db_map, request_body):
    """Updates model database.

    Args:
        db_map (DatabaseMapping): database mapping
        request_body (dict): request body
    """
    updates = get_and_validate(request_body, "updates", dict, required=False)
    if updates is None:
        return
    class_name = get_and_validate(request_body, Key.CLASS_NAME.value, str, required=False)
    _update_alternatives(db_map, updates)
    _update_scenarios(db_map, updates)
    _update_scenario_alternatives(db_map, updates)
    _update_objects(db_map, updates, class_name)
    _update_relationships(db_map, updates, class_name)
    _update_parameter_values(db_map, updates, class_name)


def _delete_from_model(db_map, request_body):
    """Deletes items from model database.

    Args:
        db_map (DatabaseMapping): database mapping
        request_body (dict): request body
    """
    deletions = get_and_validate(request_body, "deletions", dict, required=False)
    if deletions is None:
        return
    for item_type, unique_keys in deletions.items():
        item = db_map.get_item(item_type, **unique_keys)
        item.remove()


def _insert_to_model(db_map, request_body):
    """Inserts items to model database.

    Args:
        db_map (DatabaseMapping): database mapping
        request_body (dict): request body

    Returns:
        dict of dict: inserted item ids
    """
    insertions = get_and_validate(request_body, "insertions", dict, required=False)
    if insertions is None:
        return {}
    class_name = get_and_validate(request_body, Key.CLASS_NAME.value, str, required=False)
    inserted = {}
    inserted_alternatives = _insert_alternatives(db_map, insertions)
    if inserted_alternatives:
        inserted["alternative"] = inserted_alternatives
    inserted_scenarios = _insert_scenarios(db_map, insertions)
    if inserted_scenarios:
        inserted["scenario"] = inserted_scenarios
    scenario_alternatives = _insert_scenario_alternatives(db_map, insertions)
    if scenario_alternatives:
        inserted["scenario_alternative"] = scenario_alternatives
    objects = _insert_objects(db_map, insertions, class_name)
    if objects:
        inserted["object"] = objects
    relationships = _insert_relationships(db_map, insertions, class_name)
    if relationships:
        inserted["relationship"] = relationships
    _insert_parameter_values(db_map, insertions, class_name)
    return inserted


def _update_alternatives(db_map, updates):
    """Updates alternatives in model database.

    Args:
        db_map (DatabaseMapping): database mapping
        updates (dict): database updates
    """
    alternative_updates = get_and_validate(updates, "alternative", list, required=False)
    if not alternative_updates:
        return
    try:
        for update in alternative_updates:
            name = get_and_validate(update, "name", str)
            updated_name: get_and_validate(update, "updated_name", str)
            alternative = db_map.get_alternative_item(name=name)
            _, error = alternative.update(name=updated_name)
            if error:
                raise FlexToolException(f"Errors while updating alternative {name}: {error}.")
    except SpineIntegrityError as error:
        raise FlexToolException(f"Database integrity error: {error}") from error


def _update_scenarios(db_map, updates):
    """Updates scenarios in model database.

    Args:
        db_map (DatabaseMapping): database mapping
        updates (dict): database updates
    """
    scenario_updates = get_and_validate(updates, "scenario", list, required=False)
    if not scenario_updates:
        return
    try:
        for update in scenario_updates:
            name = get_and_validate(update, "name", str)
            updated_name = get_and_validate(update, "updated_name", str)
            scenario = db_map.get_scenario_item(name=name)
            _, error = scenario.update("scenario", name=updated_name, strict=True)
            if error:
                raise FlexToolException(f"Error while renaming scenario {name}: {error}.")
    except SpineIntegrityError as error:
        raise FlexToolException(f"Database integrity error: {error}") from error


def _update_scenario_alternatives(db_map, updates):
    """Updates scenario alternatives in model database.

    Args:
        db_map (DatabaseMapping): database mapping
        updates (dict): database updates
    """
    scenario_alternative_updates = get_and_validate(
        updates, "scenario_alternative", list, required=False
    )
    if not scenario_alternative_updates:
        return
    try:
        for update in scenario_alternative_updates:
            scenario_name =  get_and_validate(update, "scenario_name", str)
            alternative_name = get_and_validate(update, "alternative_name", str)
            updated_alternative_name = get_and_validate(update, "updated_alternative_name", str)
            rank = get_and_validate(update, "rank", int)
            scenario_alternative = db_map.get_scenario_alternative_item(scenario_name=scenario_name, alternative_name=alternative_name, rank=rank)
            _, error = scenario_alternative.update(alternative_name=updated_alternative_name)
            if error:
                raise FlexToolException(f"Error while updating alternatives of scenario {scenario_name}: {error}")
    except SpineIntegrityError as error:
        raise FlexToolException(f"Database integrity error: {error}") from error


def _update_objects(db_map, updates, class_name):
    """Updates objects in model database.

    Args:
        db_map (DatabaseMapping): database mapping
        updates (dict): database updates
        class_name (str): object class name
    """
    object_updates = get_and_validate(updates, "object", list, required=False)
    if not object_updates:
        return
    try:
        for update in object_updates:
            name = get_and_validate(update, "name", str)
            updated_name = get_and_validate(update, "updated_name", str)
            entity = db_map.get_entity_item(name=name, entity_class_name=class_name)
            _, error = entity.update(name=updated_name)
            if error:
                raise FlexToolException(f"Error while renaming object {name}: {error}")
    except SpineIntegrityError as error:
        raise FlexToolException(f"Database integrity error: {error}") from error


def _update_relationships(db_map, updates, class_name):
    """Updates relationships in model database.

    Args:
        db_map (DatabaseMapping): database mapping
        updates (dict): database updates
        class_name (str): relationship class name
    """
    relationship_updates = get_and_validate(
        updates, "relationship", list, required=False
    )
    if not relationship_updates:
        return
    if class_name is None:
        raise FlexToolException("'class_name' is required when updating relationships.")
    sterilized_updates = []
    object_ids = _possible_elements(db_map, class_name)
    for update in relationship_updates:
        object_names = get_and_validate(update, "object_name_list", list)
        object_id_list = [
            object_ids[dimension][object_names[dimension]]
            for dimension, ids in enumerate(object_ids)
        ]
        sterilized = {
            "id": get_and_validate(update, "id", int),
            "name": get_and_validate(update, "name", str),
            "entity_id_list": object_id_list,
        }
        sterilized_updates.append(sterilized)
    del relationship_updates  # Don't use updates from this point onwards.
    try:
        _, errors = db_map.update_items("entity", *sterilized_updates, strict=True)
        if errors:
            raise FlexToolException("Errors while updating relationships.")
    except SpineIntegrityError as error:
        raise FlexToolException(f"Database integrity error: {error}") from error


def _update_parameter_values(db_map, updates):
    """Updates parameter values in model database.

    Args:
        db_map (DatabaseMapping): database mapping
        updates (dict): database updates
    """
    value_updates = get_and_validate(updates, "parameter_value", list, required=False)
    if not value_updates:
        return
    sterilized_updates = []
    for update in value_updates:
        sterilized = {}
        try:
            sterilized["id"] = update["id"]
            value = update["value"]
            value = _convert_ints_to_floats(value)
            sterilized["type"] = (
                None if not isinstance(value, dict) else value.pop("type")
            )
            sterilized["value"], _ = to_database(value)
        except KeyError as missing:
            raise FlexToolException(f"Missing'{missing}'.") from missing
        sterilized_updates.append(sterilized)
    del value_updates  # Don't use updates from this point onwards.
    try:
        _, errors = db_map.update_items("parameter_value", *sterilized_updates, strict=True)
        if errors:
            raise FlexToolException("Errors while updating values.")
    except SpineIntegrityError as error:
        raise FlexToolException(f"Database integrity error: {error}") from error


def _insert_alternatives(db_map, insertions):
    """Inserts alternatives into model database.

    Args:
        db_map (DatabaseMapping): database mapping
        insertions (dict): database insertions

    Returns:
        dict: inserted alternative ids keyed by their names
    """
    alternative_insertions = get_and_validate(
        insertions, "alternative", list, required=False
    )
    if not alternative_insertions:
        return {}
    sterilized_insertions = [
        {"name": get_and_validate(insertion, "name", str)}
        for insertion in alternative_insertions
    ]
    try:
        inserted, errors = db_map.add_items(
            "alternative", *sterilized_insertions, strict=True
        )
        if errors:
            raise FlexToolException("Errors while inserting alternatives.")
    except SpineIntegrityError as error:
        raise FlexToolException(f"Database integrity error: {error}") from error
    return {i["name"]: i["id"] for i in inserted}


def _insert_scenarios(db_map, insertions):
    """Inserts scenarios into model database.

    Args:
        db_map (DatabaseMapping): database mapping
        insertions (dict): database insertions

    Returns:
        dict: inserted scenario ids keyed by their names
    """
    scenario_insertions = get_and_validate(insertions, "scenario", list, required=False)
    if not scenario_insertions:
        return {}
    sterilized_insertions = [
        {"name": get_and_validate(insertion, "name", str)}
        for insertion in scenario_insertions
    ]
    try:
        inserted, errors = db_map.add_items(
            "scenario", *sterilized_insertions, strict=True
        )
        if errors:
            raise FlexToolException("Errors while inserting scenarios.")
    except SpineIntegrityError as error:
        raise FlexToolException(f"Database integrity error: {error}") from error
    return {i["name"]: i["id"] for i in inserted}


def _insert_scenario_alternatives(db_map, insertions):
    """Inserts scenario alternatives into model database.

    Args:
        db_map (DatabaseMapping): database mapping
        insertions (dict): database insertions

    Returns:
        dict: inserted scenario alternative ids keyed by scenario names and ranks
    """
    scenario_alternative_insertions = get_and_validate(
        insertions, "scenario_alternative", list, required=False
    )
    if not scenario_alternative_insertions:
        return {}
    scenario_ids = {row.name: row.id for row in db_map.query(db_map.scenario_sq)}
    scenario_names = {id_: name for name, id_ in scenario_ids.items()}
    alternative_ids = {row.name: row.id for row in db_map.query(db_map.alternative_sq)}
    sterilized_insertions = [
        {
            "scenario_id": scenario_ids[
                get_and_validate(insertion, "scenario_name", str)
            ],
            "alternative_id": alternative_ids[
                get_and_validate(insertion, "alternative_name", str)
            ],
            "rank": get_and_validate(insertion, "rank", int),
        }
        for insertion in scenario_alternative_insertions
    ]
    try:
        inserted, errors = db_map.add_items(
            "scenario_alternative", *sterilized_insertions, strict=True
        )
        if errors:
            raise FlexToolException("Errors while inserting scenario alternatives.")
    except SpineIntegrityError as error:
        raise FlexToolException(f"Database integrity error: {error}") from error
    ids = {}
    for i in inserted:
        ids.setdefault(scenario_names[i["scenario_id"]], {})[i["rank"]] = i["id"]
    return ids


def _insert_objects(db_map, insertions, class_id):
    """Inserts objects into model database.

    Args:
        db_map (DatabaseMapping): database mapping
        insertions (dict): database insertions
        class_id (int): object class id

    Returns:
        dict: inserted object ids keyed by object names
    """
    object_insertions = get_and_validate(insertions, "object", list, required=False)
    if not object_insertions:
        return {}
    if class_id is None:
        raise FlexToolException("'class_id' is required for object insertions")
    sterilized_insertions = []
    for insertion in object_insertions:
        name = get_and_validate(insertion, "name", str)
        sterilized = {"name": name, "class_id": class_id}
        sterilized_insertions.append(sterilized)
    try:
        inserted, errors = db_map.add_items(
            "entity", *sterilized_insertions, strict=True
        )
        if errors:
            raise FlexToolException("Errors while inserting objects.")
    except SpineIntegrityError as error:
        raise FlexToolException(f"Database integrity error: {error}") from error
    return {i["name"]: i["id"] for i in inserted}


def _insert_relationships(db_map, insertions, class_id):
    """Inserts objects into model database.

    Args:
        db_map (DatabaseMapping): database mapping
        insertions (dict): database insertions
        class_id (int): relationship class id

    Returns:
        dict: inserted object ids keyed by object names
    """
    relationship_insertions = get_and_validate(
        insertions, "relationship", list, required=False
    )
    if not relationship_insertions:
        return {}
    if class_id is None:
        raise FlexToolException("'class_id' is required for relationship insertions")
    sterilized_insertions = []
    object_ids = _possible_elements(db_map, class_id)
    for insertion in relationship_insertions:
        object_names = get_and_validate(insertion, "object_name_list", list)
        object_id_list = [
            object_ids[dimension][object_names[dimension]]
            for dimension, ids in enumerate(object_ids)
        ]
        name = get_and_validate(insertion, "name", str)
        sterilized = {
            "name": name,
            "class_id": class_id,
            "entity_id_list": object_id_list,
        }
        sterilized_insertions.append(sterilized)
    try:
        inserted, errors = db_map.add_items(
            "entity", *sterilized_insertions, strict=True
        )
        if errors:
            raise FlexToolException("Errors while inserting relationships.")
    except SpineIntegrityError as error:
        raise FlexToolException(f"Database integrity error: {error}") from error
    return {i["name"]: i["id"] for i in inserted}


def _insert_parameter_values(db_map, insertions, class_id):
    """Inserts parameter values into model database.

    Args:
        db_map (DatabaseMapping): database mapping
        insertions (dict): database insertions
        class_id (int): entity class id
    """
    value_insertions = get_and_validate(
        insertions, "parameter_value", list, required=False
    )
    if not value_insertions:
        return
    if class_id is None:
        raise FlexToolException("'class_id' is required for parameter value insertions")
    sterilized_insertions = []
    definition_ids = set()
    for insertion in value_insertions:
        definition_id = get_and_validate(insertion, "definition_id", int)
        definition_ids.add(definition_id)
        value = get_and_validate(insertion, "value", (str, float, int, dict))
        value = _convert_ints_to_floats(value)
        value_type = None if not isinstance(value, dict) else value.pop("type")
        database_value, _ = to_database(value)
        sterilized = {
            "entity_class_id": class_id,
            "entity_byname": get_and_validate(insertion, "objects", list),
            "parameter_definition_id": definition_id,
            "alternative_id": get_and_validate(insertion, "alternative_id", int),
            "value": database_value,
            "type": value_type,
        }
        sterilized_insertions.append(sterilized)
    try:
        _, errors = db_map.add_items(
            "parameter_value", *sterilized_insertions, strict=True
        )
        if errors:
            raise FlexToolException("Errors while inserting values.")
    except SpineIntegrityError as error:
        raise FlexToolException(f"Database integrity error: {error}") from error


def get_class_set(project, object_class_names):
    """Queries object and relationship classes by object class names in model database.

    Args:
        project (Project): target project
        object_class_names (set of str): set's object class names

    Returns:
        HttpResponse: physical entity classes
    """

    def relationship_class_rows_as_dicts(rows):
        relationships = [row._asdict() for row in rows]
        for relationship in relationships:
            relationship["entitiesUrl"] = reverse(
                "flextool3:entities",
                kwargs=dict(project_id=project.id, class_id=relationship["id"]),
            )
        return relationships

    with database_map(project, Database.MODEL) as db_map:
        object_class_rows = iter(
            db_map.query(db_map.entity_class_sq)
            .filter(db_map.entity_class_sq.c.name.in_(object_class_names))
            .order_by(db_map.entity_class_sq.c.name)
        )
        object_classes = []
        relationship_classes = {}
        for object_class_row in object_class_rows:
            object_class_dict = object_class_row._asdict()
            object_class_dict["entitiesUrl"] = reverse(
                "flextool3:entities",
                kwargs=dict(project_id=project.id, class_id=object_class_row.id),
            )
            object_classes.append(object_class_dict)
            relationship_class_ids = {
                row.id
                for row in db_map.query(db_map.entity_class_dimension_sq)
                .filter(db_map.entity_class_dimension_sq.c.dimension == 0)
                .filter(
                    db_map.entity_class_dimension_sq.c.dimension_id
                    == object_class_row.id
                )
            }
            relationship_class_rows = iter(
                db_map.query(db_map.wide_entity_class_sq)
                .filter(
                    db_map.wide_entity_class_sq.c.id.in_(relationship_class_ids)
                )
                .order_by(db_map.wide_entity_class_sq.c.name)
            )
            relationship_classes[
                object_class_row.id
            ] = relationship_class_rows_as_dicts(relationship_class_rows)
        return JsonResponse(
            {
                "objectClasses": object_classes,
                "relationshipClasses": relationship_classes,
            }
        )


def get_alternatives(project, database):
    """Queries alternatives in one of project's databases.

    Args:
        project (Project): target project
        database (Database): target database

    Returns:
        HttpResponse: alternatives
    """
    with database_map(project, database) as db_map:
        return JsonResponse(
            {
                "alternatives": [
                    row._asdict()
                    for row in db_map.query(db_map.alternative_sq).order_by(
                        db_map.alternative_sq.c.name
                    )
                ]
            }
        )


def get_scenarios(project):
    """Queries scenarios and scenario alternatives in model database.

    Args:
        project (Project): target project

    Returns:
        HttpResponse: scenarios and scenario alternatives
    """
    with database_map(project, Database.MODEL) as db_map:
        scenario_alternatives = {}
        scenario_ids = {}
        for row in db_map.query(db_map.ext_scenario_sq).order_by(
            db_map.ext_scenario_sq.c.name, db_map.ext_scenario_sq.c.rank
        ):
            if row.alternative_name is not None:
                scenario_alternatives.setdefault(row.name, []).append(
                    row.alternative_name
                )
            else:
                scenario_alternatives[row.name] = []
            scenario_ids[row.name] = row.id
        scenario_data = []
        for scenario_name, alternatives in scenario_alternatives.items():
            scenario_data.append(
                {
                    "scenario_id": scenario_ids[scenario_name],
                    "scenario_name": scenario_name,
                    "scenario_alternatives": alternatives,
                }
            )
        return JsonResponse({"scenarios": scenario_data})


def _convert_ints_to_floats(value):
    """Converts integers to floats in-place in indexed values.

    Args:
        value (Any): parameter value

    Returns:
        Any: value converted to float
    """
    if isinstance(value, int):
        return float(value)
    if not isinstance(value, dict):
        return value
    type_ = value["type"]
    if type_ == "map":
        data = [[x, float(y) if isinstance(y, int) else y] for x, y in value["data"]]
        value["data"] = data
    elif type == "array":
        data = [float(y) if isinstance(y, int) else y for y in value["data"]]
        value["data"] = data
    return value
