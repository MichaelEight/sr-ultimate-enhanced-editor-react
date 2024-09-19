import zipfile
import os
import re
import json
import shutil
from pathlib import Path
from message import add_to_log, LogLevel

def extract_archive(zip_file_path: str, extract_to_path: str):
    add_to_log(f"Starting extraction of '{zip_file_path}' to '{extract_to_path}'", LogLevel.INFO)
    with zipfile.ZipFile(zip_file_path, 'r') as zip_ref:
        for member in zip_ref.namelist():
            # Skip directories
            if member.endswith('/'):
                continue

            member_path = Path(member)
            parts = member_path.parts

            # Remove the top-level directory if it exists
            if len(parts) > 1:
                parts = parts[1:]
            else:
                parts = parts

            target_path = Path(extract_to_path).joinpath(*parts)
            target_path.parent.mkdir(parents=True, exist_ok=True)
            with zip_ref.open(member) as source_file, open(target_path, 'wb') as target_file:
                shutil.copyfileobj(source_file, target_file)
            add_to_log(f"Extracted '{member}' to '{target_path}'", LogLevel.TRACE)

    add_to_log(f"Extraction completed for '{zip_file_path}'", LogLevel.INFO)

def find_scenario_file(extract_path):
    add_to_log(f"Searching for .SCENARIO file in {extract_path}", LogLevel.INFO)
    for root, _, files in os.walk(extract_path):
        for file in files:
            if file.endswith('.SCENARIO'):
                add_to_log(f"Found scenario file: {file} in {root}", LogLevel.INFO)
                return os.path.splitext(file)[0], root, file
    add_to_log(f"No .SCENARIO file found in {extract_path}", LogLevel.ERROR)
    raise ValueError("No .SCENARIO file found")

def parse_scenario_file(file_path, scenario_file_name):
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
