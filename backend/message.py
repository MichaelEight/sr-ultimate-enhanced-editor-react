# message.py
from flask_socketio import SocketIO

socketio = SocketIO(cors_allowed_origins="*")

def send_progress(progress, message):
    socketio.emit('progress', {'progress': progress, 'message': message})

def send_message(message):
    socketio.emit('message', {'message': message})
