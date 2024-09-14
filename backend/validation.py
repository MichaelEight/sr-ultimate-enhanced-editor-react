# validation.py
from pathlib import Path
from message import send_message, add_to_log
from config import DEFAULT_PROJECT_FILE_STRUCTURE

def check_file_existence(base_dir: Path, scenario_name: str, scenario_data: dict, extracted_base_path: Path):
    add_to_log("************ Checking file existence ************")

    add_to_log(f"** Checking file existence for scenario: {scenario_name}")
    add_to_log(f'Base directory: {base_dir}')
    add_to_log(f'Scenario data: {scenario_data}')
    add_to_log(f'Extracted base path: {extracted_base_path}')

    # Initialize projectFileStructure
    project_file_structure = DEFAULT_PROJECT_FILE_STRUCTURE.copy()

    # Extract filenames and mark isRequired for each
    for label, file_list in scenario_data.items():
        # Get the filename without extension
        filename = Path(file_list[0]).stem

        if label in project_file_structure:
            project_file_structure[label]['filename'] = filename

            # Mark as required if filename is not 'default' or 'DEFAULT'
            if filename.lower() != 'default':
                project_file_structure[label]['isRequired'] = True

    for ext, file_info in project_file_structure.items():
        filename = file_info['filename']
        directory = file_info.get('dir', '')
        dir_path = Path(directory)

        # Construct the full path to the file
        full_extracted_file_path = base_dir / dir_path / f"{filename}.{ext}"

        # Check if the file exists
        does_exist = full_extracted_file_path.exists()
        project_file_structure[ext]['doesExist'] = does_exist
        add_to_log(f"{ext} doesExist: {does_exist} in {full_extracted_file_path}")

    add_to_log(f"** Finished checking file existence for scenario: {scenario_name}")
    add_to_log(f"** Project file structure: {project_file_structure}")
    add_to_log("************ Checking file existence DONE ************")
    return project_file_structure
