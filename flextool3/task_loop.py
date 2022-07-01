"""Task loop and subprocess management."""
from enum import auto, Enum, unique
import queue
from subprocess import PIPE, Popen, STDOUT
import threading


@unique
class Task(Enum):
    """Task loop task identifiers."""

    QUIT = auto()
    """Terminate execution processes and quit the loop."""
    START_PROCESS = auto()
    """Start a new execution process under given id."""
    ABORT_PROCESS = auto()
    """Terminates given execution."""
    REMOVE_PROCESS = auto()
    """Removes all traces of given execution."""
    SEND_OUTPUT = auto()
    """Write latest stdout from given execution to connection pipe."""
    SEND_STATUS = auto()
    """Write status of given execution to connection pipe."""
    SEND_RETURN_CODE = auto()
    """Write return code or None of given execution to connection pipe."""
    SEND_PROCESS_COUNT = auto()
    """Write process count (running and finished) to connection pipe."""


@unique
class Field(Enum):
    """Task loop message keys."""

    TASK = auto()
    EXECUTION_ID = auto()
    PROCESS_COMMAND = auto()
    PROCESS_ARGUMENTS = auto()


@unique
class Status(Enum):
    """Execution statuses."""

    RUNNING = auto()
    FINISHED = auto()
    ABORTED = auto()


@unique
class Error(Enum):
    """Error codes."""

    UNKNOWN_EXECUTION_ID = auto()


class _ProcessLog:
    """Stores execution process output as lines of text."""

    _n = 0
    """Counter to name listener threads."""

    def __init__(self, out):
        """
        Args:
            out (IOBase): output stream to log
        """
        self.lines: list = []
        self.unmerged: list = []
        self.return_code = None
        self.status = Status.RUNNING
        self._line_queue = queue.SimpleQueue()
        _ProcessLog._n += 1
        self._listener = threading.Thread(
            target=_read_stream,
            args=(out, self._line_queue),
            name=f"fExecution logger {_ProcessLog._n}",
        )
        self._listener.daemon = True
        self._listener.start()

    def merge(self):
        """Merges unmerged log lines to final log."""
        self.lines += self.unmerged
        self.unmerged.clear()

    def read_to_unmerged(self):
        """Appends new output (if available) to unmerged lines."""
        try:
            while True:
                line = self._line_queue.get_nowait()
                self.unmerged.append(line)
        except queue.Empty:
            pass

    def finish(self, return_code):
        """Marks process as finished.

        Args:
            return_code (int): return code of the process
        """
        self.status = Status.FINISHED
        self._close(return_code)

    def abort(self, return_code):
        """Marks process as aborted.

        Args;
            return_code (int): return code of the process
        """
        self.status = Status.ABORTED
        self._close(return_code)

    def _close(self, return_code):
        """Stops listening to process output.

        Args:
            return_code (int): return code of the process
        """
        self.return_code = return_code
        self._listener.join()
        self._listener = None
        self._line_queue = None


def _read_stream(out, log_queue):
    """Puts lines of text from stream into a queue.

    Args:
        out (IOBase): output stream
        log_queue (queue.Queue): target queue
    """
    try:
        for line in iter(out.readline, ""):
            if line.startswith("\x1b"):
                continue
            log_queue.put(line)
    except ValueError:
        pass


# pylint: disable=too-many-branches
def loop(task_queue, out_connection):
    """Event loop for the parallel process.

    Args:
        task_queue (Queue): task queue
        out_connection (Connection): connection capable of sending
    """
    running = True
    processes = {}
    logs = {}
    while running:
        try:
            timeout = 0.2 if processes else None
            message = task_queue.get(timeout=timeout)
        except queue.Empty:
            processes = _update_logs_and_delete_finished(logs, processes)
        except KeyboardInterrupt:
            running = False
        else:
            task = message[Field.TASK]
            if task == Task.QUIT:
                running = False
            elif task == Task.START_PROCESS:
                _start(message, processes, logs)
            elif task == Task.ABORT_PROCESS:
                _abort(message, processes, logs)
            elif task == Task.REMOVE_PROCESS:
                _remove(message, processes, logs)
            elif task == Task.SEND_OUTPUT:
                _send_output(message, logs, out_connection)
            elif task == Task.SEND_STATUS:
                _send_status(message, logs, out_connection)
            elif task == Task.SEND_RETURN_CODE:
                _send_return_code(message, logs, out_connection)
            elif task == Task.SEND_PROCESS_COUNT:
                out_connection.send(len(logs))
            processes = _update_logs_and_delete_finished(logs, processes)
    for process in processes.values():
        if process.poll() is None:
            process.terminate()
            process.wait()


def _start(message, processes, logs):
    """Starts a new process.

    Args:
        message (dict): task message
        processes (dict): running processes
        logs (dict): process logs
    """
    execution_id = message[Field.EXECUTION_ID]
    if execution_id in processes:
        return
    command = message[Field.PROCESS_COMMAND]
    arguments = message[Field.PROCESS_ARGUMENTS]
    processes[execution_id] = process = _create_process(command, arguments)
    logs[execution_id] = _ProcessLog(process.stdout)


def _create_process(command, arguments):
    """Starts a new process.

    Args:
        command (str): command to execute
        arguments (list of str): command's arguments

    Returns:
        Popen: new process
    """
    return Popen([command] + arguments, stdout=PIPE, stderr=STDOUT, text=True)


def _abort(message, processes, logs):
    """Terminates a running process.

    Args:
        message (dict): task message
        processes (dict): running processes
        logs (dict): process logs
    """
    execution_id = message[Field.EXECUTION_ID]
    try:
        process = processes[execution_id]
    except KeyError:
        return
    process.terminate()
    process.wait()
    if not process.stdout.closed:
        process.stdout.close()
    del processes[execution_id]
    logs[execution_id].abort(process.returncode)


def _remove(message, processes, logs):
    """Removes process and its logs.

    Args:
        message (dict): task message
        processes (dict): running processes
        logs (dict): process logs
    """
    execution_id = message[Field.EXECUTION_ID]
    process = processes.get(execution_id)
    if process is not None:
        process.terminate()
        process.wait()
        del processes[execution_id]
    try:
        del logs[execution_id]
    except KeyError:
        pass


def _send_output(message, logs, out_connection):
    """Writes process output to pipe.

    Args:
        message (dict): task message
        logs (dict): process logs
        out_connection (Connection): connection that is capable of sending
    """
    execution_id = message[Field.EXECUTION_ID]
    try:
        log = logs[execution_id]
    except KeyError:
        out_connection.send(Error.UNKNOWN_EXECUTION_ID)
    else:
        out_connection.send(log.unmerged)
        log.merge()


def _send_status(message, logs, out_connection):
    """Writes process status to pipe.

    Args:
        message (dict): task message
        logs (dict): process logs
        out_connection (Connection): connection that is capable of sending
    """
    execution_id = message[Field.EXECUTION_ID]
    try:
        log = logs[execution_id]
    except KeyError:
        out_connection.send(Error.UNKNOWN_EXECUTION_ID)
    else:
        out_connection.send(log.status)


def _send_return_code(message, logs, out_connection):
    """Writes process return code to pipe.

    Args:
        message (dict): task message
        logs (dict): process logs
        out_connection (Connection): connection that is capable of sending
    """
    execution_id = message[Field.EXECUTION_ID]
    try:
        log = logs[execution_id]
    except KeyError:
        out_connection.send(Error.UNKNOWN_EXECUTION_ID)
    else:
        out_connection.send(log.return_code)


def _update_logs_and_delete_finished(logs, processes):
    """Updates process logs but doesn't merge.

    Args:
        logs (dict): process logs
        processes (dict): execution processes

    Returns:
        dict: still running execution processes
    """
    running = {}
    for execution_id, process in processes.items():
        return_code = process.poll()
        log = logs[execution_id]
        log.read_to_unmerged()
        if return_code is None:
            running[execution_id] = process
        else:
            log.finish(return_code)
    return running


def _merge_logs(logs):
    """Merges unmerged logs.

    Args:
        logs (dict): execution logs
    """
    for log in logs.values():
        log.merge()
