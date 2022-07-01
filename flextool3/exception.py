"""FlexTool Exceptions."""


class FlexToolException(Exception):
    """Base exception class."""


class ExecutionNotFound(FlexToolException):
    """Raised when executor cannot find given execution."""
