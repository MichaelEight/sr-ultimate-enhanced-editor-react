from flask import Blueprint, request, jsonify, send_file
from pathlib import Path
import shutil
import json

from .models import project, create_empty_structure
from .utils.file_utils import copy_file, create_zip_archive
from .utils.logging_utils import add_to_log, LogLevel, send_progress
from .config import Config
from .services.project_services import process_file_for_export
from .parsing.parsers import extract_archive, parse_scenario_file
from .validation.validators import check_file_existence

from .tab_handlers.settings_handler import settings_handler

main_blueprint = Blueprint('main', __name__)

# Initialize base directories using pathlib
UPLOADS_PATH = Path(Config.UPLOAD_FOLDER)
EXTRACTS_PATH = Path(Config.EXTRACT_FOLDER)
EXPORTS_PATH = Path(Config.EXPORT_FOLDER)

@main_blueprint.route('/updateSetting', methods=['POST'])
def update_setting():
    try:
        add_to_log("Received updateSetting request", LogLevel.INFO)
        data = request.get_json()
        add_to_log(f"Request data: {data}", LogLevel.DEBUG)

        if 'key' in data and 'value' in data:
            project.settings_data[data['key']] = data['value']
            add_to_log(f"Updated setting {data['key']} to {data['value']}", LogLevel.DEBUG)
            return jsonify({"message": "Setting set successfully"}), 200
        else:
            add_to_log("Missing key or value in updateSetting request", LogLevel.ERROR)
            return jsonify({"message": "Missing key or value"}), 400
    except Exception as e:
        add_to_log(f"Error updating setting: {e}", LogLevel.ERROR)
        return jsonify({'error': str(e)}), 500

@main_blueprint.route('/create_empty_project', methods=['GET'])
def create_empty_project_route():
    try:
        add_to_log("=== Starting: Creating Empty Project ===", LogLevel.INFO)
        create_empty_structure()
        add_to_log("Project structure initialized", LogLevel.TRACE)

        return jsonify({
            "message": "Empty project created successfully",
            "newProjectFlag": project.new_project,
            "projectFileStructure": project.modified_structure
        }), 200
    except Exception as e:
        add_to_log(f"Error creating empty project: {e}", LogLevel.ERROR)
        return jsonify({'error': str(e)}), 500

@main_blueprint.route('/load_default_project/<project_name>', methods=['GET'])
def load_default_project(project_name):
    try:
        add_to_log(f"Loading default project: {project_name}", LogLevel.INFO)
        project_file_path = EXTRACTS_PATH / f"{project_name}.json"
        if not project_file_path.exists():
            add_to_log(f"Project not found: {project_name}", LogLevel.ERROR)
            return jsonify({'error': 'Project not found'}), 404

        with open(project_file_path, 'r') as project_file:
            project_data = json.load(project_file)
        add_to_log(f"Loaded project: {project_name}", LogLevel.DEBUG)
        return jsonify(project_data), 200
    except Exception as e:
        add_to_log(f"Error loading project: {e}", LogLevel.ERROR)
        return jsonify({'error': str(e)}), 500

@main_blueprint.route('/upload', methods=['POST'])
def handle_project_upload():
    try:
        add_to_log("=== Starting: Uploading Project ===", LogLevel.INFO)
        create_empty_structure()

        if 'file' not in request.files:
            add_to_log("No file part in request", LogLevel.ERROR)
            return jsonify({'error': 'No file part'}), 400

        file = request.files['file']
        add_to_log(f"Received file: {file.filename}", LogLevel.DEBUG)

        if file.filename == '':
            add_to_log("No file selected", LogLevel.ERROR)
            return jsonify({'error': 'No selected file'}), 400

        # Save uploaded file
        file_path = UPLOADS_PATH / file.filename
        file.save(str(file_path))
        add_to_log(f"File saved to {file_path}", LogLevel.DEBUG)

        # Extract the file
        uploaded_zip_name = file_path.stem
        extract_path = EXTRACTS_PATH / uploaded_zip_name

        if extract_path.exists():
            add_to_log(f"Extract directory {extract_path} already exists. Deleting it.", LogLevel.DEBUG)
            shutil.rmtree(extract_path)

        extract_path.mkdir(parents=True, exist_ok=True)
        add_to_log(f"Created extraction directory: {extract_path}", LogLevel.TRACE)

        try:
            extract_archive(str(file_path), str(extract_path))
            add_to_log(f"File extracted to {extract_path}", LogLevel.INFO)
        except ValueError as e:
            add_to_log(f"Extraction error: {e}", LogLevel.ERROR)
            return jsonify({'error': str(e)}), 500

        # Find the scenario file
        try:
            scenario_file_path = next(extract_path.rglob('*.SCENARIO'))
            scenario_name = scenario_file_path.stem
            base_dir = scenario_file_path.parent

            project.extracted_base_path = base_dir.relative_to(EXTRACTS_PATH)
            add_to_log(f"Scenario file found: {scenario_name} at {base_dir}", LogLevel.INFO)
        except StopIteration:
            add_to_log("No .SCENARIO file found", LogLevel.ERROR)
            return jsonify({'error': 'No .SCENARIO file found'}), 500

        # Parse and validate the .SCENARIO file
        scenario_file_data = parse_scenario_file(str(scenario_file_path), scenario_file_path.name)
        add_to_log(f"Parsed scenario file: {scenario_file_path}", LogLevel.DEBUG)

        project.original_structure = check_file_existence(
            base_dir=base_dir,
            scenario_name=scenario_name,
            scenario_data=scenario_file_data['scenario_data'],
            extracted_base_path=project.extracted_base_path
        )
        project.modified_structure = project.original_structure.copy()
        scenario_file_data['projectFileStructure'] = project.modified_structure
        add_to_log("Scenario file structure validated", LogLevel.INFO)

        project.new_project = False

        # Cache the scenario data
        cache_file_path = EXTRACTS_PATH / f"{scenario_name}.json"
        with open(cache_file_path, 'w') as cache_file:
            json.dump(scenario_file_data, cache_file)
        add_to_log(f"Scenario data cached at {cache_file_path}", LogLevel.DEBUG)

        send_progress(100, "File uploaded and validated")
        add_to_log("=== Finished: Uploading Project ===", LogLevel.INFO)
        return jsonify(scenario_file_data), 200

    except Exception as e:
        add_to_log(f"Internal server error: {e}", LogLevel.ERROR)
        return jsonify({'error': str(e)}), 500

@main_blueprint.route('/rename_file', methods=['POST'])
def update_file_name():
    try:
        data = request.get_json()
        add_to_log(f"Received rename request: {data}", LogLevel.INFO)

        ext = data['ext']
        new_file_name = data['newFileName']

        if ext not in project.modified_structure:
            add_to_log(f"File type .{ext} not found in project structure", LogLevel.ERROR)
            return jsonify({'error': f'File type .{ext} not found in project structure'}), 400

        if not new_file_name:
            add_to_log("File name cannot be empty", LogLevel.ERROR)
            return jsonify({'error': 'Name cannot be empty'}), 400

        current_file_name = project.modified_structure[ext]['filename']
        project.modified_structure[ext]['filename'] = new_file_name
        project.modified_structure[ext]['isModified'] = True
        project.modified_structure[ext]['isRequired'] = True
        add_to_log(f"Renamed file .{ext} from {current_file_name} to {new_file_name}", LogLevel.DEBUG)

        return jsonify({"message": f"File renamed to {new_file_name}.{ext}"}), 200
    except Exception as e:
        add_to_log(f"Internal server error: {e}", LogLevel.ERROR)
        return jsonify({'error': str(e)}), 500

@main_blueprint.route('/export')
def export_project_files():
    try:
        add_to_log("=== Starting: Exporting Project ===", LogLevel.INFO)

        if 'scenario' not in project.modified_structure:
            add_to_log("'scenario' key missing in project structure", LogLevel.ERROR)
            return jsonify({'error': "'scenario' key missing in project structure"}), 400

        if not project.modified_structure['scenario']['filename']:
            add_to_log("Filename for 'scenario' is empty", LogLevel.ERROR)
            return jsonify({'error': "Filename for 'scenario' is empty"}), 400

        project.root_directory = project.extracted_base_path
        add_to_log(f"Project root directory set to {project.root_directory}", LogLevel.DEBUG)

        export_base_dir = EXPORTS_PATH / project.root_directory

        if export_base_dir.exists():
            add_to_log(f"Export directory {export_base_dir} already exists. Deleting it.", LogLevel.DEBUG)
            shutil.rmtree(export_base_dir)

        for ext, file_info in project.modified_structure.items():
            process_file_for_export(ext, file_info)

        zip_buffer = create_zip_archive()
        add_to_log("=== Finished: Exporting Project ===", LogLevel.INFO)
        return send_file(
            zip_buffer,
            mimetype='application/zip',
            as_attachment=True,
            download_name=f"{project.modified_structure['scenario']['filename']}.zip"
        )

    except Exception as e:
        add_to_log(f"Internal server error during export: {e}", LogLevel.ERROR)
        return jsonify({'error': str(e)}), 500
