from .exception import FlextoolException


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
