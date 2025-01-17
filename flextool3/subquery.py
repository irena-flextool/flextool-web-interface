from sqlalchemy import and_
from spinedb_api.helpers import group_concat


def entity_class_dimension_sq(db_map):
    """Subquery for entity class dimensions.

    Args:
        db_map (DatabaseMapping): database mapping

    Returns:
        Alias: subquery
    """
    return (
        db_map.query(
            db_map.entity_class_dimension_sq.c.entity_class_id,
            db_map.entity_class_dimension_sq.c.dimension_id,
            db_map.entity_class_dimension_sq.c.position,
            db_map.entity_class_sq.c.name.label("dimension_name"),
        )
        .filter(db_map.entity_class_dimension_sq.c.dimension_id == db_map.entity_class_sq.c.id)
        .subquery("entity_class_dimension_sq")
    )


def ext_entity_class_sq(db_map):
    """Extended subquery for entity class dimensions.

    Args:
        db_map (DatabaseMapping): database mapping

    Returns:
        Alias: subquery
    """
    dimension_sq = entity_class_dimension_sq(db_map)
    return (
        db_map.query(
            db_map.entity_class_sq.c.id,
            db_map.entity_class_sq.c.name,
            dimension_sq.c.dimension_name,
            dimension_sq.c.position,
        )
        .outerjoin(
            dimension_sq,
            db_map.entity_class_sq.c.id == dimension_sq.c.entity_class_id,
        )
        .order_by(db_map.entity_class_sq.c.id, dimension_sq.c.position)
        .subquery("ext_entity_class_sq")
    )


def wide_entity_class_sq(db_map):
    """Wide subquery for entity classes.

    Includes entity class dimensions.

    Args:
        db_map (DatabaseMapping): database mapping

    Returns:
        Alias: subquery
    """
    ext_class_sq = ext_entity_class_sq(db_map)
    return (
        db_map.query(
            ext_class_sq.c.id,
            ext_class_sq.c.name,
            group_concat(ext_class_sq.c.dimension_name, ext_class_sq.c.position).label("dimension_name_list"),
        )
        .group_by(
            ext_class_sq.c.id,
        )
        .subquery("wide_entity_class_sq")
    )


def entity_element_sq(db_map):
    """Subquery for entity elements.

    Args:
        db_map (DatabaseMapping): database mapping

    Returns:
        Alias: subquery
    """
    return (
        db_map.query(db_map.entity_element_sq, db_map.entity_sq.c.name.label("element_name"))
        .filter(db_map.entity_element_sq.c.element_id == db_map.entity_sq.c.id)
        .subquery("entity_element_sq")
    )


def ext_entity_element_sq(db_map):
    """Extended subquery for entity elements.

    Args:
        db_map (DatabaseMapping): database mapping

    Returns:
        Alias: subquery
    """
    element_sq = entity_element_sq(db_map)
    return (
        db_map.query(db_map.entity_sq, element_sq)
        .outerjoin(
            element_sq,
            db_map.entity_sq.c.id == element_sq.c.entity_id,
        )
        .order_by(db_map.entity_sq.c.id, element_sq.c.position)
        .subquery("ext_entity_sq")
    )


def wide_entity_sq(db_map):
    """Wide subquery for entities.

    Includes entity elements.

    Args:
        db_map (DatabaseMapping): database mapping

    Returns:
        Alias: subquery
    """
    ext_entity_sq = ext_entity_element_sq(db_map)
    return (
        db_map.query(
            ext_entity_sq.c.id,
            ext_entity_sq.c.class_id.label("entity_class_id"),
            db_map.entity_class_sq.c.name.label("entity_class_name"),
            ext_entity_sq.c.name,
            group_concat(ext_entity_sq.c.element_name, ext_entity_sq.c.position).label("element_name_list"),
        )
        .join(db_map.entity_class_sq, ext_entity_sq.c.class_id == db_map.entity_class_sq.c.id)
        .group_by(
            ext_entity_sq.c.id,
        )
        .subquery("wide_entity_sq")
    )


def parameter_definition_sq(db_map):
    """Subquery for parameter definitions.

    Args:
        db_map (DatabaseMapping): database mapping

    Returns:
        Alias: subquery
    """
    return db_map.query(
        db_map.parameter_definition_sq.c.name,
        db_map.parameter_definition_sq.c.description,
        db_map.entity_class_sq.name.label("entity_class_name"),
        db_map.parameter_definition_sq.c.default_type,
        db_map.parameter_definition_sq.c.default_value,
        db_map.parameter_value_list.c.name.label("parameter_value_list_name"),
    ).join(db_map.entity_class_sq, db_map.parameter_definition_sq.c.entity_class_id == db_map.entity_class_sq.c.id).join(db_map.parameter_value_list_sq, db_map.parameter_definition_sq.c.parameter_value_list_id == db_map.parameter_value_list_sq.c.id).subquery()


def parameter_value_sq(db_map):
    """Subquery for parameter values.

    Args:
        db_map (DatabaseMapping): database mapping

    Returns:
        Alias: subquery
    """
    class_sq = wide_entity_class_sq(db_map)
    entity_sq = wide_entity_sq(db_map)
    return db_map.query(
        class_sq.c.name.label("entity_class_name"),
        class_sq.c.dimension_name_list,
        entity_sq.c.name.label("entity_name"),
        entity_sq.c.element_name_list,
        db_map.parameter_definition_sq.c.name.label("parameter_definition_name"),
        db_map.alternative_sq.c.name.label("alternative_name"),
        db_map.parameter_value_sq.c.type,
        db_map.parameter_value_sq.c.value,
    ).join(entity_sq, class_sq.c.id == entity_sq.c.entity_class_id).join(db_map.parameter_definition_sq,
    class_sq.c.id == db_map.parameter_definition_sq.c.entity_class_id).join(db_map.parameter_value_sq, and_(entity_sq.c.id == db_map.parameter_value_sq.c.entity_id, db_map.parameter_definition_sq.c.id == db_map.parameter_value_sq.c.parameter_definition_id)).join(db_map.alternative_sq, db_map.alternative_value_sq.alternative_id == db_map.alternative_sq.c.id).subquery("parameter_value_sq")
