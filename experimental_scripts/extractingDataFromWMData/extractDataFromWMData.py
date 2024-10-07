import json
import re

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
    "fig", "multi", "bomb", "rec", "a-trp", "sub", "carr", "bship", "frig", 
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
    """Ensure the list has the specified length, filling missing values with null, and remove trailing nulls."""
    lst = lst + [None] * (length - len(lst))
    while lst and lst[-1] is None:
        lst.pop()
    return lst

def parse_float_with_comma(parts):
    """Parse float values for primerate, socadj, and wmrelrate."""
    # Check for missing values and construct the float properly
    if parts[1] and parts[2]:
        return float(f"{parts[1]}.{parts[2]}")
    elif parts[1] and not parts[2]:
        return float(f"{parts[1]}.0")
    else:
        return None

def extract_wmdata(file_path):
    data = {
        "worldmarket": {},
        "resources": {}
    }
    current_section = None
    current_resource_id = None

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
                current_resource_id = ID_TO_RESOURCE[int(match.group(1))]
                data["resources"][current_resource_id] = {}
                current_section = "resources"
                continue

            # Processing worldmarket section
            if current_section == "worldmarket":
                parts = [x.strip() if x.strip() else None for x in stripped_line.split(',')]
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
                    if len(parts) > 2:
                        value = parse_float_with_comma(parts)
                    else:
                        value = None
                    data["worldmarket"][key] = value
                else:
                    values = ensure_length([int(x) if x and x.isdigit() else None for x in parts[1:]], len(parts) - 1)
                    if len(values) == 1:
                        values = values[0]
                    data["worldmarket"][key] = values

            # Processing resources section
            elif current_section == "resources" and current_resource_id:
                parts = [x.strip() if x.strip() else None for x in stripped_line.split(',')]
                key = parts[0]

                if key == "producefrom":
                    values = ensure_length([int(x) if x else None for x in parts[1:]], len(ID_TO_RESOURCE))
                    data["resources"][current_resource_id][key] = dict(zip(ID_TO_RESOURCE.values(), values))
                else:
                    values = ensure_length([int(x) if x.isdigit() else None for x in parts[1:]], len(parts) - 1)
                    if len(values) == 1:
                        values = values[0]
                    data["resources"][current_resource_id][key] = values

    # Save extracted data as JSON
    with open('output_wmdata.json', 'w') as json_file:
        json.dump(data, json_file, indent=4)

    return data

# Example usage
file_path = 'example.wmdata'
extracted_data = extract_wmdata(file_path)
print("Extracted data saved as 'output_wmdata.json'.")
