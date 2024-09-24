import os
import re
import json
from pathlib import Path
from ..utils.logging_utils import add_to_log, LogLevel

def extract_scenario_file_data(file_path):
    scenario_file_name = Path(file_path).name

    add_to_log(f"Parsing scenario file: {file_path}", LogLevel.INFO)
    with open(file_path, 'r') as file:
        content = file.read()

    scenario_data = {
        "scenario": [scenario_file_name],
        "cvp": [],
        "regionincl": [],
        "prf": [],
        "unit": [],
        "pplx": [],
        "ttrx": [],
        "terx": [],
        "wmdata": [],
        "newsitems": [],
        "oof": [],
        "oob": [],
        "mapx": [],
        "sav": []
    }
    settings_data = {}

    include_pattern = re.compile(r'#include\s+"([^"]+)",\s*"([^"]+)"')
    savfile_pattern = re.compile(r'savfile\s+"([^"]+)"')
    mapfile_pattern = re.compile(r'mapfile\s+"([^"]+)"')
    gmc_pattern = re.compile(r'&&GMC(.*?)&&END', re.DOTALL)
    key_value_pattern = re.compile(r'(\w+):\s*(.*)')

    for match in include_pattern.finditer(content):
        filename = match.group(1)
        extension = os.path.splitext(filename)[1].lstrip('.').lower()
        if extension in scenario_data:
            scenario_data[extension].append(filename)

    savfile_match = savfile_pattern.search(content)

    if savfile_match:
        scenario_data['sav'].append(f"{savfile_match.group(1)}.SAV")

    mapfile_match = mapfile_pattern.search(content)

    if mapfile_match:
        scenario_data['mapx'].append(f"{mapfile_match.group(1)}.MAPX")

    gmc_match = gmc_pattern.search(content)

    if gmc_match:
        gmc_content = gmc_match.group(1)
        lines = gmc_content.split('\n')
        for line in lines:
            line = line.strip()
            if not line:
                continue
            key_value_match = key_value_pattern.match(line)
            if key_value_match:
                key = key_value_match.group(1)
                value = key_value_match.group(2).strip()
                if key in ["startymd", "difficulty", "victoryhex"]:
                    settings_data[key] = [int(v) if v else None for v in value.split(",") if v]
                elif key == "fastfwddays":
                    settings_data[key] = float(value) if value else None
                else:
                    settings_data[key] = int(value) if value.isdigit() else value

    add_to_log(f"Parsed scenario data: {json.dumps(scenario_data, indent=4)}", LogLevel.DEBUG)
    add_to_log(f"Parsed settings data: {json.dumps(settings_data, indent=4)}", LogLevel.DEBUG)
    
    return {
        "scenario_data": scenario_data,
        "settings_data": settings_data
    }
