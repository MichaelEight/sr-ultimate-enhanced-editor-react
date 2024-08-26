# message.py
from flask_socketio import SocketIO
import datetime
import os
import inspect

socketio = SocketIO(cors_allowed_origins="*")

def send_progress(progress, message):
    socketio.emit('progress', {'progress': progress, 'message': message})

def send_message(message):
    socketio.emit('message', {'message': message})

def add_to_log(message):
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
