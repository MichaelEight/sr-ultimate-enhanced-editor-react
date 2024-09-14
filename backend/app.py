from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from message import send_progress, send_message, socketio, add_to_log
from config import (UPLOAD_FOLDER, EXTRACT_FOLDER, EXPORT_FOLDER,
                    DEFAULT_PROJECT_FILE_STRUCTURE, LOGGING_LEVEL,
                    DEFAULT_SETTINGS_STRUCTURE)
from utilities import extract_archive, find_scenario_file, parse_scenario_file
from validation import check_file_existence
from pathlib import Path
import zipfile
import io
import json
import shutil

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Initialize base directories using pathlib
UPLOADS_PATH = Path(UPLOAD_FOLDER)
EXTRACTS_PATH = Path(EXTRACT_FOLDER)
EXPORTS_PATH = Path(EXPORT_FOLDER)

# Define a Project class to encapsulate project data
class Project:
    def __init__(self):
        self.original_structure = {}
        self.modified_structure = {}
        self.new_project = True
        self.root_directory = Path('unnamed')
        self.extracted_base_path = Path('unnamed')
        self.settings_data = DEFAULT_SETTINGS_STRUCTURE.copy()

project = Project()

def create_empty_structure():
    project.original_structure = {}
    project.modified_structure = {}
    for ext, info in DEFAULT_PROJECT_FILE_STRUCTURE.items():
        project.modified_structure[ext] = info.copy()
    project.new_project = True
    project.root_directory = Path('unnamed')
    project.extracted_base_path = Path('unnamed')
    add_to_log("** Created empty (default) project structure")

@app.route('/updateSetting', methods=['POST'])
def update_setting():
    try:
        add_to_log("** Received updateSetting request", 'debug')
        data = request.get_json()
        add_to_log(f"Received updateSetting request: {data}", 'debug')

        if 'key' in data and 'value' in data:
            project.settings_data[data['key']] = data['value']
            return jsonify({"message": "Setting set successfully"}), 200
        else:
            return jsonify({"message": "Missing key or value"}), 400
    except Exception as e:
        add_to_log(f"Error updating setting: {e}", 'error')
        return jsonify({'error': str(e)}), 500

@app.route('/create_empty_project', methods=['GET'])
def create_empty_project():
    try:
        create_empty_structure()
        add_to_log("************ Creating Empty Project ************")

        # Return the default project structure
        return jsonify({
            "message": "Empty project created successfully",
            "newProjectFlag": project.new_project,
            "projectFileStructure": project.modified_structure
        }), 200
    except Exception as e:
        add_to_log(f"Error creating empty project: {e}", 'error')
        return jsonify({'error': str(e)}), 500

@app.route('/load_default_project/<project_name>', methods=['GET'])
def load_default_project(project_name):
    try:
        project_file_path = EXTRACTS_PATH / f"{project_name}.json"
        if not project_file_path.exists():
            return jsonify({'error': 'Project not found'}), 404
        with open(project_file_path, 'r') as project_file:
            project_data = json.load(project_file)
            return jsonify(project_data), 200
    except Exception as e:
        add_to_log(f"Error loading default project: {e}", 'error')
        return jsonify({'error': str(e)}), 500

@app.route('/upload', methods=['POST'])
def handle_project_upload():
    try:
        add_to_log("************ Uploading Project ************")
        create_empty_structure()

        if 'file' not in request.files:
            add_to_log("!! No file part", 'error')
            return jsonify({'error': 'No file part'}), 400

        file = request.files['file']
        if file.filename == '':
            add_to_log("!! No selected file", 'error')
            return jsonify({'error': 'No selected file'}), 400

        # Save uploaded file
        file_path = UPLOADS_PATH / file.filename
        file.save(str(file_path))
        add_to_log(f"** File received and saved to {file_path}")

        # Extract the file
        uploaded_zip_name = file_path.stem
        extract_path = EXTRACTS_PATH / uploaded_zip_name

        # If the extract directory already exists, delete it
        if extract_path.exists():
            add_to_log(f"** Extract directory {extract_path} already exists. Deleting it.")
            shutil.rmtree(extract_path)

        extract_path.mkdir(parents=True, exist_ok=True)

        try:
            extract_archive(str(file_path), str(extract_path))
            add_to_log(f"** File extracted to {extract_path}")
        except ValueError as e:
            add_to_log(f"!! Extraction error: {e}", 'error')
            return jsonify({'error': str(e)}), 500

        # Find the scenario file
        try:
            scenario_file_path = next(extract_path.rglob('*.SCENARIO'))
            scenario_name = scenario_file_path.stem
            base_dir = scenario_file_path.parent

            # Set the extracted_base_path to the directory containing the scenario file
            project.extracted_base_path = base_dir.relative_to(EXTRACTS_PATH)

            add_to_log(f"** Scenario name found: {scenario_name}, base directory: {base_dir}, extracted base path: {project.extracted_base_path}")

        except StopIteration:
            add_to_log("!! No .SCENARIO file found", 'error')
            return jsonify({'error': 'No .SCENARIO file found'}), 500


        # Parse the .SCENARIO file
        scenario_file_data = parse_scenario_file(str(scenario_file_path), scenario_file_path.name)
        add_to_log(f"** Scenario file parsed: {scenario_file_path}")

        # Validate the file structure and save the validation results
        project.original_structure = check_file_existence(
            base_dir=base_dir,
            scenario_name=scenario_name,
            scenario_data=scenario_file_data['scenario_data'],
            extracted_base_path=project.extracted_base_path
        )
        project.modified_structure = project.original_structure.copy()
        scenario_file_data['projectFileStructure'] = project.modified_structure
        add_to_log(f"** Scenario file structure validated")

        project.new_project = False

        # Cache the scenario data
        cache_file_path = EXTRACTS_PATH / f"{scenario_name}.json"
        with open(cache_file_path, 'w') as cache_file:
            json.dump(scenario_file_data, cache_file)
        add_to_log(f"** Scenario data cached: {cache_file_path}")

        send_progress(100, "File uploaded and validated")
        add_to_log("************ Upload completed ************")
        return jsonify(scenario_file_data), 200

    except Exception as e:
        add_to_log(f"!! Internal server error: {e}", 'error')
        return jsonify({'error': str(e)}), 500

@app.route('/rename_file', methods=['POST'])
def update_file_name():
    try:
        data = request.get_json()
        add_to_log(f"** Received rename request: {data}")

        ext = data['ext']
        new_file_name = data['newFileName']

        if ext not in project.modified_structure:
            add_to_log(f"!! File type .{ext} not found in project structure", 'error')
            return jsonify({'error': f'File type .{ext} not found in project structure'}), 400

        if not new_file_name:
            add_to_log("!! Name cannot be empty", 'error')
            return jsonify({'error': 'Name cannot be empty'}), 400

        current_file_name = project.modified_structure[ext]['filename']
        project.modified_structure[ext]['filename'] = new_file_name
        project.modified_structure[ext]['isModified'] = True
        project.modified_structure[ext]['isRequired'] = True
        add_to_log(f"** File .{ext} renamed from ({current_file_name}) to ({new_file_name})")

        return jsonify({"message": "File renamed"}), 200
    except Exception as e:
        add_to_log(f"!! Internal server error: {e}", 'error')
        return jsonify({'error': str(e)}), 500


def copy_file(source: Path, destination: Path) -> bool:
    """
    Copies a file from the source to the destination path.
    Returns True if successful, False otherwise.
    """
    try:
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy(str(source), str(destination))
        add_to_log(f"** Copied {source} to {destination}")
        return True
    except FileNotFoundError:
        add_to_log(f"!! File not found: {source}", 'error')
        return False
    except Exception as e:
        add_to_log(f"!! Error copying file from {source} to {destination}: {e}", 'error')
        return False

def create_zip_archive():
    """
    Creates a ZIP archive of the exported files and returns a BytesIO object.
    """
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        # Add the scenario file
        scenario_file_path = EXPORTS_PATH / f"{project.modified_structure['scenario']['filename']}.scenario"
        if scenario_file_path.exists():
            arcname = scenario_file_path.name  # Place at the root of the ZIP
            zip_file.write(scenario_file_path, arcname)
            add_to_log(f"** Added scenario file to ZIP: {scenario_file_path} as {arcname}")
        else:
            add_to_log(f"!! Scenario file not found: {scenario_file_path}", 'error')

        # Add the rest of the files
        export_base_dir = EXPORTS_PATH / project.extracted_base_path  # e.g., exported/FourIslands
        for file_path in export_base_dir.rglob('*'):
            if file_path.is_file():
                arcname = file_path.relative_to(EXPORTS_PATH).as_posix()
                zip_file.write(file_path, arcname)
                add_to_log(f"** Added file to ZIP: {file_path} as {arcname}")
    zip_buffer.seek(0)
    return zip_buffer

@app.route('/export')
def export_project_files():
    try:
        add_to_log("************ Exporting Project ************")

        # Ensure 'scenario' file exists in modified_structure
        if 'scenario' not in project.modified_structure:
            add_to_log("!! 'scenario' key missing in project.modified_structure", 'error')
            return jsonify({'error': "'scenario' key missing in project structure"}), 400

        # Ensure 'filename' is set for 'scenario'
        if not project.modified_structure['scenario']['filename']:
            add_to_log("!! 'filename' for 'scenario' is empty", 'error')
            return jsonify({'error': "Filename for 'scenario' is empty"}), 400

        # Use the extracted base path as the root directory for export
        project.root_directory = project.extracted_base_path
        add_to_log(f"** Project root directory: {project.root_directory}")

        # Determine the export base directory
        export_base_dir = EXPORTS_PATH / project.root_directory

        # If the export directory already exists, delete it
        if export_base_dir.exists():
            add_to_log(f"** Export directory {export_base_dir} already exists. Deleting it.")
            shutil.rmtree(export_base_dir)

        # Process each file in the modified structure
        for ext, file_info in project.modified_structure.items():
            process_file_for_export(ext, file_info)

        # Create ZIP archive
        zip_buffer = create_zip_archive()
        add_to_log("************ Export complete ************")
        return send_file(
            zip_buffer,
            mimetype='application/zip',
            as_attachment=True,
            download_name=f"{project.modified_structure['scenario']['filename']}.zip"
        )

    except Exception as e:
        add_to_log(f"!! Internal server error during export: {e}", 'error')
        return jsonify({'error': str(e)}), 500

def process_file_for_export(ext, file_info):
    modified_filename = file_info['filename']
    is_required = file_info['isRequired']
    does_exist = file_info.get('doesExist', False)
    is_modified = file_info.get('isModified', False)
    modified_dir_path = Path(file_info.get('dir', ''))

    if not modified_filename or not is_required:
        add_to_log(f"** Skipping file: {modified_filename}.{ext} (Not required or filename empty)")
        return

    # Determine original file info
    original_file_info = project.original_structure.get(ext, {})
    original_filename = original_file_info.get('filename', modified_filename)
    original_dir_path = Path(original_file_info.get('dir', modified_dir_path))

    # Determine base directories
    extracted_base_dir = EXTRACTS_PATH / project.extracted_base_path
    exported_base_dir = EXPORTS_PATH / project.extracted_base_path

    # Construct paths
    if ext == 'scenario':
        # Place the scenario file at the root of the exports directory
        extracted_file_path = extracted_base_dir / f"{original_filename}.{ext}"
        exported_file_path = EXPORTS_PATH / f"{modified_filename}.{ext}"
    else:
        extracted_file_path = extracted_base_dir / original_dir_path / f"{original_filename}.{ext}"
        exported_file_path = exported_base_dir / modified_dir_path / f"{modified_filename}.{ext}"

    # Log paths for debugging
    add_to_log(f"Processing {ext} file:")
    add_to_log(f"Extracted file path: {extracted_file_path}")
    add_to_log(f"Exported file path: {exported_file_path}")

    if does_exist and not is_modified:
        # Copy the file from extracted to exported
        success = copy_file(extracted_file_path, exported_file_path)
        if not success:
            add_to_log(f"!! Failed to copy file: {extracted_file_path} to {exported_file_path}", 'error')
    else:
        # Create a new placeholder file
        try:
            exported_file_path.parent.mkdir(parents=True, exist_ok=True)
            with open(exported_file_path, 'w') as f:
                f.write(f"Placeholder content for {modified_filename}.{ext}")
            add_to_log(f"** Created new or modified file: {exported_file_path}")
        except Exception as e:
            add_to_log(f"!! Failed to create placeholder file: {exported_file_path}. Error: {e}", 'error')

if __name__ == '__main__':
    add_to_log("===============================[ Starting server ]===============================")
    add_to_log("************ SETUP ************")
    add_to_log(f"Logging level: {LOGGING_LEVEL}", 'info')
    add_to_log(f"DEFAULT_STRUCTURE: {DEFAULT_PROJECT_FILE_STRUCTURE}", 'debug')
    add_to_log(f"UPLOAD_FOLDER: {UPLOADS_PATH}", 'debug')
    add_to_log(f"EXTRACT_FOLDER: {EXTRACTS_PATH}", 'debug')
    add_to_log(f"EXPORT_FOLDER: {EXPORTS_PATH}", 'debug')
    
    socketio.init_app(app)
    socketio.run(app, debug=True)
