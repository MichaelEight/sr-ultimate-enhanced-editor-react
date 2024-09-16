# &&OOB 101
# 2145, 1, 2, , 3, 4, , 5, 6, , 7, , , , , , , , , 

# &&OOB [regionId]
# UnitID, X, Y, --, Quantity, Status, --, Name, Entrenchment, --, Experience, --, --, --, --, --, --, --, --,

# FROM GAMEFILES
# Location X,Y, LocName, Quantity, Status, BattNum, BattName, Entrench, Eff, Exp, Special, Str, MaxStr, DaysLeft, Facing, Group#, TargetRole, StatustoBattC, StatustoBattN,Class,Name

import json
import os
import re

def process_oob_unit(line):
    # Split by comma and process each value (None for missing)
    unit_parts = [x.strip() if x.strip() else None for x in line.split(",")]
    
    # Create a dictionary with all expected keys
    unit_data = {
        "unitId": int(unit_parts[0]) if unit_parts[0] else None,
        "X": int(unit_parts[1]) if unit_parts[1] else None,
        "Y": int(unit_parts[2]) if unit_parts[2] else None,
        "LocName": unit_parts[3],
        "Quantity": int(unit_parts[4]) if unit_parts[4] else None,
        "Status": unit_parts[5],
        "BattNum": int(unit_parts[6]) if unit_parts[6] else None,
        "BattName": unit_parts[7],
        "Entrench": int(unit_parts[8]) if unit_parts[8] else None,
        "Eff": int(unit_parts[9]) if unit_parts[9] else None,
        "Exp": int(unit_parts[10]) if unit_parts[10] else None,
        "Special": unit_parts[11],
        "Str": int(unit_parts[12]) if unit_parts[12] else None,
        "MaxStr": int(unit_parts[13]) if unit_parts[13] else None,
        "DaysLeft": int(unit_parts[14]) if unit_parts[14] else None,
        "Facing": unit_parts[15],
        "GroupId": int(unit_parts[16]) if unit_parts[16] else None,
        "TargetRole": unit_parts[17],
        "StatustoBattC": unit_parts[18],
        "StatustoBattN": unit_parts[19]
    }
    
    return unit_data

def extract_oob_data(file_path):
    data = {
        "OOB_Data": []
    }
    
    current_region_id = None
    current_units = []
    
    with open(file_path, 'r') as file:
        for line in file:
            stripped_line = line.strip()

            # Ignore comments (anything after "//")
            stripped_line = re.split(r"//", stripped_line)[0].strip()
            if not stripped_line:
                continue

            # Detect start of new region
            if stripped_line.startswith("&&OOB"):
                # Process previous region if any
                if current_region_id is not None:
                    data["OOB_Data"].append({
                        "regionId": current_region_id,
                        "units": current_units
                    })

                # Extract region ID
                current_region_id = int(stripped_line.split()[1])
                current_units = []
                continue

            # Process each unit line
            current_units.append(process_oob_unit(stripped_line))
        
        # Ensure last region is processed
        if current_region_id is not None:
            data["OOB_Data"].append({
                "regionId": current_region_id,
                "units": current_units
            })

    # Save the resulting JSON to a file
    output_path = 'output_oob.json'
    with open(output_path, 'w') as json_file:
        json.dump(data, json_file, indent=4)
    
    return data

# Example usage: assuming the file is located in the same directory as the script
file_path = os.path.join(os.getcwd(), 'ExampleShort.OOB')
output_data = extract_oob_data(file_path)

# Output file saved as 'output_oob.json' in the script's directory
print("JSON data has been saved to 'output_oob.json'")
