# scenario_importer.py

import os
import re
import json
from pathlib import Path
from ..config import Config
from ..utils.logging_utils import add_to_log, LogLevel

def import_scenario_file(file_path):
    scenario_file_name = Path(file_path).name

    add_to_log(f"Parsing scenario file: {file_path}", LogLevel.INFO)
    with open(file_path, 'r') as file:
        content = file.read()

    # Initialize scenario_data with expected keys
    scenario_data = {ext: [] for ext in Config.DEFAULT_PROJECT_FILE_STRUCTURE.keys()}
    scenario_data["scenario"] = [Path(scenario_file_name).stem]

    # Initialize settings_data with default structure
    settings_data = Config.DEFAULT_SETTINGS_STRUCTURE.copy()

    include_pattern = re.compile(r'#include\s+"([^"]+)",\s*"([^"]+)"')
    savfile_pattern = re.compile(r'savfile\s+"([^"]+)"')
    mapfile_pattern = re.compile(r'mapfile\s+"([^"]+)"')
    gmc_pattern = re.compile(r'&&GMC(.*?)&&END', re.DOTALL)
    key_value_pattern = re.compile(r'(\w+):\s*(.*)')

    # Process includes
    for match in include_pattern.finditer(content):
        filename = match.group(1)
        extension = os.path.splitext(filename)[1].lstrip('.').lower()
        if extension in scenario_data:
            scenario_data[extension].append(Path(filename).stem)

    # Process savfile
    savfile_match = savfile_pattern.search(content)
    if savfile_match:
        scenario_data['sav'].append(savfile_match.group(1))

    # Process mapfile
    mapfile_match = mapfile_pattern.search(content)
    if mapfile_match:
        scenario_data['mapx'].append(mapfile_match.group(1))

    # Process GMC section
    gmc_match = gmc_pattern.search(content)
    if gmc_match:
        gmc_content = gmc_match.group(1)
        lines = gmc_content.strip().split('\n')
        for line in lines:
            line = line.strip()
            if not line or line.startswith('//'):
                continue
            key_value_match = key_value_pattern.match(line)
            if key_value_match:
                key = key_value_match.group(1).lower()
                value = key_value_match.group(2).strip()
                if key in settings_data:
                    if key in ["startymd", "difficulty", "victoryhex"]:
                        settings_data[key] = [int(v.strip()) if v.strip().isdigit() else None for v in value.split(",")]
                    elif key == "fastfwddays":
                        settings_data[key] = float(value) if value else None
                    elif isinstance(settings_data[key], int):
                        settings_data[key] = int(value) if value.isdigit() else 0
                    else:
                        settings_data[key] = value
                else:
                    add_to_log(f"Unknown key in GMC: {key}", LogLevel.WARNING)

    add_to_log(f"Parsed scenario data: {json.dumps(scenario_data, indent=4)}", LogLevel.DEBUG)
    add_to_log(f"Parsed settings data: {json.dumps(settings_data, indent=4)}", LogLevel.DEBUG)
    
    return {
        "scenario_data": scenario_data,
        "settings_data": settings_data
    }
