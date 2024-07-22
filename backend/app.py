# backend/app.py
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from message import send_progress, send_message, socketio
from config import UPLOAD_FOLDER, EXTRACT_FOLDER, EXPORT_FOLDER
from utilities import extract_archive, find_scenario_file
from validation import validate_file_structure
import zipfile
import os
import io
import re
import json

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

def extract_scenario_data(file_path):
    with open(file_path, 'r') as file:
        content = file.read()

    data = {
        "cvp": None,
        "regionincl": None,
        "unit": None,
        "pplx": None,
        "ttrx": None,
        "terx": None,
        "wmdata": None,
        "newsitems": None,
        "profile": None,
        "oob": None,
        "precache": None,
        "postcache": None,
        "savfile": None,
        "mapfile": None
    }

    include_pattern = re.compile(r'#include\s+"([^"]+)",\s*"([^"]+)"')
    savfile_pattern = re.compile(r'savfile\s+"([^"]+)"')
    mapfile_pattern = re.compile(r'mapfile\s+"([^"]+)"')

    for match in include_pattern.finditer(content):
        filename = match.group(1)
        if filename.endswith('.CVP'):
            data['cvp'] = filename
        elif filename.endswith('.REGIONINCL'):
            data['regionincl'] = filename
        elif filename.endswith('.UNIT'):
            data['unit'] = filename
        elif filename.endswith('.PPLX'):
            data['pplx'] = filename
        elif filename.endswith('.TTRX'):
            data['ttrx'] = filename
        elif filename.endswith('.TERX'):
            data['terx'] = filename
        elif filename.endswith('.WMDATA'):
            data['wmdata'] = filename
        elif filename.endswith('.NEWSITEMS'):
            data['newsitems'] = filename
        elif filename.endswith('.PRF'):
            data['profile'] = filename
        elif filename.endswith('.OOB'):
            data['oob'] = filename

    savfile_match = savfile_pattern.search(content)
    if savfile_match:
        data['savfile'] = savfile_match.group(1)

    mapfile_match = mapfile_pattern.search(content)
    if mapfile_match:
        data['mapfile'] = mapfile_match.group(1)

    return data

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

        # Extract data from the .SCENARIO file
        scenario_file_path = os.path.join(base_dir, f"{scenario_name}.SCENARIO")
        scenario_data = extract_scenario_data(scenario_file_path)

        send_progress(100, "File uploaded and validated")
        return jsonify({
            'structure': structure,
            'scenario_data': scenario_data
        }), 200

    except Exception as e:
        send_message(f"!! Internal server error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    socketio.init_app(app)
    socketio.run(app, debug=True)
