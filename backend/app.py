# backend/app.py
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import zipfile
import rarfile
import os
import io

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")

UPLOAD_FOLDER = 'uploads'
EXTRACT_FOLDER = 'extracted'
EXPORT_FOLDER = 'exported'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
if not os.path.exists(EXTRACT_FOLDER):
    os.makedirs(EXTRACT_FOLDER)
if not os.path.exists(EXPORT_FOLDER):
    os.makedirs(EXPORT_FOLDER)

def send_progress(progress, message):
    socketio.emit('progress', {'progress': progress, 'message': message})

def extract_archive(file_path, extract_path):
    if file_path.endswith('.zip'):
        with zipfile.ZipFile(file_path, 'r') as zip_ref:
            zip_ref.extractall(extract_path)
    elif file_path.endswith('.rar'):
        with rarfile.RarFile(file_path, 'r') as rar_ref:
            rar_ref.extractall(extract_path)
    else:
        raise ValueError("Unsupported archive format")

def find_scenario_file(extract_path):
    for root, _, files in os.walk(extract_path):
        for file in files:
            if file.endswith('.SCENARIO'):
                return os.path.splitext(file)[0], root
    raise ValueError("No .SCENARIO file found")

def send_message(message):
    socketio.emit('message', {'message': message})

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
        structure = {
            f"{scenario_name}.SCENARIO": {'required': True, 'exists': False},
            f"MAPS/{scenario_name}.CVP": {'required': False, 'exists': False},
            f"MAPS/{scenario_name}.MAPX": {'required': False, 'exists': False},
            f"MAPS/{scenario_name}.OOF": {'required': False, 'exists': False},
            f"MAPS/{scenario_name}.REGIONINCL": {'required': False, 'exists': False},
            f"MAPS/ORBATS/{scenario_name}.OOB": {'required': False, 'exists': False},
            f"MAPS/DATA/{scenario_name}.WMDATA": {'required': False, 'exists': False},
            f"MAPS/DATA/{scenario_name}.UNIT": {'required': False, 'exists': False},
            f"MAPS/DATA/{scenario_name}.PPLX": {'required': False, 'exists': False},
            f"MAPS/DATA/{scenario_name}.TTRX": {'required': False, 'exists': False},
            f"MAPS/DATA/{scenario_name}.TERX": {'required': False, 'exists': False},
            f"MAPS/DATA/{scenario_name}.NEWSITEMS": {'required': False, 'exists': False},
            f"MAPS/DATA/{scenario_name}.PRF": {'required': False, 'exists': False},
        }

        for root, _, files in os.walk(base_dir):
            for file in files:
                relative_path = os.path.relpath(os.path.join(root, file), base_dir).replace("\\", "/")
                if relative_path in structure:
                    structure[relative_path]['exists'] = True
                else:
                    send_message(f"?? Unexpected file: {relative_path}")

                    # Check for out of place files
                    expected_folder = '/'.join(relative_path.split('/')[:-1])
                    for key in structure.keys():
                        if key.startswith(expected_folder) and file in key:
                            send_message(f"?? File out of place: {relative_path}")
                            break

        # Check for multiple files with the same extension
        extension_count = {}
        for relative_path in structure.keys():
            ext = os.path.splitext(relative_path)[1]
            if ext not in extension_count:
                extension_count[ext] = 0
            if structure[relative_path]['exists']:
                extension_count[ext] += 1
                if extension_count[ext] > 1:
                    send_message(f"?? Possible file conflict: {relative_path}")

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
                    zip_file.write(file_path, arcname=arcname)

        zip_buffer.seek(0)
        send_progress(100, "Export complete")
        return send_file(zip_buffer, mimetype='application/zip', as_attachment=True, download_name=f"{scenario_name}.zip")

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    socketio.run(app, debug=True)
