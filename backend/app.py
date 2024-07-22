# app.py
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from message import send_progress, send_message, socketio
from config import UPLOAD_FOLDER, EXTRACT_FOLDER, EXPORT_FOLDER
from utilities import extract_archive, find_scenario_file, parse_scenario_file
from validation import validate_file_structure
import zipfile
import os
import io
import json

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            send_message("!! No file part")
            return jsonify({'error': 'No file part'}), 400

        file = request.files['file']
        if file.filename == '':
            send_message("!! No selected file")
            return jsonify({'error': 'No selected file'}), 400

        # Save uploaded file
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)

        # Extract the file
        extract_path = os.path.join(EXTRACT_FOLDER, os.path.splitext(file.filename)[0])
        if not os.path.exists(extract_path):
            os.makedirs(extract_path)

        try:
            extract_archive(file_path, extract_path)
        except ValueError as e:
            send_message(f"!! Extraction error: {str(e)}")
            return jsonify({'error': str(e)}), 500

        # Find the scenario name and set the base directory
        try:
            scenario_name, base_dir = find_scenario_file(extract_path)
        except ValueError as e:
            send_message(f"!! No .SCENARIO file found: {str(e)}")
            return jsonify({'error': str(e)}), 500

        # Validate the file structure
        structure = validate_file_structure(base_dir, scenario_name)

        # Parse the .SCENARIO file
        scenario_file_path = os.path.join(base_dir, f"{scenario_name}.SCENARIO")
        scenario_file_data = parse_scenario_file(scenario_file_path)

        print(json.dumps(scenario_file_data['scenario_data'], indent=4))  # Print the JSON data for debugging
        print(json.dumps(scenario_file_data['settings_data'], indent=4))  # Print the JSON data for debugging

        send_progress(100, "File uploaded and validated")
        return jsonify(structure), 200

    except Exception as e:
        send_message(f"!! Internal server error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/export', methods=['POST'])
def export_files():
    try:
        data = request.json
        scenario_name = data['scenario_name']
        structure = data['structure']
        extract_path = os.path.join(EXTRACT_FOLDER, os.path.splitext(scenario_name)[0])

        # Find the base directory of the scenario file
        _, base_dir = find_scenario_file(extract_path)

        # Create any missing required files
        for path, info in structure.items():
            if info['required'] and not info['exists']:
                full_path = os.path.join(base_dir, path)
                os.makedirs(os.path.dirname(full_path), exist_ok=True)
                with open(full_path, 'w') as f:
                    f.write(f"Placeholder for {path}")

        # Create a ZIP file
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for root, _, files in os.walk(base_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, base_dir).replace("\\", "/")
                    if arcname in structure:
                        zip_file.write(file_path, arcname=arcname)

        zip_buffer.seek(0)
        send_progress(100, "Export complete")
        return send_file(zip_buffer, mimetype='application/zip', as_attachment=True, download_name=f"{scenario_name}.zip")

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    socketio.init_app(app)
    socketio.run(app, debug=True)
