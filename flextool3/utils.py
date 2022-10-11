"""General purpose utilities and helpers."""
from contextlib import contextmanager
import datetime
from enum import auto, Enum, unique
from pathlib import Path
from django.utils import timezone
from spinedb_api import DatabaseMapping, append_filter_config, SpineDBAPIError
from .exception import FlexToolException

FLEXTOOL_PROJECT_TEMPLATE = Path(__file__).parent / "master_project"
FLEXTOOL_PROJECTS_ROOT = Path(__file__).parent / "user_projects"


@unique
class Database(Enum):
    """Tags for different databases in FlexTool3 project."""

    MODEL = auto()
    RESULT = auto()
    INITIALIZATION = auto()


@unique
class Key(Enum):
    """Dictionary keys for interface requests."""

    ALTERNATIVE_ID = "alternative_id"
    CLASS_ID = "class_id"
    ENTITY_ID = "entity_id"
    OBJECT_CLASS_ID = "object_class_id"
    OBJECT_ID = "object_id"
    RELATIONSHIP_CLASS_ID = "relationship_class_id"
    VALUE_LIST_IDS = "value_list_ids"

    def __str__(self):
        return self.value


@contextmanager
def database_map(project, database, filter_configs=None):
    """Opens a database connection to project's database.

    Args:
        project (Project): project
        database (Database): database to connect to
        filter_configs (Iterable of dict, optional): filter configurations

    Yields:
        DatabaseMapping: database mapping connected to the database.
    """
    url = "sqlite:///" + str(project.database_path(database))
    if filter_configs is not None:
        for config in filter_configs:
            url = append_filter_config(url, config)
    try:
        db_map = DatabaseMapping(url)
    except SpineDBAPIError:
        raise FlexToolException(f"could not open database at '{project.database_path(database)}'")
    try:
        yield db_map
    finally:
        db_map.connection.close()


def get_and_validate(dictionary, key, expected_type, required=True):
    """Returns value with given key from dictionary.

    Raises if value doesn't exist or is of wrong type.

    Args:
        dictionary (dict): a dictionary
        key (Any): dictionary key
        expected_type (Type): value's expected type
        required (bool): If True, missing key raises an exception

    Returns:
        Any: value corresponding to key or None key is missing
    """
    try:
        value = dictionary[key]
    except KeyError as missing:
        if required:
            raise FlexToolException(f"Missing {missing}.") from missing
        return None
    if not isinstance(value, expected_type):
        if isinstance(expected_type, tuple):
            raise FlexToolException(
                f"'{key}' is of wrong type, expected one of {expected_type}"
            )
        raise FlexToolException(
            f"'{key}' is of wrong type '{type(value).__name__}', expected {expected_type.__name__}"
        )
    return value


def naive_local_time(time_point, time_offset):
    """Converts UTC time point into naive local time.

    Args:
        time_point (datetime.datetime): UTC time point
        time_offset (int): timezone offset in seconds
    """
    offset_delta = datetime.timedelta(seconds=time_offset)
    local_timezone = datetime.timezone(offset_delta)
    return timezone.make_naive(time_point, local_timezone)
