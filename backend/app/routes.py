# routes.py

from flask import Blueprint, request, jsonify, send_file
from pathlib import Path
import shutil
import json
import os
import copy

from .models import project
from .utils.logging_utils import add_to_log, LogLevel, send_progress
from .config import Config
from .services.project_services import process_file_for_export
from .validation.validators import check_file_existence

from .utils.file_utils import create_zip_archive, extract_archive

from .importers.scenario_importer import import_scenario_file
from .exporters.scenario_exporter import export_scenario_file

main_blueprint = Blueprint('main', __name__)

# Initialize base directories using pathlib
UPLOADS_PATH = Path(Config.UPLOAD_FOLDER)
EXTRACTS_PATH = Path(Config.EXTRACT_FOLDER)
EXPORTS_PATH = Path(Config.EXPORT_FOLDER)

@main_blueprint.route('/check_seen_since_last_update', methods=['POST'])
def check_seen_since_last_update():
    try:
        add_to_log("Received check_seen_since_last_update request", LogLevel.INFO)
        data = request.get_json()
        add_to_log(f"Request data: {data}", LogLevel.DEBUG)

        tab_name = data.get('tab')
        if not tab_name or tab_name not in project.seen_since_last_update:
            add_to_log("Invalid or missing tab name in request", LogLevel.ERROR)
            return jsonify({'error': 'Invalid or missing tab name'}), 400

        seen_flag = project.seen_since_last_update[tab_name]
        add_to_log(f"Seen flag for '{tab_name}': {seen_flag}", LogLevel.DEBUG)

        if not seen_flag:
            # Set the flag to True now that the data will be fetched
            project.seen_since_last_update[tab_name] = True
            add_to_log(f"Updated seen flag for '{tab_name}' to True", LogLevel.DEBUG)

        return jsonify({'seenSinceLastUpdate': seen_flag}), 200
    except Exception as e:
        add_to_log(f"Error in check_seen_since_last_update: {e}", LogLevel.ERROR)
        return jsonify({'error': str(e)}), 500


@main_blueprint.route('/updateSetting', methods=['POST'])
def update_setting():
    try:
        add_to_log("Received updateSetting request", LogLevel.INFO)
        data = request.get_json()
        add_to_log(f"Request data: {data}", LogLevel.DEBUG)

        if 'key' in data and 'value' in data:
            label = f"settings_data.{data['key']}"
            project.change_value(label, data['value'])
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
        project.create_empty()
        project.original_structure = {}
        project.modified_structure = {}
        for ext, info in Config.DEFAULT_PROJECT_FILE_STRUCTURE.items():
            project.modified_structure[ext] = info.copy()
        project.new_project = True
        project.root_directory = Path('unnamed')
        project.extracted_base_path = Path('unnamed')
        add_to_log("Project structure initialized", LogLevel.TRACE)

        return jsonify({
            "message": "Empty project created successfully",
            "newProjectFlag": project.new_project,
            "projectFileStructure": project.modified_structure
        }), 200
    except Exception as e:
        add_to_log(f"Error creating empty project: {e}", LogLevel.ERROR)
        return jsonify({'error': str(e)}), 500

@main_blueprint.route('/load_data_from_file', methods=['POST'])
def load_data_from_file_route():
    try:
        data = request.get_json()
        file_path = data.get('file_path')
        if not file_path:
            return jsonify({'error': 'No file path provided'}), 400
        project.load_data_from_file(file_path)
        return jsonify({'message': f'Data loaded from {file_path}'}), 200
    except Exception as e:
        add_to_log(f"Error loading data from file: {e}", LogLevel.ERROR)
        return jsonify({'error': str(e)}), 500

@main_blueprint.route('/get_data', methods=['GET'])
def get_data():
    try:
        data = project.get_data()
        return jsonify(data), 200
    except Exception as e:
        add_to_log(f"Error getting data: {e}", LogLevel.ERROR)
        return jsonify({'error': str(e)}), 500

@main_blueprint.route('/change_value', methods=['POST'])
def change_value():
    try:
        data = request.get_json()
        label = data.get('label')
        new_value = data.get('value')
        if label is None or new_value is None:
            return jsonify({'error': 'Missing label or value'}), 400
        project.change_value(label, new_value)
        return jsonify({'message': 'Value changed successfully'}), 200
    except Exception as e:
        add_to_log(f"Error changing value: {e}", LogLevel.ERROR)
        return jsonify({'error': str(e)}), 500

@main_blueprint.route('/upload', methods=['POST'])
def handle_project_upload():
    try:
        add_to_log("=== Starting: Uploading Project ===", LogLevel.INFO)
        project.create_empty()
        add_to_log("Project data reset with create_empty()", LogLevel.TRACE)

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
        add_to_log(f"Starting file extraction to {extract_path}", LogLevel.TRACE)

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

        # Find the .scenario file
        try:
            add_to_log(f"Searching for .scenario file in {extract_path}", LogLevel.TRACE)
            scenario_file_path = next(extract_path.rglob('*.SCENARIO'))
            scenario_name = scenario_file_path.stem
            base_dir = scenario_file_path.parent

            project.extracted_base_path = base_dir.relative_to(EXTRACTS_PATH)
            add_to_log(f"Scenario file found: {scenario_name} at {base_dir}", LogLevel.INFO)
        except StopIteration:
            add_to_log("No .SCENARIO file found", LogLevel.ERROR)
            return jsonify({'error': 'No .SCENARIO file found'}), 500

        # Parse and validate the .scenario file
        add_to_log(f"Parsing .scenario file: {scenario_file_path}", LogLevel.TRACE)
        scenario_file_data = import_scenario_file(str(scenario_file_path))
        add_to_log(f"Parsed .scenario file data: {scenario_file_data}", LogLevel.TRACE)

        # Update project data with scenario data and settings
        project.scenario_data = scenario_file_data['scenario_data']
        project.settings_data = scenario_file_data['settings_data']
        add_to_log(f"Loaded scenario_data: {project.scenario_data}", LogLevel.TRACE)
        add_to_log(f"Loaded settings_data: {project.settings_data}", LogLevel.TRACE)

        # Determine which files exist based on the .scenario file
        add_to_log(f"Checking file existence based on .scenario file", LogLevel.TRACE)
        project.original_structure = check_file_existence(
            base_dir=base_dir,
            scenario_name=scenario_name,
            scenario_data=project.scenario_data,
            extracted_base_path=project.extracted_base_path
        )
        add_to_log(f"File existence check complete. Original structure: {project.original_structure}", LogLevel.TRACE)

        project.modified_structure = copy.deepcopy(project.original_structure)
        add_to_log(f"Scenario file structure validated: {project.modified_structure}", LogLevel.INFO)

        project.new_project = False

        # Load data from existing files as specified in the .scenario file
        for ext, file_info in project.modified_structure.items():
            if ext not in project.supported_extensions:
                add_to_log(f"Skipping unsupported file type: {ext}", LogLevel.WARNING)
                continue

            if file_info['doesExist']:
                filename = file_info['filename']
                directory = file_info.get('dir', '')
                dir_path = Path(directory)
                file_full_path = base_dir / dir_path / f"{filename}.{ext}"

                add_to_log(f"Loading data from file: {file_full_path}", LogLevel.TRACE)
                if file_full_path.exists():
                    project.load_data_from_file(str(file_full_path))
                    add_to_log(f"Data loaded from file: {file_full_path}", LogLevel.DEBUG)
                else:
                    add_to_log(f"File not found: {file_full_path}", LogLevel.WARNING)

        # After successful upload and data loading
        # Reset all seen flags to False
        project.seen_since_last_update = {key: False for key in project.seen_since_last_update}
        add_to_log("Reset seen_since_last_update flags after upload", LogLevel.DEBUG)

        send_progress(100, "File uploaded and validated")
        add_to_log("=== Finished: Uploading Project ===", LogLevel.INFO)

        # Prepare response data
        response_data = {
            "message": "Project uploaded and data loaded successfully",
            "settings_data": project.settings_data,
            "projectFileStructure": project.modified_structure
        }

        return jsonify(response_data), 200

    except Exception as e:
        add_to_log(f"Internal server error: {e}", LogLevel.ERROR)
        return jsonify({'error': str(e)}), 500

@main_blueprint.route('/load_default_project/<project_name>', methods=['GET'])
def load_default_project(project_name):
    # TODO add seen_since_last_update logic
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

        # Ensure the export directory exists
        export_base_dir.mkdir(parents=True, exist_ok=True)

        # Export scenario file
        scenario_filename = f"{project.modified_structure['scenario']['filename']}.SCENARIO"
        scenario_output_path = export_base_dir / scenario_filename
        project.export_scenario_file(str(scenario_output_path))

        # Export CVP file if present
        if 'cvp' in project.modified_structure and project.modified_structure['cvp']['filename']:
            cvp_filename = f"{project.modified_structure['cvp']['filename']}.CVP"
            cvp_output_path = export_base_dir / cvp_filename
            project.export_cvp_file(str(cvp_output_path))

        # Process other files for export as needed
        # For now, we can process other files using process_file_for_export
        for ext, file_info in project.modified_structure.items():
            if ext in ['scenario', 'cvp']:
                continue  # Already handled
            process_file_for_export(ext, file_info)

        zip_buffer = create_zip_archive(export_base_dir)
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
