from django.http import (
    HttpResponse,
    HttpResponseBadRequest,
    JsonResponse,
)
from django.urls import reverse
from spinedb_api import (
    DatabaseMapping,
    to_database,
    SpineIntegrityError,
    SpineDBAPIError,
)
from .exception import FlextoolException
from .utils import Database, database_map, get_and_validate, Key


def get_object_classes(project, database):
    """Queries object classes in one of project's database.

    Args:
        project (Project): target project
        database (Database): target database

    Returns:
        HttpResponse: object classes
    """
    with database_map(project, database) as db_map:
        classes = [row._asdict() for row in db_map.query(db_map.object_class_sq)]
        return JsonResponse({"classes": classes})


def get_objects(project, database, request_body):
    """Queries objects in one of project's databases.

    Optional entries in request body:

    - 'object_class_id': object class id for filtering

    Args:
        project (Project): target project
        database (Database): target database
        request_body (dict): request body

    Returns:
        HttpResponse: objects
    """
    class_id = request_body.get(Key.OBJECT_CLASS_ID.value)
    if class_id is not None and not isinstance(class_id, int):
        return HttpResponseBadRequest(f"Wrong '{Key.OBJECT_CLASS_ID}' data type.")
    with database_map(project, database) as db_map:
        sq = db_map.object_sq
        if class_id is not None:
            sq = db_map.query(sq).filter(sq.c.class_id == class_id).subquery()
        objects = [row._asdict() for row in db_map.query(sq).order_by(sq.c.name)]
        return JsonResponse({"objects": objects})


def get_parameter_definitions(project, database, request_body):
    """Queries entity parameter definitions in one of project's databases.

    Optional entries in request body:

    - 'class_id': entity class id for filtering

    Args:
        project (Project): target project
        database (Database): target database
        request_body (dict): request body

    Returns:
        HttpResponse: entity parameter definitions
    """
    class_id = request_body.get(Key.CLASS_ID.value)
    if class_id is not None and not isinstance(class_id, int):
        return HttpResponseBadRequest(f"Wrong '{Key.CLASS_ID}' data type.")
    with database_map(project, database) as db_map:
        sq = db_map.parameter_definition_sq
        if class_id is not None:
            sq = db_map.query(sq).filter(sq.c.entity_class_id == class_id).subquery()
        definitions = [row._asdict() for row in db_map.query(sq).order_by(sq.c.name)]
        for definition in definitions:
            value_bytes = definition["default_value"]
            if value_bytes is not None:
                definition["default_value"] = str(value_bytes, encoding="utf-8")
        return JsonResponse({"definitions": definitions})


def get_parameter_values(project, database, request_body):
    """Queries entity parameter values in one of project's databases.

    Optional entries in request body:

    - 'class_id': entity class id for filtering
    - 'entity_id': entity id for filtering, ignored if entity_class_id is given
    - 'alternative_id' alternative id for filtering

    Args:
        project (Project): target project
        database (Database): target database
        request_body (dict): request body

    Returns:
        HttpResponse: parameter values
    """
    try:
        class_id = get_and_validate(
            request_body, Key.CLASS_ID.value, int, required=False
        )
        entity_id = get_and_validate(
            request_body, Key.ENTITY_ID.value, int, required=False
        )
        alternative_id = get_and_validate(
            request_body, Key.ALTERNATIVE_ID.value, int, required=False
        )
    except FlextoolException as error:
        return HttpResponseBadRequest(str(error))
    with database_map(project, database) as db_map:
        sq = db_map.parameter_value_sq
        if class_id is not None:
            sq = db_map.query(sq).filter(sq.c.entity_class_id == class_id).subquery()
        elif entity_id is not None:
            sq = db_map.query(sq).filter(sq.c.entity_id == entity_id).subquery()
        if alternative_id is not None:
            sq = (
                db_map.query(sq)
                .filter(sq.c.alternative_id == alternative_id)
                .subquery()
            )
        values = [row._asdict() for row in db_map.query(sq)]
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
    with database_map(project, database) as db_map:
        classes = [
            row._asdict() for row in db_map.query(db_map.ext_relationship_class_sq)
        ]
        return JsonResponse({"classes": classes})


def _relationship_object_ids(db_map, class_id):
    """Gather's names and ids of all objects that belong to relationship class' dimensions.

    Args:
        db_map (DatabaseMapping): database map
        class_id (int): relationship class id

    Returns:
        list of dict: dicts of object ids keyed by names; the dicts are sorted by relationship dimension
    """
    class_components = (
        db_map.query(db_map.ext_relationship_class_sq)
        .filter(db_map.ext_relationship_class_sq.c.id == class_id)
        .order_by(db_map.ext_relationship_class_sq.c.dimension)
        .all()
    )
    object_ids = list()
    for component in class_components:
        objects = (
            db_map.query(db_map.object_sq)
            .filter(db_map.object_sq.c.class_id == component.object_class_id)
            .all()
        )
        object_ids.append({o.name: o.id for o in objects})
    return object_ids


def get_relationships(project, database, request_body):
    """Queries relationships in one of project's databases.

    Optional entries in request body:

    - 'relationship_class_id': relationship class id for filtering

    Args:
        project (Project): target project
        database (Database): target database
        request_body (dict): request body

    Returns:
        HttpResponse: relationships
    """
    try:
        class_id = get_and_validate(
            request_body, Key.RELATIONSHIP_CLASS_ID.value, int, required=False
        )
    except FlextoolException as error:
        return HttpResponseBadRequest(str(error))
    with database_map(project, database) as db_map:
        sq = db_map.ext_relationship_sq
        if class_id is not None:
            sq = db_map.query(sq).filter(sq.c.class_id == class_id).subquery()
        relationships = [
            row._asdict()
            for row in db_map.query(sq).order_by(sq.c.name, sq.c.dimension)
        ]
        return JsonResponse({"relationships": relationships})


def get_available_relationship_objects(project, request_body):
    """Queries objects of relationship's object classes in model database.

    Required entries in request body:

    - 'relationship_class_id': relationship class id

    Args:
        project (Project): target project
        request_body (dict): request body

    Returns:
        HttpResponse: lists of names of available objects for each relationship dimension
    """
    class_id = get_and_validate(request_body, Key.RELATIONSHIP_CLASS_ID.value, int)
    with database_map(project, Database.MODEL) as db_map:
        available_objects = []
        for names_and_ids in _relationship_object_ids(db_map, class_id):
            available_objects.append(sorted(names_and_ids))
        return JsonResponse({"available_objects": available_objects})


def get_parameter_value_lists(project, request_body):
    """Queries parameter value lists in model database.

    Optional entries in request body:

    - 'value_list_ids': list of parameter list ids for filtering

    Args:
        project (Project): target project
        request_body (dict): request body

    Returns:
        HttpResponse: parameter value lists
    """

    def concatenate_bag(bag):
        skeleton = len(bag) * [None]
        for index, x in bag.items():
            skeleton[index] = x
        return skeleton

    try:
        list_ids = get_and_validate(
            request_body, Key.VALUE_LIST_IDS.value, list, required=False
        )
    except FlextoolException as error:
        return HttpResponseBadRequest(str(error))
    if list_ids is not None and any(not isinstance(id_, int) for id_ in list_ids):
        return HttpResponseBadRequest(f"Wrong data type in '{Key.VALUE_LIST_IDS}'.")
    with database_map(project, Database.MODEL) as db_map:
        sq = db_map.ord_list_value_sq
        if list_ids is not None:
            sq = (
                db_map.query(sq)
                .filter(sq.c.parameter_value_list_id.in_(list_ids))
                .subquery()
            )
        value_list_items = db_map.query(sq).all()
        collected_values = {}
        collected_types = {}
        for list_item in value_list_items:
            bag_of_values = collected_values.setdefault(
                list_item.parameter_value_list_id, {}
            )
            bag_of_values[list_item.index] = str(list_item.value, encoding="utf-8")
            bag_of_types = collected_types.setdefault(
                list_item.parameter_value_list_id, {}
            )
            bag_of_types[list_item.index] = list_item.type
        concatenated_values = {
            list_id: concatenate_bag(bag) for list_id, bag in collected_values.items()
        }
        concatenated_types = {
            list_id: concatenate_bag(bag) for list_id, bag in collected_types.items()
        }
        value_lists = []
        for list_item in value_list_items:
            values = concatenated_values.pop(list_item.parameter_value_list_id, None)
            if values is None:
                continue
            dictified = {
                "id": list_item.parameter_value_list_id,
                "value_list": values,
                "type_list": concatenated_types.pop(list_item.parameter_value_list_id),
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
    """Creates and commits an alternative called 'Base' if there aren't any alternatives in the database.

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
        except FlextoolException as e:
            return HttpResponseBadRequest(f"Failed to create 'Base' alternative: {e}")
        try:
            db_map.commit_session("Add Base alternative.")
        except SpineDBAPIError as e:
            return HttpResponseBadRequest(f"Failed to commit: {e}")
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
    except FlextoolException as error:
        return HttpResponseBadRequest(str(error))
    with database_map(project, Database.MODEL) as db_map:
        try:
            _delete_from_model(db_map, request_body)
            inserted = _insert_to_model(db_map, request_body)
            _update_model(db_map, request_body)
        except SpineIntegrityError as e:
            return HttpResponseBadRequest(f"Database integrity error: {e}")
        except FlextoolException as e:
            return HttpResponseBadRequest(str(e))
        try:
            db_map.commit_session(commit_message)
        except SpineDBAPIError as e:
            return HttpResponseBadRequest(f"Failed to commit: {e}")
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
    class_id = get_and_validate(request_body, Key.CLASS_ID.value, int, required=False)
    _update_alternatives(db_map, updates)
    _update_scenarios(db_map, updates)
    _update_scenario_alternatives(db_map, updates)
    _update_objects(db_map, updates)
    _update_relationships(db_map, updates, class_id)
    _update_parameter_values(db_map, updates)


def _delete_from_model(db_map, request_body):
    """Deletes items from model database.

    Args:
        db_map (DatabaseMapping): database mapping
        request_body (dict): request body
    """
    deletions = get_and_validate(request_body, "deletions", dict, required=False)
    if deletions is None:
        return
    try:
        converted_deletions = {key: set(value) for key, value in deletions.items()}
    except TypeError:
        raise FlextoolException("Wrong data type in deletions.")
    db_map.cascade_remove_items(cache=None, **converted_deletions)


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
    class_id = get_and_validate(request_body, Key.CLASS_ID.value, int, required=False)
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
    objects = _insert_objects(db_map, insertions, class_id)
    if objects:
        inserted["object"] = objects
    relationships = _insert_relationships(db_map, insertions, class_id)
    if relationships:
        inserted["relationship"] = relationships
    _insert_parameter_values(db_map, insertions, class_id)
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
    sterilized_updates = []
    for update in alternative_updates:
        sterilized = {
            "id": get_and_validate(update, "id", int),
            "name": get_and_validate(update, "name", str),
        }
        sterilized_updates.append(sterilized)
    try:
        _, errors = db_map.update_alternatives(*sterilized_updates, strict=True)
        if errors:
            raise FlextoolException("Errors while updating alternatives.")
    except SpineIntegrityError as error:
        raise FlextoolException(f"Database integrity error: {error}")


def _update_scenarios(db_map, updates):
    """Updates scenarios in model database.

    Args:
        db_map (DatabaseMapping): database mapping
        updates (dict): database updates
    """
    scenario_updates = get_and_validate(updates, "scenario", list, required=False)
    if not scenario_updates:
        return
    sterilized_updates = []
    for update in scenario_updates:
        sterilized = {
            "id": get_and_validate(update, "id", int),
            "name": get_and_validate(update, "name", str),
        }
        sterilized_updates.append(sterilized)
    try:
        _, errors = db_map.update_scenarios(*sterilized_updates, strict=True)
        if errors:
            raise FlextoolException("Errors while updating scenarios.")
    except SpineIntegrityError as error:
        raise FlextoolException(f"Database integrity error: {error}")


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
    alternative_ids = {
        item.name: item.id for item in db_map.query(db_map.alternative_sq)
    }
    sterilized_updates = []
    for update in scenario_alternative_updates:
        sterilized = {
            "id": get_and_validate(update, "id", int),
            "alternative_id": alternative_ids[
                get_and_validate(update, "alternative_name", str)
            ],
        }
        sterilized_updates.append(sterilized)
    try:
        _, errors = db_map.update_scenario_alternatives(
            *sterilized_updates, strict=True
        )
        if errors:
            raise FlextoolException("Errors while updating scenario alternatives.")
    except SpineIntegrityError as error:
        raise FlextoolException(f"Database integrity error: {error}")


def _update_objects(db_map, updates):
    """Updates objects in model database.

    Args:
        db_map (DatabaseMapping): database mapping
        updates (dict): database updates
    """
    object_updates = get_and_validate(updates, "object", list, required=False)
    if not object_updates:
        return
    sterilized_updates = []
    for update in object_updates:
        sterilized = {
            "id": get_and_validate(update, "id", int),
            "name": get_and_validate(update, "name", str),
        }
        sterilized_updates.append(sterilized)
    try:
        _, errors = db_map.update_objects(*sterilized_updates, strict=True)
        if errors:
            raise FlextoolException("Errors while updating objects.")
    except SpineIntegrityError as e:
        raise FlextoolException(f"Database integrity error: {e}")


def _update_relationships(db_map, updates, class_id):
    """Updates relationships in model database.

    Args:
        db_map (DatabaseMapping): database mapping
        updates (dict): database updates
        class_id (int): relationship class id
    """
    relationship_updates = get_and_validate(
        updates, "relationship", list, required=False
    )
    if not relationship_updates:
        return
    if class_id is None:
        raise FlextoolException("'class_id' is required when updating relationships.")
    sterilized_updates = []
    object_ids = _relationship_object_ids(db_map, class_id)
    for update in relationship_updates:
        object_names = get_and_validate(update, "object_name_list", list)
        object_id_list = [
            object_ids[dimension][object_names[dimension]]
            for dimension, ids in enumerate(object_ids)
        ]
        sterilized = {
            "id": get_and_validate(update, "id", int),
            "name": get_and_validate(update, "name", str),
            "object_id_list": object_id_list,
        }
        sterilized_updates.append(sterilized)
    del relationship_updates  # Don't use updates from this point onwards.
    try:
        _, errors = db_map.update_wide_relationships(*sterilized_updates, strict=True)
        if errors:
            raise FlextoolException("Errors while updating relationships.")
    except SpineIntegrityError as e:
        raise FlextoolException(f"Database integrity error: {e}")


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
            raise FlextoolException(f"Missing'{missing}'.")
        sterilized_updates.append(sterilized)
    del value_updates  # Don't use updates from this point onwards.
    try:
        _, errors = db_map.update_parameter_values(*sterilized_updates, strict=True)
        if errors:
            raise FlextoolException("Errors while updating values.")
    except SpineIntegrityError as e:
        raise FlextoolException(f"Database integrity error: {e}")


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
        inserted, errors = db_map.add_alternatives(
            *sterilized_insertions, strict=True, return_items=True
        )
        if errors:
            raise FlextoolException("Errors while inserting alternatives.")
    except SpineIntegrityError as e:
        raise FlextoolException(f"Database integrity error: {e}")
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
        inserted, errors = db_map.add_scenarios(
            *sterilized_insertions, strict=True, return_items=True
        )
        if errors:
            raise FlextoolException("Errors while inserting scenarios.")
    except SpineIntegrityError as e:
        raise FlextoolException(f"Database integrity error: {e}")
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
        inserted, errors = db_map.add_scenario_alternatives(
            *sterilized_insertions, strict=True, return_items=True
        )
        if errors:
            raise FlextoolException("Errors while inserting scenario alternatives.")
    except SpineIntegrityError as e:
        raise FlextoolException(f"Database integrity error: {e}")
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
        raise FlextoolException(f"'class_id' is required for object insertions")
    sterilized_insertions = []
    for insertion in object_insertions:
        name = get_and_validate(insertion, "name", str)
        sterilized = {"name": name, "class_id": class_id}
        sterilized_insertions.append(sterilized)
    try:
        inserted, errors = db_map.add_objects(
            *sterilized_insertions, strict=True, return_items=True
        )
        if errors:
            raise FlextoolException("Errors while inserting objects.")
    except SpineIntegrityError as e:
        raise FlextoolException(f"Database integrity error: {e}")
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
        raise FlextoolException("'class_id' is required for relationship insertions")
    sterilized_insertions = []
    object_ids = _relationship_object_ids(db_map, class_id)
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
            "object_id_list": object_id_list,
        }
        sterilized_insertions.append(sterilized)
    try:
        inserted, errors = db_map.add_wide_relationships(
            *sterilized_insertions, strict=True, return_items=True
        )
        if errors:
            raise FlextoolException("Errors while inserting relationships.")
    except SpineIntegrityError as e:
        raise FlextoolException(f"Database integrity error: {e}")
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
        raise FlextoolException("'class_id' is required for parameter value insertions")
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
            "entity_name": get_and_validate(insertion, "entity_name", str),
            "parameter_definition_id": definition_id,
            "alternative_id": get_and_validate(insertion, "alternative_id", int),
            "value": database_value,
            "type": value_type,
        }
        sterilized_insertions.append(sterilized)
    entity_ids = {
        row.name: row.id
        for row in db_map.query(db_map.entity_sq).filter(
            db_map.entity_sq.c.class_id == class_id
        )
    }
    for insertion in sterilized_insertions:
        insertion["entity_id"] = entity_ids[insertion["entity_name"]]
    try:
        inserted, errors = db_map.add_parameter_values(
            *sterilized_insertions, strict=True, return_items=True
        )
        if errors:
            raise FlextoolException("Errors while inserting values.")
    except SpineIntegrityError as e:
        raise FlextoolException(f"Database integrity error: {e}")


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
                kwargs=dict(pk=project.id, class_id=relationship["id"]),
            )
        return relationships

    with database_map(project, Database.MODEL) as db_map:
        object_class_rows = iter(
            db_map.query(db_map.object_class_sq)
            .filter(db_map.object_class_sq.c.name.in_(object_class_names))
            .order_by(db_map.object_class_sq.c.name)
        )
        object_classes = []
        relationship_classes = {}
        for object_class_row in object_class_rows:
            object_class_dict = object_class_row._asdict()
            object_class_dict["entitiesUrl"] = reverse(
                "flextool3:entities",
                kwargs=dict(pk=project.id, class_id=object_class_row.id),
            )
            object_classes.append(object_class_dict)
            relationship_class_ids = {
                row.id
                for row in db_map.query(db_map.relationship_class_sq)
                .filter(db_map.relationship_class_sq.c.dimension == 0)
                .filter(
                    db_map.relationship_class_sq.c.object_class_id
                    == object_class_row.id
                )
            }
            relationship_class_rows = iter(
                db_map.query(db_map.wide_relationship_class_sq)
                .filter(
                    db_map.wide_relationship_class_sq.c.id.in_(relationship_class_ids)
                )
                .order_by(db_map.wide_relationship_class_sq.c.name)
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
