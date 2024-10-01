# validators.py

import os
from pathlib import Path
from ..utils.logging_utils import add_to_log, LogLevel
from ..config import Config

def check_file_existence(base_dir, scenario_name, scenario_data, extracted_base_path):
    add_to_log(f"=== Starting: Checking file existence for scenario: {scenario_name} ===", LogLevel.INFO)
    project_structure = {}

    for ext, files in scenario_data.items():
        # Initialize default structure for this extension
        default_info = Config.DEFAULT_PROJECT_FILE_STRUCTURE.get(ext, {})
        dir_path = default_info.get('dir', '')

        project_structure[ext] = {
            'isRequired': True,
            'doesExist': False,
            'isModified': False,
            'dir': dir_path,  # Set 'dir' to dir_path
            'filename': ''
        }

        if files:
            for file in files:
                file_dir = base_dir / dir_path
                file_path = file_dir / f"{file}.{ext.upper()}"
                if file_path.exists():
                    project_structure[ext]['doesExist'] = True
                    project_structure[ext]['filename'] = file  # Filename without extension
                    # Determine the directory relative to the base directory
                    relative_dir = file_dir.relative_to(base_dir)
                    project_structure[ext]['dir'] = str(relative_dir).replace('\\', '\\\\')
                    break  # Stop after finding the first existing file
                else:
                    add_to_log(f"File not found: {file_path}", LogLevel.WARNING)
            else:
                # No files exist for this extension
                project_structure[ext]['doesExist'] = False
                project_structure[ext]['filename'] = files[0] if files else ''
        else:
            # No files listed for this extension
            project_structure[ext]['isRequired'] = False
            project_structure[ext]['doesExist'] = False
            project_structure[ext]['filename'] = ''

    add_to_log(f"Project structure after existence check: {project_structure}", LogLevel.DEBUG)
    return project_structure
