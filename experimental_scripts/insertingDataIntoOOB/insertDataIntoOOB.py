import json

def write_oob_units(units):
    units_output = ""
    for unit in units:
        unit_str = ", ".join([str(unit[key]) if unit[key] is not None else "" for key in [
            "unitId", "X", "Y", "LocName", "Quantity", "Status", "BattNum", "BattName",
            "Entrench", "Eff", "Exp", "Special", "Str", "MaxStr", "DaysLeft", "Facing",
            "GroupId", "TargetRole", "StatustoBattC", "StatustoBattN"
        ]])
        units_output += f"{unit_str},\n"
    return units_output

def write_oob_region(region):
    region_output = f"&&OOB {region['regionId']}\n"
    region_output += write_oob_units(region["units"])
    return region_output + "\n"

def json_to_oob(json_data):
    oob_output = "// Generated OOB File\n\n"
    for region in json_data["OOB_Data"]:
        oob_output += write_oob_region(region)
    return oob_output

# Example usage with your JSON input (load from a file or variable)
with open('exampleInput.json') as json_file:
    json_data = json.load(json_file)

oob_output = json_to_oob(json_data)

# Save the OOB output to a file
with open('output.oob', 'w') as output_file:
    output_file.write(oob_output)

print("OOB file has been generated.")
