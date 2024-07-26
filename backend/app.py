from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from message import send_progress, send_message, socketio
from config import UPLOAD_FOLDER, EXTRACT_FOLDER, EXPORT_FOLDER
from utilities import extract_archive, find_scenario_file, parse_scenario_file
from validation import validate_file_structure
import zipfile
import os
import io

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
        send_message(f"** File saved to {file_path}")

        # Extract the file
        extract_path = os.path.join(EXTRACT_FOLDER, os.path.splitext(file.filename)[0])
        if not os.path.exists(extract_path):
            os.makedirs(extract_path)

        try:
            extract_archive(file_path, extract_path)
            send_message(f"** File extracted to {extract_path}")
        except ValueError as e:
            send_message(f"!! Extraction error: {str(e)}")
            return jsonify({'error': str(e)}), 500

        # Find the scenario name and set the base directory
        try:
            scenario_name, base_dir = find_scenario_file(extract_path)
            send_message(f"** Scenario name found: {scenario_name}, base directory: {base_dir}")
        except ValueError as e:
            send_message(f"!! No .SCENARIO file found: {str(e)}")
            return jsonify({'error': str(e)}), 500

        # Parse the .SCENARIO file
        scenario_file_path = os.path.join(base_dir, f"{scenario_name}.SCENARIO")
        scenario_file_data = parse_scenario_file(scenario_file_path)
        send_message(f"** Scenario file parsed: {scenario_file_path}")

        # Validate the file structure
        structure = validate_file_structure(base_dir, scenario_name, scenario_file_data['scenario_data'])
        send_message("** File structure validated")

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
        send_message(f"** Base directory found: {base_dir}")

        # Create any missing required files
        for path, info in structure.items():
            if info['required'] and not info['exists']:
                full_path = os.path.join(base_dir, path)
                os.makedirs(os.path.dirname(full_path), exist_ok=True)
                with open(full_path, 'w') as f:
                    f.write(f"Placeholder for {path}")
                send_message(f"** Created placeholder for missing file: {full_path}")

        # Create a ZIP file
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            send_message(f"Opened zip file")
            for root, _, files in os.walk(base_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, base_dir).replace("\\", "/").lower()
                    if arcname in structure:
                        zip_file.write(file_path, arcname=arcname)
                        send_message(f"** Added file to ZIP: {file_path} as {arcname}")
                    else:
                        send_message(f"** Skipped file: {file_path}")
            send_message(f"** ZIP file created")

        zip_buffer.seek(0)
        send_progress(100, "Export complete")
        return send_file(zip_buffer, mimetype='application/zip', as_attachment=True, download_name=f"{scenario_name}.zip")

    except Exception as e:
        send_message(f"!! Internal server error during export: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    socketio.init_app(app)
    socketio.run(app, debug=True)
