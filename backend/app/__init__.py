from flask import Flask
from flask_cors import CORS
from .config import Config
from .routes import main_blueprint
from .extensions import socketio
from .utils.logging_utils import add_to_log, log_system_info, LogLevel

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

    # Initialize extensions
    socketio.init_app(app)

    # Register blueprints
    app.register_blueprint(main_blueprint)

    # Logging and initializations
    log_system_info()
    add_to_log("===============================[ Starting server ]===============================", LogLevel.INFO)
    add_to_log(f"Logging level: {app.config['LOGGING_LEVEL']}", LogLevel.DEBUG)
    add_to_log(f"UPLOAD_FOLDER: {app.config['UPLOAD_FOLDER']}", LogLevel.DEBUG)
    add_to_log(f"EXTRACT_FOLDER: {app.config['EXTRACT_FOLDER']}", LogLevel.DEBUG)
    add_to_log(f"EXPORT_FOLDER: {app.config['EXPORT_FOLDER']}", LogLevel.DEBUG)

    return app
