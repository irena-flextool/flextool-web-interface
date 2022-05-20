from contextlib import contextmanager
from enum import auto, Enum, unique
from spinedb_api import DatabaseMapping


@unique
class Database(Enum):
    MODEL = auto()
    RESULT = auto()


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
