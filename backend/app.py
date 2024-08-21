from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from message import send_progress, send_message, socketio, add_to_log
from config import UPLOAD_FOLDER, EXTRACT_FOLDER, EXPORT_FOLDER
from utilities import extract_archive, find_scenario_file, parse_scenario_file
from validation import validate_file_structure
import zipfile
import os
import io
import json

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/load_default_project/<project_name>', methods=['GET'])
def load_default_project(project_name):
    try:
        project_file_path = os.path.join(EXTRACT_FOLDER, f"{project_name}.json")
        if not os.path.exists(project_file_path):
            return jsonify({'error': 'Project not found'}), 404
        with open(project_file_path, 'r') as project_file:
            project_data = json.load(project_file)
            return jsonify(project_data), 200
    except Exception as e:
        send_message(f"!! Internal server error: {str(e)}")
        add_to_log(f"!! Internal server error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        print("Received upload request")  # Log request received
        if 'file' not in request.files:
            send_message("!! No file part")
            add_to_log("!! No file part")
            return jsonify({'error': 'No file part'}), 400

        file = request.files['file']
        if file.filename == '':
            send_message("!! No selected file")
            add_to_log("!! No selected file")
            return jsonify({'error': 'No selected file'}), 400

        # Save uploaded file
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)
        add_to_log(f"** File saved to {file_path}")

        # Extract the file
        extract_path = os.path.join(EXTRACT_FOLDER, os.path.splitext(file.filename)[0])
        if not os.path.exists(extract_path):
            os.makedirs(extract_path)

        try:
            extract_archive(file_path, extract_path)
            add_to_log(f"** File extracted to {extract_path}")
        except ValueError as e:
            send_message(f"!! Extraction error: {str(e)}")
            add_to_log(f"!! Extraction error: {str(e)}")
            return jsonify({'error': str(e)}), 500

        # Find the scenario name and set the base directory
        try:
            scenario_name, base_dir, scenario_file_name = find_scenario_file(extract_path)
            add_to_log(f"** Scenario name found: {scenario_name}, base directory: {base_dir}")
        except ValueError as e:
            send_message(f"!! No .SCENARIO file found: {str(e)}")
            add_to_log(f"!! No .SCENARIO file found: {str(e)}")
            return jsonify({'error': str(e)}), 500

        # Parse the .SCENARIO file
        scenario_file_path = os.path.join(base_dir, f"{scenario_name}.SCENARIO")
        scenario_file_data = parse_scenario_file(scenario_file_path, scenario_file_name)
        add_to_log(f"** Scenario file parsed: {scenario_file_path}")

        # Validate the file structure and save the validation results
        structure = validate_file_structure(base_dir, scenario_name, scenario_file_data['scenario_data'])
        scenario_file_data['structure'] = structure  # Save structure data in scenario_file_data

        # Cache the scenario data
        cache_file_path = os.path.join(EXTRACT_FOLDER, f"{scenario_name}.json")
        with open(cache_file_path, 'w') as cache_file:
            json.dump(scenario_file_data, cache_file)
        add_to_log(f"** Scenario data cached: {cache_file_path}")

        send_progress(100, "File uploaded and validated")
        return jsonify(scenario_file_data), 200

    except Exception as e:
        send_message(f"!! Internal server error: {str(e)}")
        add_to_log(f"!! Internal server error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# app.py
@app.route('/export', methods=['POST'])
def export_files():
    try:
        data = request.json
        scenario_name = data['scenario_name']
        user_inputs = data.get('user_inputs', {})  # This should be passed from the frontend containing user input values
        new_project = data.get('new_project', False)  # Flag to check if it's a new project
        
        add_to_log(f"Received export request for scenario: {scenario_name}")
        add_to_log(f"User inputs: {user_inputs}")
        add_to_log(f"New project: {new_project}")

        # Define the structure as per the requirement
        structure = {
            f"{scenario_name}.SCENARIO".lower(): {'required': True, 'exists': False},
            f"{scenario_name}\maps\{user_inputs['cvp']}.cvp".lower(): {'required': False, 'exists': False},
            f"{scenario_name}\maps\{user_inputs['mapx']}.mapx".lower(): {'required': False, 'exists': False},
            f"{scenario_name}\maps\{user_inputs['oof']}.oof".lower(): {'required': False, 'exists': False},
            f"{scenario_name}\maps\{user_inputs['regionincl']}.regionincl".lower(): {'required': False, 'exists': False},
            f"{scenario_name}\maps\orbats\{user_inputs['oob']}.oob".lower(): {'required': False, 'exists': False},
            f"{scenario_name}\maps\data\{user_inputs['wmdata']}.wmdata".lower(): {'required': False, 'exists': False},
            f"{scenario_name}\maps\data\{user_inputs['unit']}.unit".lower(): {'required': False, 'exists': False},
            f"{scenario_name}\maps\data\{user_inputs['pplx']}.pplx".lower(): {'required': False, 'exists': False},
            f"{scenario_name}\maps\data\{user_inputs['ttrx']}.ttrx".lower(): {'required': False, 'exists': False},
            f"{scenario_name}\maps\data\{user_inputs['terx']}.terx".lower(): {'required': False, 'exists': False},
            f"{scenario_name}\maps\data\{user_inputs['newsitems']}.newsitems".lower(): {'required': False, 'exists': False},
            f"{scenario_name}\maps\data\{user_inputs['prf']}.prf".lower(): {'required': False, 'exists': False},
        }

        print(f"Structure: {structure}")

        # Mark the files as required if they do not contain 'default' and user has provided inputs
        for key, value in user_inputs.items():
            if value and 'default' not in value.lower():
                if key in ['cvp', 'mapx', 'oof', 'regionincl', 'oob', 'wmdata', 'unit', 'pplx', 'ttrx', 'terx', 'newsitems', 'prf']:
                    structure[f"{scenario_name}\maps\{value}".lower()] = {'required': True, 'exists': False}

        if not new_project:  # Only proceed with existing project validation
            extract_path = os.path.join(EXTRACT_FOLDER, os.path.splitext(scenario_name)[0])
            _, base_dir = find_scenario_file(extract_path)
            add_to_log(f"** Using validated structure for export")
        else:
            base_dir = os.path.join(EXTRACT_FOLDER, scenario_name)  # Use a simple base directory for new projects

        # Create any missing required files based on the validated or constructed structure
        for path, info in structure.items():
            if info['required'] and not info['exists']:
                full_path = os.path.join(base_dir, path)
                os.makedirs(os.path.dirname(full_path), exist_ok=True)
                with open(full_path, 'w') as f:
                    f.write(f"Placeholder for {path}")
                add_to_log(f"** Created placeholder for missing file: {full_path}")

        # Proceed with creating ZIP file and exporting
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for root, _, files in os.walk(base_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, base_dir).replace("\\", "/").lower()
                    if arcname in structure or new_project:  # Allow export for new projects
                        zip_file.write(file_path, arcname=arcname)
                        add_to_log(f"** Added file to ZIP: {file_path} as {arcname}")
                    else:
                        add_to_log(f"** Skipped file: {file_path}")
            add_to_log(f"** ZIP file created")

        zip_buffer.seek(0)
        send_progress(100, "Export complete")
        return send_file(zip_buffer, mimetype='application/zip', as_attachment=True, download_name=f"{scenario_name}.zip")

    except Exception as e:
        send_message(f"!! Internal server error during export: {str(e)}")
        add_to_log(f"!! Internal server error during export: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    add_to_log("Starting server")
    socketio.init_app(app)
    socketio.run(app, debug=True)
