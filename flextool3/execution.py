from subprocess import PIPE, Popen, STDOUT

_processes = {}


def start(execution_id, command, arguments):
    """Starts a new process.

    Args:
        execution_id (int): execution id
        command (str): command to execute
        arguments (list of str): command's arguments
    """
    if execution_id in _processes:
        return
    process = Popen([command] + arguments, stdout=PIPE, stderr=STDOUT, text=True)
    _processes[execution_id] = process


def delete_all():
    """Kills and deletes all running processes."""
    for process in _processes.values():
        process.terminate()
    _processes.clear()


def get_process(execution_id):
    """Returns process for given execution_id.

    Args:
        execution_id (int): execution id

    Returns:
        Popen: process
    """
    return _processes[execution_id]


def is_running(execution_id):
    """Returns True if process is running, False otherwise.

    Args:
        execution_id (int): execution id

    Returns:
        bool: True if process is running, False otherwise
    """
    return _processes[execution_id].poll() is None


def read_line(execution_id):
    """Reads a line from process' stdout.

    Args:
        execution_id (int): execution id

    Returns:
        str: line
    """
    return _processes[execution_id].stdout.readline()


def read_lines(execution_id):
    """Reads available lines from process' stdout.

    Args:
        execution_id (int): execution id

    Returns:
        list of str: list of lines
    """
    return _processes[execution_id].stdout.readlines()
