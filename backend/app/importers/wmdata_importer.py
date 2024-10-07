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
        "worldmarket": {
            "settings": {},
            "military": {},
            "economic": {},
            "weather": {}
        },
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
                        data["resources"][current_resource_id] = {
                            "cost": {},
                            "production": {},
                            "producefrom": {}
                        }
                        current_section = "resources"
                    else:
                        add_to_log(f"Unknown resource ID: {resource_id}", LogLevel.WARNING)
                    continue

                # Processing worldmarket section
                if current_section == "worldmarket":
                    parts = [x.strip() if x.strip() else None for x in re.split(r',', stripped_line)]
                    key = parts[0].lower()  # Ensure keys are lowercase for consistency

                    # Map keys to their corresponding groups
                    if key in ["wmlevel", "gdpcbase", "dayswmlevel"]:
                        # Settings group
                        value = int(parts[1]) if parts[1] else None
                        data["worldmarket"]["settings"][key] = value
                    elif key in ["primerate", "socadj", "wmrelrate"]:
                        value = parse_float_with_comma(parts)
                        data["worldmarket"]["settings"][key] = value
                    elif key == "battstrdefault":
                        values = ensure_length([int(x) if x else None for x in parts[1:]], len(BATTSTRDEFAULT_LABELS))
                        data["worldmarket"]["military"][key] = dict(zip(BATTSTRDEFAULT_LABELS, values))
                    elif key == "unitgarrison":
                        values = [int(x) if x else None for x in parts[1:]]
                        data["worldmarket"]["military"][key] = values
                    elif key == "garrisonprogression":
                        values = [int(x) if x else None for x in parts[1:]]
                        data["worldmarket"]["military"][key] = values
                    elif key == "hexresmults":
                        values = ensure_length([int(x) if x else None for x in parts[1:]], len(HEXRESMULTS_LABELS))
                        data["worldmarket"]["economic"][key] = dict(zip(HEXRESMULTS_LABELS, values))
                    elif key == "socialdefaults":
                        values = ensure_length([int(x) if x else None for x in parts[1:]], len(SOCIALDEFAULTS_LABELS))
                        data["worldmarket"]["economic"][key] = dict(zip(SOCIALDEFAULTS_LABELS, values))
                    elif key == "weatheroffy":
                        values = [int(x) if x else None for x in parts[1:]]
                        data["worldmarket"]["weather"][key] = values
                    elif key == "weatherspeed":
                        values = [int(x) if x else None for x in parts[1:]]
                        data["worldmarket"]["weather"][key] = values
                    elif key == "weatheryear":
                        value = int(parts[1]) if parts[1] else None
                        data["worldmarket"]["weather"][key] = value
                    else:
                        # Handle other values if any
                        values = [int(x) if x and x.isdigit() else None for x in parts[1:]]
                        data["worldmarket"][key] = values if len(values) > 1 else (values[0] if values else None)

                # Processing resources section
                elif current_section == "resources" and current_resource_id:
                    parts = [x.strip() if x.strip() else None for x in re.split(r',', stripped_line)]
                    key = parts[0].lower()

                    resource = data["resources"][current_resource_id]

                    if key == "producefrom":
                        values = ensure_length([int(x) if x else 0 for x in parts[1:]], len(ID_TO_RESOURCE))
                        resource["producefrom"] = dict(zip(ID_TO_RESOURCE.values(), values))
                    elif key in ["wmbasecost", "wmfullcost", "wmmargin"]:
                        value = int(parts[1]) if parts[1] else 0
                        resource["cost"][key] = value
                    elif key in ["nodeproduction", "wmprodperpersonmax", "wmprodperpersonmin", "wmurbanproduction"]:
                        value = int(parts[1]) if parts[1] else 0
                        resource["production"][key] = value
                    else:
                        # Handle other values if any
                        value = int(parts[1]) if parts[1] and parts[1].isdigit() else 0
                        resource[key] = value

    except Exception as e:
        add_to_log(f"Error extracting WMData: {e}", LogLevel.ERROR)
        raise

    add_to_log(f"Successfully extracted WMData from {file_path}", LogLevel.INFO)

    return data
