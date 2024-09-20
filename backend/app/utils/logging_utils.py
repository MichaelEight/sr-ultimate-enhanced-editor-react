from flask_socketio import SocketIO
from datetime import datetime
import os
import inspect
from enum import Enum
import platform
import subprocess
import sys

from ..extensions import socketio

# Define LogLevel enum
class LogLevel(Enum):
    TRACE = 'trace'
    DEBUG = 'debug'
    INFO = 'info'
    ERROR = 'error'

def send_progress(progress, message):
    socketio.emit('progress', {'progress': progress, 'message': message})

def send_message(message):
    socketio.emit('message', {'message': message})

def create_log_dirs():
    current_date = datetime.now().strftime("%Y-%m-%d")
    log_dir = os.path.join('logs', current_date)
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)
    for log_level in ['trace', 'debug', 'info', 'error']:
        log_file = os.path.join(log_dir, f'.{log_level}.log')
        if not os.path.exists(log_file):
            open(log_file, 'w').close()
    return log_dir

def get_log_file_path(log_dir, level):
    log_file = os.path.join(log_dir, f'.{level.value}.log')
    return log_file

def add_to_log(message, level=LogLevel.INFO):
    log_dir = create_log_dirs()
    caller_frame = inspect.stack()[1]
    filename_with_ext = os.path.basename(caller_frame.filename)
    base_filename = os.path.splitext(filename_with_ext)[0]
    caller_function_name = caller_frame.function
    current_time = datetime.now().strftime("%H:%M:%S")
    if '/' in message:
        message = f"'{message}'"
    log_entry = f'[{current_time}][{level.name.upper()}][{base_filename} - {caller_function_name}]: {message}\n'
    if level == LogLevel.TRACE:
        write_log(log_dir, LogLevel.TRACE, log_entry)
    elif level == LogLevel.DEBUG:
        write_log(log_dir, LogLevel.DEBUG, log_entry)
        write_log(log_dir, LogLevel.TRACE, log_entry)
    elif level == LogLevel.INFO:
        write_log(log_dir, LogLevel.INFO, log_entry)
        write_log(log_dir, LogLevel.DEBUG, log_entry)
        write_log(log_dir, LogLevel.TRACE, log_entry)
    elif level == LogLevel.ERROR:
        write_log(log_dir, LogLevel.ERROR, log_entry)
        write_log(log_dir, LogLevel.INFO, log_entry)
        write_log(log_dir, LogLevel.DEBUG, log_entry)
        write_log(log_dir, LogLevel.TRACE, log_entry)

def write_log(log_dir, log_level, log_entry):
    log_file = get_log_file_path(log_dir, log_level)
    try:
        with open(log_file, 'a') as f:
            f.write(log_entry)
    except Exception as e:
        print(f"Failed to write to log file {log_file}: {str(e)}")

def log_system_info():
    current_date = datetime.now().strftime("%Y-%m-%d")
    log_dir = os.path.join('logs', current_date)
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)
    system_log_file = os.path.join(log_dir, ".system.log")
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
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
    pip_freeze = subprocess.run([sys.executable, '-m', 'pip', 'freeze'], capture_output=True, text=True).stdout
    try:
        npm_version = subprocess.run(['npm', '--version'], capture_output=True, text=True).stdout.strip()
        npm_list = subprocess.run(['npm', 'list', '--depth=0'], capture_output=True, text=True).stdout
    except FileNotFoundError:
        npm_version = "npm not found"
        npm_list = "No npm libraries found. Please ensure Node.js and npm are installed."
    with open(system_log_file, 'a') as f:
        f.write(f"{current_time}\n")
        f.write("===== SYSTEM INFORMATION =====\n")
        for key, value in system_info.items():
            f.write(f"{key}: {value}\n")
        f.write("\n===== BACKEND (Python) =====\n")
        f.write("Pip Libraries:\n")
        f.write(pip_freeze)
        f.write("\n===== FRONTEND (Node.js, npm) =====\n")
        f.write(f"npm Version: {npm_version}\n")
        f.write("npm Libraries:\n")
        f.write(npm_list)
        f.write("\n========================================\n\n")
