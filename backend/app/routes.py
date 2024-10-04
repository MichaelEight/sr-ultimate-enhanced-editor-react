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

from .utils.file_utils import create_zip_archive, extract_archive, create_zip_archive_with_scenario

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

            # Adjust base_dir to include the scenario_name directory
            base_dir = scenario_file_path.parent / scenario_name  # Add this line
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
        add_to_log("Checking file existence based on .scenario file", LogLevel.TRACE)
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
                dir_path = base_dir / directory  # Include the directory
                file_full_path = dir_path / f"{filename}.{ext.upper()}"

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

        project.root_directory = project.modified_structure['scenario']['filename']
        add_to_log(f"Project root directory set to {project.root_directory}", LogLevel.DEBUG)

        export_base_dir = EXPORTS_PATH / project.root_directory

        if export_base_dir.exists():
            add_to_log(f"Export directory {export_base_dir} already exists. Deleting it.", LogLevel.DEBUG)
            shutil.rmtree(export_base_dir)

        # Ensure the export directory exists
        export_base_dir.mkdir(parents=True, exist_ok=True)

        # Export scenario file at the root level
        scenario_filename = f"{project.modified_structure['scenario']['filename']}.SCENARIO"
        scenario_output_path = EXPORTS_PATH / scenario_filename
        project.export_scenario_file(str(scenario_output_path))
        add_to_log(f"Exported scenario file to {scenario_output_path}", LogLevel.INFO)

        # Export CVP file if present
        if 'cvp' in project.modified_structure and project.modified_structure['cvp']['filename']:
            cvp_dir = project.modified_structure['cvp'].get('dir', '')
            cvp_filename = f"{project.modified_structure['cvp']['filename']}.CVP"
            cvp_output_path = export_base_dir / cvp_dir / cvp_filename
            cvp_output_path.parent.mkdir(parents=True, exist_ok=True)
            project.export_cvp_file(str(cvp_output_path))
            add_to_log(f"Exported CVP file to {cvp_output_path}", LogLevel.INFO)

        # Export OOB file if present
        if 'oob' in project.modified_structure and project.modified_structure['oob']['filename']:
            oob_dir = project.modified_structure['oob'].get('dir', '')
            oob_filename = f"{project.modified_structure['oob']['filename']}.OOB"
            oob_output_path = export_base_dir / oob_dir / oob_filename
            oob_output_path.parent.mkdir(parents=True, exist_ok=True)
            project.export_orbat_file(str(oob_output_path))
            add_to_log(f"Exported OOB file to {oob_output_path}", LogLevel.INFO)

        # Export REGIONINCL file if present
        if 'regionincl' in project.modified_structure and project.modified_structure['regionincl']['filename']:
            regionincl_dir = project.modified_structure['regionincl'].get('dir', '')
            regionincl_filename = f"{project.modified_structure['regionincl']['filename']}.REGIONINCL"
            regionincl_output_path = export_base_dir / regionincl_dir / regionincl_filename
            regionincl_output_path.parent.mkdir(parents=True, exist_ok=True)
            project.export_regionincl_file(str(regionincl_output_path))
            add_to_log(f"Exported REGIONINCL file to {regionincl_output_path}", LogLevel.INFO)

        # Export WMData file if present
        if 'wmdata' in project.modified_structure and project.modified_structure['wmdata']['filename']:
            wmdata_dir = project.modified_structure['wmdata'].get('dir', '')
            wmdata_filename = f"{project.modified_structure['wmdata']['filename']}.WMDATA"
            wmdata_output_path = export_base_dir / wmdata_dir / wmdata_filename
            wmdata_output_path.parent.mkdir(parents=True, exist_ok=True)
            project.export_wmdata_file(str(wmdata_output_path))
            add_to_log(f"Exported WMData file to {wmdata_output_path}", LogLevel.INFO)

        # Process other files for export as needed, excluding 'wmdata'
        for ext, file_info in project.modified_structure.items():
            if ext in ['scenario', 'cvp', 'wmdata']:
                continue  # Already handled
            process_file_for_export(ext, file_info, export_base_dir)
            add_to_log(f"Processed file type: .{ext}", LogLevel.DEBUG)

        # Create a zip archive including the scenario file and project directory
        zip_buffer = create_zip_archive_with_scenario(export_base_dir, scenario_output_path)
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

@main_blueprint.route('/regions', methods=['GET'])
def get_regions():
    try:
        add_to_log("Fetching regions data", LogLevel.INFO)
        # Combine regions data from CVP and REGIONINCL
        regions_data = []
        cvp_regions = project.regions_data  # List of regions from CVP
        regionincl_regions = project.regionincl_data.get('regions', [])  # List of regions from REGIONINCL

        # Create a mapping of region IDs to isActive status from REGIONINCL
        regionincl_map = {region['regionId']: region['isActive'] for region in regionincl_regions}

        for region in cvp_regions:
            region_id = region['ID']
            is_active = regionincl_map.get(region_id, False)  # Default to False if not in REGIONINCL
            region_properties = region['Properties']
            # Combine region data with isActive status
            region_data = {
                'ID': region_id,
                'isActive': is_active,
                'Properties': region_properties
            }
            regions_data.append(region_data)

        return jsonify({'regions': regions_data}), 200
    except Exception as e:
        add_to_log(f"Error fetching regions data: {e}", LogLevel.ERROR)
        return jsonify({'error': str(e)}), 500

@main_blueprint.route('/regions/update', methods=['POST'])
def update_region():
    try:
        data = request.get_json()
        add_to_log(f"Received region update: {data}", LogLevel.INFO)
        region_id = data.get('ID')
        is_active = data.get('isActive')
        properties = data.get('Properties')

        if region_id is None:
            add_to_log("Region ID is missing in the update request", LogLevel.ERROR)
            return jsonify({'error': 'Region ID is required'}), 400

        # Update CVP data
        for region in project.regions_data:
            if region['ID'] == region_id:
                region['Properties'] = properties
                break
        else:
            add_to_log(f"Region ID {region_id} not found in CVP data", LogLevel.ERROR)
            return jsonify({'error': f'Region ID {region_id} not found'}), 404

        # Update REGIONINCL data
        # First, check if the region exists in regionincl_data
        regionincl_regions = project.regionincl_data.get('regions', [])
        for region in regionincl_regions:
            if region['regionId'] == region_id:
                region['isActive'] = is_active
                break
        else:
            # If region not found in REGIONINCL, add it
            project.regionincl_data.setdefault('regions', []).append({
                'regionId': region_id,
                'comment': None,  # Or set a default comment if needed
                'isActive': is_active
            })

        # Mark data as changed
        project.seen_since_last_update['regions'] = False
        project.seen_since_last_update['regionincl'] = False

        add_to_log(f"Region {region_id} updated successfully", LogLevel.INFO)
        return jsonify({'message': 'Region updated successfully'}), 200
    except Exception as e:
        add_to_log(f"Error updating region: {e}", LogLevel.ERROR)
        return jsonify({'error': str(e)}), 500

@main_blueprint.route('/theaters', methods=['GET'])
def get_theaters():
    try:
        add_to_log("Fetching theaters data", LogLevel.INFO)
        theaters_data = project.theaters_data  # Should be a dict with theater IDs as keys
        theaters_list = []
        for theater_id, theater in theaters_data.items():
            theater_data = {
                'id': theater_id,
                'theatreName': theater.get('theatreName', ''),
                'theatreCode': theater.get('theatreCode', ''),
                'culture': theater.get('culture', 0),
                'xLocation': theater.get('xLocation', 0),
                'yLocation': theater.get('yLocation', 0),
                'transfers': theater.get('transfers', [])
            }
            theaters_list.append(theater_data)
        return jsonify({'theaters': theaters_list}), 200
    except Exception as e:
        add_to_log(f"Error fetching theaters data: {e}", LogLevel.ERROR)
        return jsonify({'error': str(e)}), 500

@main_blueprint.route('/theaters/update', methods=['POST'])
def update_theater():
    try:
        data = request.get_json()
        add_to_log(f"Received theater update: {data}", LogLevel.INFO)
        theater_id = data.get('id')
        if theater_id is None:
            add_to_log("Theater ID is missing in the update request", LogLevel.ERROR)
            return jsonify({'error': 'Theater ID is required'}), 400

        theater_id = int(theater_id)  # Ensure theater_id is an int

        # Update the theater data in project.theaters_data
        theater = project.theaters_data.get(theater_id)
        if not theater:
            # If the theater doesn't exist, create a new one
            project.theaters_data[theater_id] = {}
            theater = project.theaters_data[theater_id]

        theater['theatreName'] = data.get('theatreName', theater.get('theatreName', ''))
        theater['theatreCode'] = data.get('theatreCode', theater.get('theatreCode', ''))
        theater['culture'] = int(data.get('culture', theater.get('culture', 0)))
        theater['xLocation'] = int(data.get('xLocation', theater.get('xLocation', 0)))
        theater['yLocation'] = int(data.get('yLocation', theater.get('yLocation', 0)))
        transfers = data.get('transfers', theater.get('transfers', []))
        # Ensure transfers are integers
        theater['transfers'] = [int(t) for t in transfers if t.isdigit()]

        # Mark data as changed
        project.seen_since_last_update['theaters'] = False

        add_to_log(f"Theater {theater_id} updated successfully", LogLevel.INFO)
        return jsonify({'message': 'Theater updated successfully'}), 200
    except Exception as e:
        add_to_log(f"Error updating theater: {e}", LogLevel.ERROR)
        return jsonify({'error': str(e)}), 500

@main_blueprint.route('/theaters/generate', methods=['POST'])
def generate_theaters():
    try:
        add_to_log("Generating theaters data", LogLevel.INFO)
        # TODO Logic to generate theaters data
        # For demonstration, create dummy data or implement your generation logic
        project.theaters_data = {
            1: {
                'theatreName': 'Theatre Alpha',
                'theatreCode': 'A001',
                'culture': 0,
                'xLocation': 100,
                'yLocation': 200,
                'transfers': [2]
            },
            2: {
                'theatreName': 'Theatre Beta',
                'theatreCode': 'B002',
                'culture': 1,
                'xLocation': 300,
                'yLocation': 400,
                'transfers': [1]
            }
        }
        project.seen_since_last_update['theaters'] = False
        add_to_log("Theaters data generated successfully", LogLevel.INFO)
        return jsonify({'message': 'Theaters generated successfully'}), 200
    except Exception as e:
        add_to_log(f"Error generating theaters: {e}", LogLevel.ERROR)
        return jsonify({'error': str(e)}), 500

# TODO Import theatres from custom CVP
@main_blueprint.route('/theaters/import_from_cvp', methods=['POST'])
def import_theaters_from_cvp():
    try:
        add_to_log("Importing theaters data from CVP", LogLevel.INFO)
        # Logic to import theaters data from CVP file
        cvp_file_info = project.modified_structure.get('cvp')
        if not cvp_file_info or not cvp_file_info.get('filename'):
            return jsonify({'error': 'CVP file not found in project'}), 400

        cvp_filename = cvp_file_info['filename']
        cvp_dir = cvp_file_info.get('dir', '')
        base_dir = Path(project.extracted_base_path)
        cvp_path = base_dir / cvp_dir / f"{cvp_filename}.CVP"

        if not cvp_path.exists():
            add_to_log(f"CVP file does not exist at path: {cvp_path}", LogLevel.ERROR)
            return jsonify({'error': 'CVP file does not exist at expected path'}), 400

        cvp_data = extract_cvp_data(str(cvp_path))
        project.theaters_data = cvp_data['Theaters_Data']
        project.seen_since_last_update['theaters'] = False
        add_to_log("Theaters data imported from CVP successfully", LogLevel.INFO)
        return jsonify({'message': 'Theaters imported from CVP successfully'}), 200
    except Exception as e:
        add_to_log(f"Error importing theaters from CVP: {e}", LogLevel.ERROR)
        return jsonify({'error': str(e)}), 500
    
@main_blueprint.route('/resources', methods=['GET'])
def get_resources():
    try:
        add_to_log("Fetching resources data", LogLevel.INFO)
        resources_data = project.resources_data

        # Ensure resources data includes all fields with default values
        ID_TO_RESOURCE = {
            0: "agriculture",
            1: "rubber",
            2: "timber",
            3: "petroleum",
            4: "coal",
            5: "ore",
            6: "uranium",
            7: "electricity",
            8: "consumergoods",
            9: "militarygoods",
            10: "industrialgoods"
        }

        for resource_name, resource_info in resources_data.items():
            resource_info.setdefault('cost', {
                "wmbasecost": 0,
                "wmfullcost": 0,
                "wmmargin": 0
            })
            resource_info.setdefault('production', {
                "nodeproduction": 0,
                "wmprodperpersonmax": 0,
                "wmprodperpersonmin": 0,
                "wmurbanproduction": 0
            })
            resource_info.setdefault('producefrom', {res: 0 for res in ID_TO_RESOURCE.values()})

        add_to_log(f"Resources data: {json.dumps(resources_data, indent=2)}", LogLevel.DEBUG)
        return jsonify({'resources': resources_data}), 200
    except Exception as e:
        add_to_log(f"Error fetching resources data: {e}", LogLevel.ERROR)
        return jsonify({'error': str(e)}), 500

@main_blueprint.route('/resources/update', methods=['POST'])
def update_resource():
    try:
        data = request.get_json()
        add_to_log(f"Received resource update: {data}", LogLevel.INFO)
        resource_name = data.get('resourceName')
        field_group = data.get('fieldGroup')  # e.g., 'cost', 'production', 'producefrom'
        name = data.get('name')  # Field name within the group
        value = data.get('value')

        if not resource_name or not field_group or name is None:
            add_to_log("Invalid data in resource update request", LogLevel.ERROR)
            return jsonify({'error': 'Invalid data'}), 400

        # Validate field_group
        if field_group not in ['cost', 'production', 'producefrom']:
            add_to_log(f"Invalid field group: {field_group}", LogLevel.ERROR)
            return jsonify({'error': 'Invalid field group'}), 400

        # Validate resource_name
        ID_TO_RESOURCE = {
            0: "agriculture",
            1: "rubber",
            2: "timber",
            3: "petroleum",
            4: "coal",
            5: "ore",
            6: "uranium",
            7: "electricity",
            8: "consumergoods",
            9: "militarygoods",
            10: "industrialgoods"
        }

        if resource_name not in ID_TO_RESOURCE.values():
            add_to_log(f"Invalid resource name: {resource_name}", LogLevel.ERROR)
            return jsonify({'error': 'Invalid resource name'}), 400

        # Validate field name based on field group
        valid_fields = {
            'cost': ["wmbasecost", "wmfullcost", "wmmargin"],
            'production': ["nodeproduction", "wmprodperpersonmax", "wmprodperpersonmin", "wmurbanproduction"],
            'producefrom': list(ID_TO_RESOURCE.values())
        }

        if name not in valid_fields[field_group]:
            add_to_log(f"Invalid field name '{name}' for field group '{field_group}'", LogLevel.ERROR)
            return jsonify({'error': 'Invalid field name for the specified field group'}), 400

        # Convert value to int if it's a number
        if isinstance(value, str):
            if value.isdigit():
                value = int(value)
            else:
                try:
                    value = float(value)
                except ValueError:
                    add_to_log(f"Invalid value type for field '{name}': {value}", LogLevel.ERROR)
                    return jsonify({'error': 'Invalid value type'}), 400

        # Update resource data
        resource = project.resources_data.setdefault(resource_name, {})
        group = resource.setdefault(field_group, {})
        group[name] = value

        # Ensure no null values
        if field_group == 'producefrom':
            for res in ID_TO_RESOURCE.values():
                group.setdefault(res, 0)
        elif field_group == 'cost':
            for field in ["wmbasecost", "wmfullcost", "wmmargin"]:
                group.setdefault(field, 0)
        elif field_group == 'production':
            for field in ["nodeproduction", "wmprodperpersonmax", "wmprodperpersonmin", "wmurbanproduction"]:
                group.setdefault(field, 0)

        # Mark data as changed
        project.seen_since_last_update['resources'] = False

        add_to_log(f"Resource '{resource_name}' updated successfully: {field_group}.{name} = {value}", LogLevel.INFO)
        return jsonify({'message': 'Resource updated successfully'}), 200
    except Exception as e:
        add_to_log(f"Error updating resource: {e}", LogLevel.ERROR)
        return jsonify({'error': str(e)}), 500

@main_blueprint.route('/worldmarket', methods=['GET'])
def get_worldmarket():
    try:
        add_to_log("Fetching world market data", LogLevel.INFO)
        worldmarket_data = project.worldmarket_data
        add_to_log(f"World Market data: {json.dumps(worldmarket_data, indent=2)}", LogLevel.DEBUG)
        return jsonify({'worldmarket': worldmarket_data}), 200
    except Exception as e:
        add_to_log(f"Error fetching world market data: {e}", LogLevel.ERROR)
        return jsonify({'error': str(e)}), 500

@main_blueprint.route('/worldmarket/update', methods=['POST'])
def update_worldmarket():
    try:
        data = request.get_json()
        add_to_log(f"Received world market update: {data}", LogLevel.INFO)
        field_group = data.get('fieldGroup')  # e.g., 'settings', 'military', 'economic', 'weather'
        name = data.get('name')
        value = data.get('value')

        if not field_group or name is None:
            add_to_log("Invalid data in world market update request", LogLevel.ERROR)
            return jsonify({'error': 'Invalid data'}), 400

        # Convert value to int if necessary
        try:
            value = int(value)
        except ValueError:
            pass  # Keep as string if it cannot be converted to int

        # Update world market data
        group = project.worldmarket_data.setdefault(field_group, {})
        # Handle nested keys if present (e.g., 'battstrdefault.inf')
        if '.' in name:
            keys = name.split('.')
            sub_group = group
            for key in keys[:-1]:
                sub_group = sub_group.setdefault(key, {})
            sub_group[keys[-1]] = value
        elif '[' in name and ']' in name:
            # Handle list indices (e.g., 'garrisonprogression[0]')
            base_name, index = re.match(r'(\w+)\[(\d+)\]', name).groups()
            index = int(index)
            lst = group.setdefault(base_name, [])
            # Ensure the list is long enough
            while len(lst) <= index:
                lst.append(None)
            lst[index] = value
        else:
            group[name] = value

        # Mark data as changed
        project.seen_since_last_update['worldmarket'] = False

        add_to_log("World market data updated successfully", LogLevel.INFO)
        return jsonify({'message': 'World market data updated successfully'}), 200
    except Exception as e:
        add_to_log(f"Error updating world market data: {e}", LogLevel.ERROR)
        return jsonify({'error': str(e)}), 500

# routes.py

# ... existing imports ...
import re

# ... existing code ...

@main_blueprint.route('/orbat', methods=['GET'])
def get_orbat():
    try:
        add_to_log("Fetching Orbat data", LogLevel.INFO)
        orbat_data = project.orbat_data.get('OOB_Data', [])
        return jsonify({'orbat_data': orbat_data}), 200
    except Exception as e:
        add_to_log(f"Error fetching Orbat data: {e}", LogLevel.ERROR)
        return jsonify({'error': str(e)}), 500

@main_blueprint.route('/orbat/update_unit', methods=['POST'])
def update_orbat_unit():
    try:
        data = request.get_json()
        add_to_log(f"Received Orbat unit update: {data}", LogLevel.INFO)
        region_id = data.get('regionId')
        unit = data.get('unit')
        if region_id is None or unit is None:
            add_to_log("Invalid data in Orbat unit update request", LogLevel.ERROR)
            return jsonify({'error': 'Invalid data'}), 400

        region_id = int(region_id)
        unit_id = unit.get('unitId')

        if unit_id is None:
            add_to_log("Unit ID is missing in the unit data", LogLevel.ERROR)
            return jsonify({'error': 'Unit ID is required'}), 400

        # Find the region in the orbat data
        orbat_data = project.orbat_data.get('OOB_Data', [])
        region = next((r for r in orbat_data if r['regionId'] == region_id), None)
        if region is None:
            add_to_log(f"Region ID {region_id} not found in Orbat data", LogLevel.ERROR)
            return jsonify({'error': f'Region ID {region_id} not found'}), 404

        # Find the unit in the region's units
        units = region['units']
        existing_unit = next((u for u in units if u['unitId'] == unit_id), None)
        if existing_unit:
            # Update existing unit
            existing_unit.update(unit)
        else:
            add_to_log(f"Unit ID {unit_id} not found in region {region_id}", LogLevel.ERROR)
            return jsonify({'error': f'Unit ID {unit_id} not found in region {region_id}'}), 404

        # Mark data as changed
        project.seen_since_last_update['orbat'] = False

        add_to_log(f"Unit {unit_id} in region {region_id} updated successfully", LogLevel.INFO)
        return jsonify({'message': 'Unit updated successfully'}), 200
    except Exception as e:
        add_to_log(f"Error updating Orbat unit data: {e}", LogLevel.ERROR)
        return jsonify({'error': str(e)}), 500

@main_blueprint.route('/orbat/add_unit', methods=['POST'])
def add_orbat_unit():
    try:
        data = request.get_json()
        add_to_log(f"Received Orbat add unit request: {data}", LogLevel.INFO)
        region_id = data.get('regionId')
        unit = data.get('unit')
        if region_id is None or unit is None:
            add_to_log("Invalid data in Orbat add unit request", LogLevel.ERROR)
            return jsonify({'error': 'Invalid data'}), 400

        region_id = int(region_id)
        unit_id = unit.get('unitId')

        if unit_id is None:
            add_to_log("Unit ID is missing in the unit data", LogLevel.ERROR)
            return jsonify({'error': 'Unit ID is required'}), 400

        # Find or create the region in the orbat data
        orbat_data = project.orbat_data.get('OOB_Data', [])
        region = next((r for r in orbat_data if r['regionId'] == region_id), None)
        if region is None:
            # If region not found, create it
            region = {'regionId': region_id, 'units': []}
            orbat_data.append(region)

        # Check if the unit already exists
        units = region['units']
        existing_unit = next((u for u in units if u['unitId'] == unit_id), None)
        if existing_unit:
            add_to_log(f"Unit ID {unit_id} already exists in region {region_id}", LogLevel.ERROR)
            return jsonify({'error': f'Unit ID {unit_id} already exists in region {region_id}'}), 400

        # Add new unit
        units.append(unit)

        # Mark data as changed
        project.seen_since_last_update['orbat'] = False

        add_to_log(f"Unit {unit_id} added to region {region_id} successfully", LogLevel.INFO)
        return jsonify({'message': 'Unit added successfully'}), 200
    except Exception as e:
        add_to_log(f"Error adding Orbat unit: {e}", LogLevel.ERROR)
        return jsonify({'error': str(e)}), 500


@main_blueprint.route('/orbat/update', methods=['POST'])
def update_orbat():
    try:
        data = request.get_json()
        add_to_log(f"Received Orbat update: {data}", LogLevel.INFO)
        region_id = data.get('regionId')
        unit = data.get('unit')
        if region_id is None or unit is None:
            add_to_log("Invalid data in Orbat update request", LogLevel.ERROR)
            return jsonify({'error': 'Invalid data'}), 400

        region_id = int(region_id)
        unit_id = unit.get('unitId')

        if unit_id is None:
            add_to_log("Unit ID is missing in the unit data", LogLevel.ERROR)
            return jsonify({'error': 'Unit ID is required'}), 400

        # Find the region in the orbat data
        orbat_data = project.orbat_data.get('OOB_Data', [])
        region = next((r for r in orbat_data if r['regionId'] == region_id), None)
        if region is None:
            # If region not found, create it
            region = {'regionId': region_id, 'units': []}
            orbat_data.append(region)

        # Find the unit in the region's units
        units = region['units']
        existing_unit = next((u for u in units if u['unitId'] == unit_id), None)
        if existing_unit:
            # Update existing unit
            existing_unit.update(unit)
        else:
            # Add new unit
            units.append(unit)

        # Mark data as changed
        project.seen_since_last_update['orbat'] = False

        add_to_log(f"Unit {unit_id} in region {region_id} updated successfully", LogLevel.INFO)
        return jsonify({'message': 'Unit updated successfully'}), 200
    except Exception as e:
        add_to_log(f"Error updating Orbat data: {e}", LogLevel.ERROR)
        return jsonify({'error': str(e)}), 500