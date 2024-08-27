from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from message import send_progress, send_message, socketio, add_to_log
from config import UPLOAD_FOLDER, EXTRACT_FOLDER, EXPORT_FOLDER
from utilities import extract_archive, find_scenario_file, parse_scenario_file
from validation import check_file_existance
import zipfile
import os
import io
import json

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# TODO Add more log messages
# TODO Add points of progress
# TODO IMPORTANT! Specify, when app is using exported dir and when some other one

# TODO make it null, empty or default unless project is created, uploaded or default project is used
structure = {
    'scenario':    {'isRequired': True,  'doesExist': False, 'isModified': False, 'dir': '\\',               'filename': ""},
    'cvp':         {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': '\\maps\\',         'filename': ""},
    'mapx':        {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': '\\maps\\',         'filename': ""},
    'oof':         {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': '\\maps\\',         'filename': ""},
    'regionincl':  {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': '\\maps\\',         'filename': ""},
    'oob':         {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': '\\maps\\orbats\\', 'filename': ""},
    'wmdata':      {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': '\\maps\\data\\',   'filename': ""},
    'unit':        {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': '\\maps\\data\\',   'filename': ""},
    'pplx':        {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': '\\maps\\data\\',   'filename': ""},
    'ttrx':        {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': '\\maps\\data\\',   'filename': ""},
    'terx':        {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': '\\maps\\data\\',   'filename': ""},
    'newsitems':   {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': '\\maps\\data\\',   'filename': ""},
    'prf':         {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': '\\maps\\data\\',   'filename': ""}
}

# True -- new empty project; False -- user uploaded project or used default one
isNewProject = True

# Base directory of the project, just server-side info
# TODO Clear folder 'unnamed' and then create it in every launch, so it is a debug/safety feature
# TODO Set to received if uploaded, otherwise to scenario_name 
projectBaseDir = 'unnamed'

# TODO @app.route -- when creating empty scenario, create empty scenario with default values

# TODO Prepare default projects
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
        add_to_log(f"** File received and saved to {file_path}")

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
        # TODO MODIFY, INCLUDE UPDATED FUNCTION & OUTPUT
        # TODO Make sure frontend loads new structure; it's easier to write filenames
        structure = check_file_existance(base_dir, scenario_name, scenario_file_data['scenario_data'])
        scenario_file_data['structure'] = structure  # Save structure data in scenario_file_data
        add_to_log(f"** Scenario structure validated")
        add_to_log(f"base_dir: {base_dir}, scenario_name: {scenario_name}")
        add_to_log(f"structure: {structure}")

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

# TODO @app.route -- set isModified for given label in structure

# TODO @app.route -- rename file in structure based on change in frontend (on lost focus or enter pressed)

# TODO @app.route -- load file based on tab selected and current filename, send data to frontend
# Note for frontend - don't reload if filename didn't change, unless user presses "reload" button

# app.py
@app.route('/export')
def export_files():
    try:
        # FIXME modify to include newest structure info
        # Assuming structure is updated right away, get data from currently existing structure

        # data = request.json
        # scenario_name = data['scenario_name']
        # user_inputs = data.get('user_inputs', {})  # This should be passed from the frontend containing user input values
        # new_project = data.get('new_project', False)  # Flag to check if it's a new project
        # add_to_log(f"Received export request for scenario: {scenario_name}")
        # add_to_log(f"User inputs: {user_inputs}")
        # add_to_log(f"New project: {new_project}")

        scenario_name = structure['scenario']['filename']

        # TODO Mark files as required, if nondefault name
        # TODO separate files, which don't have default name, rather they have a list of default files (e.g. gc2020, 1936...)
        # for key, value in user_inputs.items():
        #     if value and 'default' not in value.lower():
        #         if key in ['cvp', 'mapx', 'oof', 'regionincl', 'oob', 'wmdata', 'unit', 'pplx', 'ttrx', 'terx', 'newsitems', 'prf']:
        #             structure[f"{scenario_name}\maps\{value}".lower()] = {'required': True, 'exists': False}

        # Set base project name to proceed. Use this var: projectBaseDir
        # if isNewProject: # DEBUG: TURNED OFF UNTIL NEEDED # FIXME
        projectBaseDir = f'\{scenario_name}\'
        
        
        # Create any missing required files based on the structure
        # for ext in structure:
        #     if structure[ext]['isRequired'] and not structure[ext]['doesExist']:
        #         path = projectBaseDir + structure[ext]['dir'] + structure[ext]['filename'] + '.' + ext
        #         os.makedirs(os.path.dirname(path), exist_ok=True)
        #         with open(path, 'w') as f:
        #             f.write(f"Placeholder for {path}")
        #         add_to_log(f"** Created placeholder for missing file: {path}")

        # Proceed with creating ZIP file and exporting
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for ext in structure:
                pass
                # TODO Export
                # If !isRequired -- skip it
                # If doesExist and !isModified -- copy from previous exported
                # If (doesExist and isModified) or !doesExist  -- create new file
                # REMEMBER to take correct path (export vs extracted)
                # OR prepare everything in 'exported' and then ZIP it and send

            # for root, _, files in os.walk(projectBaseDir):
            #     for file in files:
            #         filePath = os.path.join(root, file)
            #         arcname = os.path.relpath(filePath, projectBaseDir).replace("\\", "/").lower() # FIXME eliminate need of .lower()
            #         if arcname in structure or isNewProject:  # Allow export for new projects
            #             zip_file.write(filePath, arcname=arcname)
            #             add_to_log(f"** Added file to ZIP: {filePath} as {arcname}")
            #         else:
            #             add_to_log(f"** Skipped file: {filePath}")
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
