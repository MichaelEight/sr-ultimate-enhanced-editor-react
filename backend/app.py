from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from message import send_progress, send_message, socketio, add_to_log
from config import UPLOAD_FOLDER, EXTRACT_FOLDER, EXPORT_FOLDER, DEFAULT_PROJECT_FILE_STRUCTURE, LOGGING_LEVEL
from utilities import extract_archive, find_scenario_file, parse_scenario_file
from validation import check_file_existance
import zipfile
import os
import io
import json
import shutil

app = Flask(__name__)
# CORS(app, resources={r"/*": {"origins": "*"}}) # Debug only!
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# NOTE - dir other than .scenario must have {scenario}\\ ... at the beginning
def create_empty_structure():
    global structure

    structure = DEFAULT_PROJECT_FILE_STRUCTURE

# True -- new empty project; False -- user uploaded project or used default one
isNewProject = True

# Base directory of the project, just server-side info
projectBaseDir = 'unnamed'
extractedProjectBasePath = 'unnamed'

@app.route('/create_empty_project', methods=['GET'])
def create_empty_project():
    global isNewProject, structure
    add_to_log("************ Creating Empty Project ************")
    isNewProject = True
    create_empty_structure()
    add_to_log("** Created empty (default) structure")

    # Return a JSON response
    return jsonify({"message": "Empty project created successfully", "isNewProject": isNewProject, "structure": structure}), 200

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
    global structure # This freaking keyword costed me weeks of my life. I FORGOT IT AAAAHHHH 2024/08/30 14:41, few weeks wasted
    global isNewProject, extractedProjectBasePath
    try:
        add_to_log("************ Uploading Project ************")

        create_empty_structure()
        add_to_log("** Reseted structure to default")

        print("Received upload request")
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
        uploadedZIPfilename = os.path.splitext(file.filename)[0]
        extract_path = os.path.join(EXTRACT_FOLDER, uploadedZIPfilename)
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

            # Remove EXTRACT_FOLDER from base_dir
            if base_dir.startswith(EXTRACT_FOLDER):
                extractedProjectBasePath = base_dir.replace(EXTRACT_FOLDER, '', 1).lstrip(os.sep)
                add_to_log(f"** ExtractedProjectBasePath (removed EXTRACT_FOLDER): {extractedProjectBasePath}")
            else:
                extractedProjectBasePath = base_dir  # If EXTRACT_FOLDER isn't found, keep base_dir as is
                add_to_log(f"** ExtractedProjectBasePath (base_dir): {extractedProjectBasePath}")

            add_to_log(f"** Scenario name found: {scenario_name}, base directory: {base_dir}, extractedProjectBasePath: {extractedProjectBasePath}")
        except ValueError as e:
            send_message(f"!! No .SCENARIO file found: {str(e)}")
            add_to_log(f"!! No .SCENARIO file found: {str(e)}")
            return jsonify({'error': str(e)}), 500

        # Parse the .SCENARIO file
        scenario_file_path = os.path.join(base_dir, f"{scenario_name}.SCENARIO")
        scenario_file_data = parse_scenario_file(scenario_file_path, scenario_file_name)
        add_to_log(f"** Scenario file parsed: {scenario_file_path}")

        # Validate the file structure and save the validation results
        # TODO Make sure frontend loads new structure; it's easier to write filenames
        structure = check_file_existance(base_dir, scenario_name, scenario_file_data['scenario_data'], extractedProjectBasePath)
        scenario_file_data['structure'] = structure  # Save structure data in scenario_file_data
        add_to_log(f"** Scenario structure validated")
        add_to_log(f"base_dir: {base_dir}, scenario_name: {scenario_name}")
        add_to_log(f"structure: {structure}")

        isNewProject = False

        # Cache the scenario data
        cache_file_path = os.path.join(EXTRACT_FOLDER, f"{scenario_name}.json")
        with open(cache_file_path, 'w') as cache_file:
            json.dump(scenario_file_data, cache_file)
        add_to_log(f"** Scenario data cached: {cache_file_path}")

        send_progress(100, "File uploaded and validated")
        add_to_log("************ Upload completed ************")
        return jsonify(scenario_file_data), 200

    except Exception as e:
        send_message(f"!! Internal server error: {str(e)}")
        add_to_log(f"!! Internal server error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# TODO @app.route -- set isModified for given label in structure

# TODO @app.route -- rename file in structure based on change in frontend (on lost focus or enter pressed)
@app.route('/rename_file', methods=['POST'])
def rename_file():
    global structure
    try:
        data = request.get_json()
        add_to_log(f"** Received rename request: {data}")
        ext = data['ext']
        newFileName = data['newFileName']
        currentFileName = structure[ext]['filename']

        add_to_log(f"Data split: ext: {ext}, newFileName: {newFileName}, currentFileName: {currentFileName}")

        # Name can't be empty
        if newFileName == "":
            send_message("!! Name cannot be empty")
            add_to_log("!! Name cannot be empty")
            return jsonify({'error': 'Name cannot be empty'}), 400
        
        add_to_log("Name isn't empty, renaming file")

        structure[ext]['filename'] = newFileName

        #structure = rename_file(structure, old_name, new_name)
        #send_progress(100, "File renamed")
        # return jsonify(structure), 200
        add_to_log(f"** File .{ext} renamed from ({currentFileName}) to ({newFileName})")
        return jsonify({"message": "File renamed"}), 200
    except Exception as e:
        send_message(f"!! Internal server error: {str(e)}")
        add_to_log(f"!! Internal server error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# TODO @app.route -- load file based on tab selected and current filename, send data to frontend
# Note for frontend - don't reload if filename didn't change, unless user presses "reload" button

def copyFile(sourceDir, targetDir, filename):
    """
    Copies a file from the source directory to the target directory.

    Parameters:
    sourceDir (str): The relative path to the source directory.
    targetDir (str): The relative path to the target directory.
    filename (str): The name of the file to copy.
    """
    # Construct the full relative path to the source file
    source_path = os.path.join(sourceDir, filename)
    
    # Construct the full relative path to the destination directory
    destination_path = os.path.join(targetDir, filename)
    
    # Ensure the destination directory exists
    os.makedirs(targetDir, exist_ok=True)
    
    try:
        # Copy the file from source to destination
        shutil.copy(source_path, destination_path)
        print(f"Copied {source_path} to {destination_path}")
        add_to_log(f"Copied {source_path} to {destination_path}")
    except FileNotFoundError:
        print(f"Error: {source_path} not found.")
        add_to_log(f"Error: {source_path} not found.")
    except Exception as e:
        print(f"An error occurred: {e}")
        add_to_log(f"An error occurred: {e}")

# app.py
@app.route('/export')
def export_files():
    global structure
    try:
        add_to_log("************ Exporting Project ************")

        scenario_name = structure['scenario']['filename']

        # TODO Mark files as required, if nondefault name
        # TODO separate files, which don't have default name, rather they have a list of default files (e.g. gc2020, 1936...)
        # for key, value in user_inputs.items():
        #     if value and 'default' not in value.lower():
        #         if key in ['cvp', 'mapx', 'oof', 'regionincl', 'oob', 'wmdata', 'unit', 'pplx', 'ttrx', 'terx', 'newsitems', 'prf']:
        #             structure[f"{scenario_name}\maps\{value}".lower()] = {'required': True, 'exists': False}

        # Set base project name to proceed. Use this var: projectBaseDir
        # if isNewProject: # FIXME DEBUG: TURNED OFF UNTIL NEEDED
        # projectBaseDir = f"\\{scenario_name}\\"
        projectBaseDir = extractedProjectBasePath
        add_to_log(f"projectBaseDir = {projectBaseDir}")
        
        #
        # TODO Copy / create missing file in EXPORTED
        #

        for ext in structure:
            filename = structure[ext]['filename']
            if filename == "":
                add_to_log(f"Filename is empty for {ext}")
                add_to_log(f"structure[ext] = {structure[ext]}")
                add_to_log(f"structure[ext]['filename'] = {structure[ext]['filename']}")
            isRequired, doesExist, isModified = structure[ext]['isRequired'], structure[ext]['doesExist'], structure[ext]['isModified']
            
            # Ensure there is no leading backslash in the directory
            dir_path = structure[ext]['dir'].lstrip(os.sep)

            # filedir e.g. exported/scenarioA/scenarioA.scenario
            if ext == 'scenario':
                extractedFileDir = os.path.join(EXTRACT_FOLDER, projectBaseDir, dir_path)
                exportedFileDir = os.path.join(EXPORT_FOLDER, projectBaseDir, dir_path)
            else:
                extractedFileDir = os.path.join(EXTRACT_FOLDER, projectBaseDir, structure['scenario']['filename'], dir_path)
                exportedFileDir = os.path.join(EXPORT_FOLDER, projectBaseDir, structure['scenario']['filename'], dir_path)

            add_to_log(f"Checking file: {filename}.{ext}")
            add_to_log(f"extractedFileDir: {extractedFileDir}")
            add_to_log(f"exportedFileDir: {exportedFileDir}")

            # If !isRequired -- skip it
            if not isRequired:
                add_to_log(f"Skipping file (not required): {filename}.{ext}")
                continue

            # If doesExist and !isModified -- copy from previous exported
            if doesExist and not isModified:
                # Copy from extracted to exported
                copyFile(extractedFileDir, exportedFileDir, filename + '.' + ext)
                add_to_log(f"** Copied {filename + '.' + ext} from extracted ({extractedFileDir}) to exported ({exportedFileDir})")

            # If (doesExist and isModified) or !doesExist  -- create new file
            if (doesExist and isModified) or not doesExist:
                # TODO Create non-placeholder new file
                
                fullPath = exportedFileDir + filename + '.' + ext
                os.makedirs(os.path.dirname(fullPath), exist_ok=True) # Create dir if it doesn't exist
                with open(fullPath, 'w') as f:
                    f.write(f"Placeholder for {fullPath}")

                add_to_log(f"** Created placeholder for missing file: {fullPath}")

        # TODO for modified files, figure out how to get info from frontend (maybe live update?)
        # and then write a function for creating file content with this data

        # Proceed with creating ZIP file and exporting
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            # Walk through the exported folder to gather all files for zipping
            folderPathToBeZIPped = os.path.join(EXPORT_FOLDER, projectBaseDir)
            add_to_log(f"** Zipping files in {folderPathToBeZIPped}")
            for root, _, files in os.walk(folderPathToBeZIPped):
                for file in files:
                    filePath = os.path.join(root, file)
                    # Generate arcname by making the file path relative to EXPORT_FOLDER and normalizing it
                    arcname = os.path.relpath(filePath, EXPORT_FOLDER).replace("\\", "/")
                    
                    # Extract the file extension
                    _, file_extension = os.path.splitext(arcname)

                    # Optionally, remove the leading dot
                    file_extension = file_extension.lstrip('.')

                    # Check if the file should be included in the ZIP
                    if (structure[file_extension] and structure[file_extension]['isRequired']) or isNewProject:
                        # Include the file in the ZIP archive
                        zip_file.write(filePath, arcname=arcname)
                        add_to_log(f"** Added file to ZIP: {filePath} as {arcname}")
                    else:
                        add_to_log(f"** Skipped file: {filePath}")
            add_to_log(f"** ZIP file created")

        zip_buffer.seek(0)
        send_progress(100, "Export complete")
        add_to_log("************ Export complete ************")
        return send_file(zip_buffer, mimetype='application/zip', as_attachment=True, download_name=f"{scenario_name}.zip")

    except Exception as e:
        send_message(f"!! Internal server error during export: {str(e)}")
        add_to_log(f"!! Internal server error during export: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    add_to_log("===============================[ Starting server ]===============================")
    add_to_log("************ SETUP ************")
    add_to_log(f"Logging level: {LOGGING_LEVEL}", 'info')
    add_to_log(f"DEFAULT_STRUCTURE: {DEFAULT_PROJECT_FILE_STRUCTURE}", 'debug')
    add_to_log(f"UPLOAD_FOLDER: {UPLOAD_FOLDER}", 'debug')
    add_to_log(f"EXTRACT_FOLDER: {EXTRACT_FOLDER}", 'debug')
    add_to_log(f"EXPORT_FOLDER: {EXPORT_FOLDER}", 'debug')
    
    socketio.init_app(app)
    socketio.run(app, debug=True)
