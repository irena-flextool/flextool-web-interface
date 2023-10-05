from shutil import rmtree
from time import sleep


def delete_directory(path):
    """Delete given path recursively.

    Tries a few times before giving up in case a file is being read from the path.

    Args:
        path (Path): path to delete
    """
    attempts = 0
    while attempts != 10:
        try:
            rmtree(path)
        except PermissionError:
            sleep(1)
            attempts += 1
        else:
            break
