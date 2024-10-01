# wmdata_importer.py

import json
import re
from ..utils.logging_utils import add_to_log, LogLevel

# Dictionary for resource production mappings
ID_TO_RESOURCE = {
    0: "agriculture",
    1: "rubber",
    2: "timber",
    3: "petroleum",
    4: "coal",
    5: "ore",
    6: "uranium",
    7: "electricity",
    8: "consumergoods",
    9: "militarygoods",
    10: "industrialgoods"
}

# Specific labels for the subsections
BATTSTRDEFAULT_LABELS = [
    "inf", "rec", "tank", "at", "art", "aa", "trp", "helo", "miss", "int",
    "fig", "multi", "bomb", "rec_air", "a-trp", "sub", "carr", "bship", "frig", 
    "spat", "strp", "upgrade", "unused"
]

SOCIALDEFAULTS_LABELS = [
    "healthcare", "education", "familysubsidy", "lawenforcement",
    "infrastructure", "socialassistance", "culturalsubsidy", "environment"
]

HEXRESMULTS_LABELS = [
    "agriculture", "rubber", "timber", "petroleum", "coal", "ore", "uranium", "electricity"
]

def ensure_length(lst, length):
    """Ensure the list has the specified length, filling missing values with None, and remove trailing Nones."""
    lst = lst + [None] * (length - len(lst))
    while lst and lst[-1] is None:
        lst.pop()
    return lst

def parse_float_with_comma(parts):
    """Parse float values where commas are used as decimal points."""
    if parts[1]:
        decimal_str = parts[1].replace(',', '.')
        try:
            return float(decimal_str)
        except ValueError:
            return None
    return None

def extract_wmdata(file_path):
    data = {
        "worldmarket": {},
        "resources": {}
    }
    current_section = None
    current_resource_id = None

    try:
        with open(file_path, 'r') as file:
            for line in file:
                stripped_line = line.strip()

                # Skip comments and empty lines
                if stripped_line.startswith("//") or not stripped_line:
                    continue

                # Start of worldmarket data
                if stripped_line.startswith("&&WMDATA"):
                    current_section = "worldmarket"
                    continue

                # End of section
                if stripped_line == "&&END":
                    current_section = None
                    continue

                # Start of a WMPRODDATA section
                match = re.match(r'&&WMPRODDATA, (\d+)', stripped_line)
                if match:
                    resource_id = int(match.group(1))
                    current_resource_id = ID_TO_RESOURCE.get(resource_id)
                    if current_resource_id:
                        data["resources"][current_resource_id] = {}
                        current_section = "resources"
                    else:
                        add_to_log(f"Unknown resource ID: {resource_id}", LogLevel.WARNING)
                    continue

                # Processing worldmarket section
                if current_section == "worldmarket":
                    parts = [x.strip() if x.strip() else None for x in re.split(r'[,]', stripped_line)]
                    key = parts[0]

                    if key == "battstrdefault":
                        values = ensure_length([int(x) if x else None for x in parts[1:]], len(BATTSTRDEFAULT_LABELS))
                        data["worldmarket"][key] = dict(zip(BATTSTRDEFAULT_LABELS, values))
                    elif key == "socialdefaults":
                        values = ensure_length([int(x) if x else None for x in parts[1:]], len(SOCIALDEFAULTS_LABELS))
                        data["worldmarket"][key] = dict(zip(SOCIALDEFAULTS_LABELS, values))
                    elif key == "hexresmults":
                        values = ensure_length([int(x) if x else None for x in parts[1:]], len(HEXRESMULTS_LABELS))
                        data["worldmarket"][key] = dict(zip(HEXRESMULTS_LABELS, values))
                    elif key in ["primerate", "socadj", "wmrelrate"]:
                        # Handle decimal values where commas are decimal points
                        value = parse_float_with_comma(parts)
                        data["worldmarket"][key] = value
                    else:
                        # Handle other values
                        values = [int(x) if x and x.isdigit() else None for x in parts[1:]]
                        data["worldmarket"][key] = values if len(values) > 1 else values[0]

                # Processing resources section
                elif current_section == "resources" and current_resource_id:
                    parts = [x.strip() if x.strip() else None for x in re.split(r'[,]', stripped_line)]
                    key = parts[0]

                    if key == "producefrom":
                        values = ensure_length([int(x) if x else None for x in parts[1:]], len(ID_TO_RESOURCE))
                        data["resources"][current_resource_id][key] = dict(zip(ID_TO_RESOURCE.values(), values))
                    else:
                        values = [int(x) if x and x.isdigit() else None for x in parts[1:]]
                        data["resources"][current_resource_id][key] = values if len(values) > 1 else values[0]

        add_to_log(f"Successfully extracted WMData from {file_path}", LogLevel.INFO)
    except Exception as e:
        add_to_log(f"Error extracting WMData: {e}", LogLevel.ERROR)
        raise

    return data
