# message.py
from flask_socketio import SocketIO
import datetime
import os

socketio = SocketIO(cors_allowed_origins="*")

def send_progress(progress, message):
    socketio.emit('progress', {'progress': progress, 'message': message})

def send_message(message):
    socketio.emit('message', {'message': message})

def add_to_log(message):
    log_file = os.path.join(os.path.dirname(__file__), 'log.txt')
    with open(log_file, 'a') as f:
        now = datetime.datetime.now()
        f.write(f'[{now.strftime("%Y-%m-%d")} {now.strftime("%H:%M:%S")}]: {message}\n')
