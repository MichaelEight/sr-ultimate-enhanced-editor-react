# utilities.py
import zipfile
import os
import re

def extract_archive(file_path, extract_path):
    if file_path.endswith('.zip'):
        with zipfile.ZipFile(file_path, 'r') as zip_ref:
            zip_ref.extractall(extract_path)
    elif file_path.endswith('.rar'):
        raise ValueError("Convert to ZIP. RAR is not supported. Never will.")
    else:
        raise ValueError("Unsupported archive format")

def find_scenario_file(extract_path):
    for root, _, files in os.walk(extract_path):
        for file in files:
            if file.endswith('.SCENARIO'):
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
        "profile": [],
        "oob": [],
        "precache": [],
        "postcache": [],
        "savfile": [],
        "mapfile": []
    }

    settings_data = {
        "startymd": None,
        "defaultregion": None,
        "difficulty": None,
        "resources": None,
        "initialfunds": None,
        "aistance": None,
        "limitdareffect": None,
        "limitmareffect": None,
        "reservelimit": None,
        "missilenolimit": None,
        "wminvolve": None,
        "wmduse": None,
        "grouployaltymerge": None,
        "groupresearchmerge": None,
        "alliedvictory": None,
        "debtfree": None,
        "noloypenalty": None,
        "mapgui": None,
        "approvaleff": None,
        "wmdeff": None,
        "svictorycond": None,
        "victoryhex": None,
        "gamelength": None,
        "fastfwddays": None,
        "mapsplash": None,
        "scenarioid": None,
        "startyear": None,
        "techtreedefault": None,
        "nocapitalmove": None,
        "regionequip": None,
        "fastbuild": None,
        "govchoice": None,
        "relationseffect": None,
        "limitinscenario": None,
        "mapmusic": None,
        "campaigngame": None,
        "victorytech": None,
        "regionallies": None,
        "regionaxis": None,
        "nosphere": None,
        "spherenn": None,
        "victoryymd": None
    }

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
            scenario_data['profile'].append(filename)
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
        key_values = key_value_pattern.findall(gmc_content)
        i = 0
        while i < len(key_values):
            key, value = key_values[i]
            value = value.strip()
            if ":" in value:
                parts = value.split(":", 1)
                settings_data[key] = None
                key_values.insert(i + 1, (parts[0].strip(), parts[1].strip()))
            else:
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

    return {
        "scenario_data": scenario_data,
        "settings_data": settings_data
    }
