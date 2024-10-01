# wmdata_exporter.py

from ..utils.logging_utils import add_to_log, LogLevel

# Reverse dictionary for mapping resources to their IDs
RESOURCE_TO_ID = {v: k for k, v in {
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
}.items()}

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

# Specific labels for world market data
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

def remove_trailing_nulls(lst):
    """Remove trailing nulls from a list."""
    while lst and lst[-1] is None:
        lst.pop()
    return lst

def write_wmdata(json_data, output_file_path):
    """Writes the JSON data back to the .wmdata format."""
    wmdata_output = "// Generated WMDATA File\n\n&&WMDATA 0\n"

    # Writing worldmarket data
    worldmarket = json_data.get("worldmarket", {})
    for key, value in worldmarket.items():
        if key in ["primerate", "socadj", "wmrelrate"]:
            # Handling floats where commas are decimal points
            if value is None:
                value_str = ""
            else:
                value_str = str(value).replace('.', ',')
            wmdata_output += f"{key}, {value_str}\n"

        elif key == "battstrdefault":
            # Writing battstrdefault values with the correct labels
            value_str = ", ".join(str(value.get(label, "")) if value.get(label) is not None else "" for label in BATTSTRDEFAULT_LABELS)
            wmdata_output += f"{key}, {value_str},\n"
        
        elif key == "socialdefaults":
            # Writing socialdefaults values with the correct labels
            value_str = ", ".join(str(value.get(label, "")) if value.get(label) is not None else "" for label in SOCIALDEFAULTS_LABELS)
            wmdata_output += f"{key}, {value_str},\n"
        
        elif key == "hexresmults":
            # Writing hexresmults values with the correct labels
            value_str = ", ".join(str(value.get(label, "")) if value.get(label) is not None else "" for label in HEXRESMULTS_LABELS)
            wmdata_output += f"{key}, {value_str},\n"
        
        else:
            # Handling regular world market data arrays
            if isinstance(value, list):
                value = remove_trailing_nulls(value)
                value_str = ", ".join(str(v) if v is not None else "" for v in value)
            else:
                value_str = str(value) if value is not None else ""
            wmdata_output += f"{key}, {value_str},\n"
    
    wmdata_output += "&&END\n\n"

    # Writing resource production data
    resources = json_data.get("resources", {})
    for resource, details in resources.items():
        resource_id = RESOURCE_TO_ID.get(resource)
        if resource_id is not None:
            wmdata_output += f"&&WMPRODDATA, {resource_id}\n"
            for key, value in details.items():
                if key == "producefrom":
                    # Handling producefrom array with the correct labels
                    value_str = ", ".join(str(value.get(label, "")) if value.get(label) is not None else "" for label in ID_TO_RESOURCE.values())
                    wmdata_output += f"{key}, {value_str},\n"
                else:
                    if isinstance(value, list):
                        value = remove_trailing_nulls(value)
                        value_str = ", ".join(str(v) if v is not None else "" for v in value)
                    else:
                        value_str = str(value) if value is not None else ""
                    wmdata_output += f"{key}, {value_str},\n"
            
            wmdata_output += "&&END\n\n"
        else:
            add_to_log(f"Unknown resource: {resource}", LogLevel.WARNING)

    try:
        with open(output_file_path, 'w') as file:
            file.write(wmdata_output)
        add_to_log(f"WMDATA file saved as '{output_file_path}'.", LogLevel.INFO)
    except Exception as e:
        add_to_log(f"Error exporting WMDATA file: {e}", LogLevel.ERROR)
        raise
