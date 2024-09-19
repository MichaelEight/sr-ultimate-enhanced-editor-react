from pathlib import Path
from message import add_to_log, LogLevel
from config import DEFAULT_PROJECT_FILE_STRUCTURE

def check_file_existence(base_dir: Path, scenario_name: str, scenario_data: dict, extracted_base_path: Path):
    add_to_log(f"=== Starting: Checking file existence for scenario: {scenario_name} ===", LogLevel.INFO)

    # Initialize projectFileStructure
    project_file_structure = DEFAULT_PROJECT_FILE_STRUCTURE.copy()

    # Extract filenames and mark as required for each
    for label, file_list in scenario_data.items():
        filename = Path(file_list[0]).stem
        if label in project_file_structure:
            project_file_structure[label]['filename'] = filename

            # Mark as required if filename is not 'default'
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
        add_to_log(f"{ext} exists: {does_exist} at '{full_extracted_file_path}'", LogLevel.DEBUG)

    add_to_log(f"Finished checking file existence for scenario: {scenario_name}", LogLevel.INFO)
    add_to_log(f"File structure: {project_file_structure}", LogLevel.DEBUG)
    add_to_log(f"=== Finished: Checking file existence ===", LogLevel.INFO)

    return project_file_structure
