Splitting a monolithic `routes.py` file into smaller, well-organized modules can significantly enhance the maintainability, scalability, and readability of your Flask application. Here's a comprehensive guide on how to restructure your project, including suggestions for folder/file organization, which functions to move where, and example implementations.

---

## **1. Benefits of Splitting `routes.py`**

- **Maintainability:** Easier to navigate and manage smaller files.
- **Scalability:** Simplifies adding new features without cluttering existing code.
- **Collaboration:** Facilitates multiple developers working simultaneously without merge conflicts.
- **Readability:** Enhances code clarity by grouping related functionalities.

---

## **2. Proposed Folder Structure**

Organizing your Flask application using Blueprints and a modular structure will help achieve the aforementioned benefits. Below is a suggested folder structure:

```
your_project/
├── app/
│   ├── __init__.py
│   ├── models.py
│   ├── config.py
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── logging_utils.py
│   │   └── file_utils.py
│   ├── services/
│   │   ├── __init__.py
│   │   └── project_services.py
│   ├── validation/
│   │   ├── __init__.py
│   │   └── validators.py
│   ├── importers/
│   │   ├── __init__.py
│   │   └── scenario_importer.py
│   ├── exporters/
│   │   ├── __init__.py
│   │   └── scenario_exporter.py
│   └── routes/
│       ├── __init__.py
│       ├── upload.py
│       ├── settings.py
│       ├── regions.py
│       ├── theaters.py
│       ├── resources.py
│       ├── worldmarket.py
│       ├── orbat.py
│       └── export.py
├── uploads/
├── extracts/
├── exports/
├── tests/
│   └── ... (your test files)
├── requirements.txt
└── run.py
```

### **Explanation of Folders and Files**

- **`app/`**: Main application package.
  
  - **`__init__.py`**: Initializes the Flask app, registers Blueprints, and sets up configurations.
  
  - **`models.py`**: Contains your `Project` class and other data models.
  
  - **`config.py`**: Configuration settings for the application.
  
  - **`utils/`**: Utility modules for logging, file operations, etc.
  
  - **`services/`**: Business logic and service functions.
  
  - **`validation/`**: Validation functions and classes.
  
  - **`importers/` & `exporters/`**: Modules for importing and exporting different file types.
  
  - **`routes/`**: Contains separate modules for different route categories, each defined as a Blueprint.

- **`uploads/`**, **`extracts/`**, **`exports/`**: Directories for handling uploaded files, extracted content, and exported files respectively.

- **`tests/`**: Contains unit and integration tests.

- **`run.py`**: Entry point to run the Flask application.

---

## **3. Implementing the New Structure**

### **a. Initializing the Flask App and Registering Blueprints**

**`app/__init__.py`**

```python
from flask import Flask
from .routes.upload import upload_bp
from .routes.settings import settings_bp
from .routes.regions import regions_bp
from .routes.theaters import theaters_bp
from .routes.resources import resources_bp
from .routes.worldmarket import worldmarket_bp
from .routes.orbat import orbat_bp
from .routes.export import export_bp

def create_app():
    app = Flask(__name__)
    
    # Load configurations
    app.config.from_object('app.config.Config')
    
    # Register Blueprints
    app.register_blueprint(upload_bp, url_prefix='/upload')
    app.register_blueprint(settings_bp, url_prefix='/settings')
    app.register_blueprint(regions_bp, url_prefix='/regions')
    app.register_blueprint(theaters_bp, url_prefix='/theaters')
    app.register_blueprint(resources_bp, url_prefix='/resources')
    app.register_blueprint(worldmarket_bp, url_prefix='/worldmarket')
    app.register_blueprint(orbat_bp, url_prefix='/orbat')
    app.register_blueprint(export_bp, url_prefix='/export')
    
    return app
```

**`run.py`**

```python
from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)
```

### **b. Creating Blueprints for Different Route Categories**

Each route category will have its own Blueprint. Here's how to split some of the routes.

#### **i. Upload Routes**

**`app/routes/upload.py`**

```python
from flask import Blueprint, request, jsonify
from pathlib import Path
import shutil
from ..models import project
from ..utils.logging_utils import add_to_log, LogLevel, send_progress
from ..config import Config
from ..services.project_services import process_file_for_export
from ..validation.validators import check_file_existence
from ..utils.file_utils import create_zip_archive_with_scenario, extract_archive
from ..importers.scenario_importer import import_scenario_file

upload_bp = Blueprint('upload', __name__)

# Initialize base directories using pathlib
UPLOADS_PATH = Path(Config.UPLOAD_FOLDER)
EXTRACTS_PATH = Path(Config.EXTRACT_FOLDER)
EXPORTS_PATH = Path(Config.EXPORT_FOLDER)

@upload_bp.route('/', methods=['POST'])
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

            # Adjust base_dir to the parent directory containing the scenario file
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
```

#### **ii. Settings Routes**

**`app/routes/settings.py`**

```python
from flask import Blueprint, request, jsonify
from ..models import project
from ..utils.logging_utils import add_to_log, LogLevel

settings_bp = Blueprint('settings', __name__)

@settings_bp.route('/update', methods=['POST'])
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
```

#### **iii. Regions Routes**

**`app/routes/regions.py`**

```python
from flask import Blueprint, request, jsonify
from ..models import project
from ..utils.logging_utils import add_to_log, LogLevel

regions_bp = Blueprint('regions', __name__)

@regions_bp.route('/', methods=['GET'])
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

@regions_bp.route('/update', methods=['POST'])
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
```

### **c. Repeat for Other Route Categories**

Similarly, create separate modules for theaters, resources, world market, orbat, and export functionalities. Here's an example for the **Export Routes**.

**`app/routes/export.py`**

```python
from flask import Blueprint, send_file, jsonify
from pathlib import Path
import shutil
from ..models import project
from ..utils.logging_utils import add_to_log, LogLevel
from ..config import Config
from ..services.project_services import process_file_for_export
from ..utils.file_utils import create_zip_archive_with_scenario

export_bp = Blueprint('export', __name__)

EXPORTS_PATH = Path(Config.EXPORT_FOLDER)

@export_bp.route('/', methods=['GET'])
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
```

---

## **4. Sample Code Snippets for Other Modules**

### **i. Theaters Routes**

**`app/routes/theaters.py`**

```python
from flask import Blueprint, request, jsonify
from ..models import project
from ..utils.logging_utils import add_to_log, LogLevel
from ..services.project_services import extract_cvp_data
from ..utils.file_utils import extract_cvp

theaters_bp = Blueprint('theaters', __name__)

@theaters_bp.route('/', methods=['GET'])
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

@theaters_bp.route('/update', methods=['POST'])
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
```

### **ii. Resources Routes**

**`app/routes/resources.py`**

```python
from flask import Blueprint, request