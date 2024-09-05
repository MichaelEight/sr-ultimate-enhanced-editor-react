# message.py
from flask_socketio import SocketIO
import datetime
import os
import inspect

socketio = SocketIO(cors_allowed_origins="*")

# Trace, Debug, Info
LOGGING_LEVEL = 'info'
LOG_LEVELS = {0: 'trace', 1: 'debug', 2: 'info'}

def send_progress(progress, message):
    socketio.emit('progress', {'progress': progress, 'message': message})

def send_message(message):
    socketio.emit('message', {'message': message})

def add_to_log(message, level='info'):
    if level not in LOG_LEVELS:
        message = f'Invalid log level: {level}; MSG: {message}'
    else:
        if LOGGING_LEVEL != 'trace':
            # If logging is higher than limit, don't show it
            pass

    # Use inspect to get the frame of the caller
    caller_frame = inspect.stack()[1]
    
    # Get the full path of the calling file
    full_path = caller_frame.filename
    
    # Get just the filename with extension
    filename_with_ext = os.path.basename(full_path)
    
    # Remove the extension to get just the base filename
    base_filename = os.path.splitext(filename_with_ext)[0]
    
    # Get the name of the calling function
    caller_function_name = caller_frame.function

    log_file = os.path.join(os.path.dirname(__file__), 'log.txt')
    with open(log_file, 'a') as f:
        now = datetime.datetime.now()
        f.write(f'[{now.strftime("%Y-%m-%d")} {now.strftime("%H:%M:%S")}][{base_filename} - {caller_function_name}]: {message}\n')
