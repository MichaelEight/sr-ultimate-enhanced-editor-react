import zipfile
import os
import re
import json
import shutil
import zipfile
from pathlib import Path

def extract_archive(zip_file_path: str, extract_to_path: str):
    with zipfile.ZipFile(zip_file_path, 'r') as zip_ref:
        for member in zip_ref.namelist():
            # Skip directories
            if member.endswith('/'):
                continue

            member_path = Path(member)
            parts = member_path.parts

            # Remove the top-level directory if it exists
            if len(parts) > 1:
                # Skip the first part (top-level directory)
                parts = parts[1:]
            else:
                # File is at the root of the ZIP archive
                parts = parts  # Keep as is

            target_path = Path(extract_to_path).joinpath(*parts)
            target_path.parent.mkdir(parents=True, exist_ok=True)
            with zip_ref.open(member) as source_file, open(target_path, 'wb') as target_file:
                shutil.copyfileobj(source_file, target_file)


def find_scenario_file(extract_path):
    for root, _, files in os.walk(extract_path):
        for file in files:
            if file.endswith('.SCENARIO'):
                print(f"** Found scenario file: {file} in {root}")
                return os.path.splitext(file)[0], root, file
    raise ValueError("No .SCENARIO file found")

def parse_scenario_file(file_path, scenario_file_name):
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
                if key == "startymd" or key == "difficulty" or key == "victoryhex":
                    settings_data[key] = [int(v) if v else None for v in value.split(",") if v]
                elif key == "fastfwddays":
                    settings_data[key] = float(value) if value else None
                else:
                    settings_data[key] = int(value) if value.isdigit() else value

    print(f"** Scenario data: {json.dumps(scenario_data, indent=4)}")
    print(f"** Settings data: {json.dumps(settings_data, indent=4)}")

    return {
        "scenario_data": scenario_data,
        "settings_data": settings_data
    }

