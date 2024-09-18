import json

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

# Helper function to remove trailing null values from arrays
def remove_trailing_nulls(lst):
    """Remove trailing nulls from a list."""
    while lst and lst[-1] is None:
        lst.pop()
    return lst

def write_wmdata(json_data, output_file):
    """Writes the JSON data back to the .wmdata format."""
    wmdata_output = "// Generated WMDATA File\n\n&&WMDATA 0\n"

    # Writing worldmarket data
    for key, value in json_data["worldmarket"].items():
        if key in ["primerate", "socadj", "wmrelrate"]:
            # Handling floats where commas are decimal points
            if value is None:
                value_str = ""
            else:
                value_str = f"{int(value)}.{int((value - int(value)) * 10)}"
            wmdata_output += f"{key}, {value_str.replace('.', ',')}\n"

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
    for resource, details in json_data["resources"].items():
        resource_id = RESOURCE_TO_ID[resource]
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

    # Save to the output file
    with open(output_file, 'w') as file:
        file.write(wmdata_output)

    print(f"WMDATA file saved as '{output_file}'.")

# Example usage
with open('output_wmdata.json', 'r') as json_file:
    json_data = json.load(json_file)

write_wmdata(json_data, 'output.wmdata')
