import zipfile
import os
import re
import json

def extract_archive(file_path, extract_path):
    if file_path.endswith('.zip'):
        with zipfile.ZipFile(file_path, 'r') as zip_ref:
            zip_ref.extractall(extract_path)
        print(f"** Extracted ZIP archive: {file_path}")
    elif file_path.endswith('.rar'):
        raise ValueError("Convert to ZIP. RAR is not supported. Never will.")
    else:
        raise ValueError("Unsupported archive format")

def find_scenario_file(extract_path):
    for root, _, files in os.walk(extract_path):
        for file in files:
            if file.endswith('.SCENARIO'):
                print(f"** Found scenario file: {file} in {root}")
                return os.path.splitext(file)[0], root
    raise ValueError("No .SCENARIO file found")

def parse_scenario_file(file_path):
    with open(file_path, 'r') as file:
        content = file.read()

    scenario_data = {
        "cvp": [],
        "regionincl": [],
        "unit": [],
        "pplx": [],
        "ttrx": [],
        "terx": [],
        "wmdata": [],
        "newsitems": [],
        "prf": [],
        "oob": [],
        "precache": [],
        "postcache": [],
        "savfile": [],
        "mapfile": []
    }

    settings_data = {}

    include_pattern = re.compile(r'#include\s+"([^"]+)",\s*"([^"]+)"')
    savfile_pattern = re.compile(r'savfile\s+"([^"]+)"')
    mapfile_pattern = re.compile(r'mapfile\s+"([^"]+)"')
    gmc_pattern = re.compile(r'&&GMC(.*?)&&END', re.DOTALL)
    key_value_pattern = re.compile(r'(\w+):\s*(.*)')

    for match in include_pattern.finditer(content):
        filename = match.group(1)
        if filename.endswith('.CVP'):
            scenario_data['cvp'].append(filename)
        elif filename.endswith('.REGIONINCL'):
            scenario_data['regionincl'].append(filename)
        elif filename.endswith('.UNIT'):
            scenario_data['unit'].append(filename)
        elif filename.endswith('.PPLX'):
            scenario_data['pplx'].append(filename)
        elif filename.endswith('.TTRX'):
            scenario_data['ttrx'].append(filename)
        elif filename.endswith('.TERX'):
            scenario_data['terx'].append(filename)
        elif filename.endswith('.WMData'):
            scenario_data['wmdata'].append(filename)
        elif filename.endswith('.NEWSITEMS'):
            scenario_data['newsitems'].append(filename)
        elif filename.endswith('.PRF'):
            scenario_data['prf'].append(filename)
        elif filename.endswith('.OOB'):
            scenario_data['oob'].append(filename)

    savfile_match = savfile_pattern.search(content)
    if savfile_match:
        scenario_data['savfile'].append(savfile_match.group(1))

    mapfile_match = mapfile_pattern.search(content)
    if mapfile_match:
        scenario_data['mapfile'].append(mapfile_match.group(1))

    gmc_match = gmc_pattern.search(content)
    if gmc_match:
        gmc_content = gmc_match.group(1)
        lines = gmc_content.split('\n')
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            if not line:
                i += 1
                continue

            key_value_match = key_value_pattern.match(line)
            if key_value_match:
                key = key_value_match.group(1)
                value = key_value_match.group(2).strip()
                if ':' in value:
                    value = None
                    next_line = lines[i + 1].strip()
                    if key_value_pattern.match(next_line):
                        i += 1
                        key = next_line.split(':')[0].strip()
                        value = next_line.split(':')[1].strip()
                if not value:
                    settings_data[key] = None
                elif key == "startymd":
                    settings_data[key] = [int(v) for v in value.split(",") if v]
                elif key == "difficulty":
                    settings_data[key] = [int(v) for v in value.split(",") if v]
                elif key == "victoryhex":
                    settings_data[key] = [int(v) if v else None for v in value.split(",") if v]
                elif key == "fastfwddays":
                    settings_data[key] = float(value) if value else None
                else:
                    settings_data[key] = int(value) if value.isdigit() else value
            i += 1

    print(f"** Scenario data: {json.dumps(scenario_data, indent=4)}")
    print(f"** Settings data: {json.dumps(settings_data, indent=4)}")

    return {
        "scenario_data": scenario_data,
        "settings_data": settings_data
    }
