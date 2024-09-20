from pathlib import Path
from ..utils.logging_utils import add_to_log, LogLevel
from ..config import Config

def check_file_existence(base_dir: Path, scenario_name: str, scenario_data: dict, extracted_base_path: Path):
    add_to_log(f"=== Starting: Checking file existence for scenario: {scenario_name} ===", LogLevel.INFO)
    project_file_structure = Config.DEFAULT_PROJECT_FILE_STRUCTURE.copy()
    for label, file_list in scenario_data.items():
        filename = Path(file_list[0]).stem
        if label in project_file_structure:
            project_file_structure[label]['filename'] = filename
            if filename.lower() != 'default':
                project_file_structure[label]['isRequired'] = True
    for ext, file_info in project_file_structure.items():
        filename = file_info['filename']
        directory = file_info.get('dir', '')
        dir_path = Path(directory)
        full_extracted_file_path = base_dir / dir_path / f"{filename}.{ext}"
        does_exist = full_extracted_file_path.exists()
        add_to_log(f"{ext} exists: {does_exist} at '{full_extracted_file_path}'", LogLevel.DEBUG)
        project_file_structure[ext]['doesExist'] = does_exist
    add_to_log(f"Finished checking file existence for scenario: {scenario_name}", LogLevel.INFO)
    add_to_log(f"File structure: {project_file_structure}", LogLevel.DEBUG)
    add_to_log(f"=== Finished: Checking file existence ===", LogLevel.INFO)
    return project_file_structure
