import atexit
import functools
from multiprocessing import Pipe, Process, Queue

from .task_loop import Field, loop, Status, Task


def _create_process():
    """Instantiates a message loop process.

    Returns:
        Process: message loop process
    """
    return Process(target=loop, args=(_task_queue, _sending_connection), name="Execution task loop")


_task_queue = Queue()
_receiving_connection, _sending_connection = Pipe(duplex=False)
_message_loop_process = _create_process()


def _message_sender(func):
    """Ensures that the task loop is running before entering the context.

    Args:
        func (Callable): function to decorate

    Returns:
        Any: decorated function's return value
    """
    @functools.wraps(func)
    def ensure_loop_is_alive(*args, **kwargs):
        if not _message_loop_process.is_alive():
            _message_loop_process.start()
        return func(*args, **kwargs)
    return ensure_loop_is_alive


@_message_sender
def start(execution_id, command, arguments):
    """Starts a new process.

    Args:
        execution_id (int): unique execution id
        command (str): command to execute
        arguments (list of str): command's arguments
    """
    _task_queue.put({
        Field.TASK: Task.START_PROCESS,
        Field.EXECUTION_ID: execution_id,
        Field.PROCESS_COMMAND: command,
        Field.PROCESS_ARGUMENTS: arguments
    }, block=False)


@_message_sender
def abort(execution_id):
    """Aborts a process.

    Args:
        execution_id (int): execution id
    """
    _task_queue.put({
        Field.TASK: Task.ABORT_PROCESS,
        Field.EXECUTION_ID: execution_id,
    }, block=False)


@_message_sender
def remove(execution_id):
    """Terminates a process and deletes all references to it and its logs.

    Args:
        execution_id (int): execution id
    """
    _task_queue.put({
        Field.TASK: Task.REMOVE_PROCESS,
        Field.EXECUTION_ID: execution_id
    }, block=False)


@_message_sender
def read_lines(execution_id):
    """Reads available lines from process' stdout.

    Args:
        execution_id (int): execution id

    Returns:
        list of str: list of lines
    """
    _task_queue.put({
        Field.TASK: Task.SEND_OUTPUT,
        Field.EXECUTION_ID: execution_id,
    })
    return _receiving_connection.recv()


@_message_sender
def execution_status(execution_id):
    """Queries process' execution status."

    Args:
        execution_id (int): execution id

    Returns:
        Status: process status
    """
    _task_queue.put({
        Field.TASK: Task.SEND_STATUS,
        Field.EXECUTION_ID: execution_id,
    })
    return _receiving_connection.recv()


@_message_sender
def execution_return_code(execution_id):
    """Queries process' return code."

    Args:
        execution_id (int): execution id

    Returns:
        int: return code or None if process is still running
    """
    _task_queue.put({
        Field.TASK: Task.SEND_RETURN_CODE,
        Field.EXECUTION_ID: execution_id,
    })
    return _receiving_connection.recv()


@_message_sender
def execution_count():
    """Queries the number of started executions.

    Returns:
        int: number of executions
    """
    _task_queue.put({
        Field.TASK: Task.SEND_PROCESS_COUNT
    })
    return _receiving_connection.recv()


def _quit_execution_process():
    """Quits the execution process."""
    if _message_loop_process.is_alive():
        _task_queue.put({Field.TASK: Task.QUIT})
        _message_loop_process.join()


atexit.register(_quit_execution_process)
