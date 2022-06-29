from contextlib import contextmanager
import datetime
from enum import auto, Enum, unique
from django.utils import timezone
from spinedb_api import DatabaseMapping
from .exception import FlextoolException


@unique
class Database(Enum):
    MODEL = auto()
    RESULT = auto()


@unique
class Key(Enum):
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
def database_map(project, database):
    """Opens a database connection to project's database.

    Args:
        project (Project): project
        database (Database): database to connect to

    Yields:
        DatabaseMapping: database mapping connected to the database.
    """
    if database == Database.MODEL:
        url = "sqlite:///" + str(project.model_database_path())
    else:
        url = "sqlite:///" + str(project.results_database_path())
    db_map = DatabaseMapping(url)
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
        x = dictionary[key]
    except KeyError as missing:
        if required:
            raise FlextoolException(f"Missing {missing}.")
        return None
    if not isinstance(x, expected_type):
        if isinstance(expected_type, tuple):
            raise FlextoolException(
                f"'{key}' is of wrong type, expected one of {expected_type}"
            )
        raise FlextoolException(
            f"'{key}' is of wrong type '{type(x).__name__}', expected {expected_type.__name__}"
        )
    return x


def naive_local_time(time_point, time_offset):
    """Converts UTC time point into naive local time.

    Args:
        time_point (datetime.datetime): UTC time point
        time_offset (int): timezone offset in seconds
    """
    offset_delta = datetime.timedelta(seconds=time_offset)
    local_timezone = datetime.timezone(offset_delta)
    return timezone.make_naive(time_point, local_timezone)
