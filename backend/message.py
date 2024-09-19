from flask_socketio import SocketIO
from datetime import datetime
import os
import inspect
from enum import Enum
import platform
import subprocess
import sys

socketio = SocketIO(cors_allowed_origins="*")

# Define LogLevel enum
class LogLevel(Enum):
    TRACE = 'trace'
    DEBUG = 'debug'
    INFO = 'info'
    ERROR = 'error'

# Log directories by level
LOG_LEVELS = [LogLevel.TRACE, LogLevel.DEBUG, LogLevel.INFO, LogLevel.ERROR]

def send_progress(progress, message):
    socketio.emit('progress', {'progress': progress, 'message': message})

def send_message(message):
    socketio.emit('message', {'message': message})

def create_log_dirs():
    """
    Ensure that the log directory and all log files for the current date are created.
    Each date has its own folder inside 'logs'.
    """
    current_date = datetime.now().strftime("%Y-%m-%d")  # Corrected this line
    
    # Create the log directory for the current date
    log_dir = os.path.join(os.path.dirname(__file__), 'logs', current_date)
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)
    
    # Ensure all log files for the day are created (empty)
    for log_level in ['trace', 'debug', 'info', 'error']:
        log_file = os.path.join(log_dir, f'.{log_level}.log')
        if not os.path.exists(log_file):
            open(log_file, 'w').close()  # Create empty log file if it doesn't exist

    return log_dir

def get_log_file_path(log_dir, level):
    """
    Return the log file path for a specific log level.
    """
    log_file = os.path.join(log_dir, f'.{level.value}.log')
    return log_file

def add_to_log(message, level=LogLevel.INFO):
    """
    Add the log message to the appropriate log files based on the log level.
    Propagation behavior:
    - trace.log should contain ALL messages.
    - debug.log should contain all messages except trace.
    - info.log should contain info and error messages.
    - error.log should contain only error messages.
    """
    # Ensure all log directories and files exist
    log_dir = create_log_dirs()

    # Use inspect to get the frame of the caller
    caller_frame = inspect.stack()[1]

    # Get the filename and function name
    filename_with_ext = os.path.basename(caller_frame.filename)
    base_filename = os.path.splitext(filename_with_ext)[0]
    caller_function_name = caller_frame.function

    # Time for log entry
    current_time = datetime.now().strftime("%H:%M:%S")

    # Ensure file paths are wrapped in single quotes if any exist in the message
    if '/' in message:
        message = f"'{message}'"

    # Format the log entry
    log_entry = f'[{current_time}][{level.name.upper()}][{base_filename} - {caller_function_name}]: {message}\n'

    # Write the log entry to the appropriate files based on log level
    if level == LogLevel.TRACE:
        # Write to trace.log
        write_log(log_dir, LogLevel.TRACE, log_entry)
    elif level == LogLevel.DEBUG:
        # Write to debug.log and trace.log
        write_log(log_dir, LogLevel.DEBUG, log_entry)
        write_log(log_dir, LogLevel.TRACE, log_entry)
    elif level == LogLevel.INFO:
        # Write to info.log, debug.log, and trace.log
        write_log(log_dir, LogLevel.INFO, log_entry)
        write_log(log_dir, LogLevel.DEBUG, log_entry)
        write_log(log_dir, LogLevel.TRACE, log_entry)
    elif level == LogLevel.ERROR:
        # Write to error.log, info.log, debug.log, and trace.log
        write_log(log_dir, LogLevel.ERROR, log_entry)
        write_log(log_dir, LogLevel.INFO, log_entry)
        write_log(log_dir, LogLevel.DEBUG, log_entry)
        write_log(log_dir, LogLevel.TRACE, log_entry)

def write_log(log_dir, log_level, log_entry):
    """
    Write the log entry to the appropriate log file for the given log level.
    """
    log_file = get_log_file_path(log_dir, log_level)
    try:
        with open(log_file, 'a') as f:
            f.write(log_entry)
    except Exception as e:
        print(f"Failed to write to log file {log_file}: {str(e)}")

def log_system_info():
    """
    Logs detailed system and environment information (system, Python, npm, pip, and libraries)
    to the logs/[current date]/.system.log file. 
    """
    # Create the log directory for the current date
    current_date = datetime.now().strftime("%Y-%m-%d")
    log_dir = os.path.join(os.path.dirname(__file__), 'logs', current_date)
    
    # Ensure the log directory exists
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)

    # Log file path for system log
    system_log_file = os.path.join(log_dir, ".system.log")
    
    # Get the current date and time
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Log system information
    system_info = {
        "Current Date and Time": current_time,
        "System": platform.system(),
        "Node Name": platform.node(),
        "Release": platform.release(),
        "Version": platform.version(),
        "Machine": platform.machine(),
        "Processor": platform.processor(),
        "Python Version": sys.version
    }

    # Get installed libraries for backend (pip)
    pip_freeze = subprocess.run([sys.executable, '-m', 'pip', 'freeze'], capture_output=True, text=True).stdout

    # Try to get npm version and libraries (for frontend), handle missing npm
    try:
        npm_version = subprocess.run(['npm', '--version'], capture_output=True, text=True).stdout.strip()
        npm_list = subprocess.run(['npm', 'list', '--depth=0'], capture_output=True, text=True).stdout
    except FileNotFoundError:
        npm_version = "npm not found"
        npm_list = "No npm libraries found. Please ensure Node.js and npm are installed."

    with open(system_log_file, 'a') as f:
        # Log system data
        f.write(f"{current_time}\n")
        f.write("===== SYSTEM INFORMATION =====\n")
        for key, value in system_info.items():
            f.write(f"{key}: {value}\n")
        
        # Log backend information
        f.write("\n===== BACKEND (Python) =====\n")
        f.write("Pip Libraries:\n")
        f.write(pip_freeze)

        # Log frontend information
        f.write("\n===== FRONTEND (Node.js, npm) =====\n")
        f.write(f"npm Version: {npm_version}\n")
        f.write("npm Libraries:\n")
        f.write(npm_list)

        # Log a visible separator to avoid mixing log entries
        f.write("\n========================================\n\n")
