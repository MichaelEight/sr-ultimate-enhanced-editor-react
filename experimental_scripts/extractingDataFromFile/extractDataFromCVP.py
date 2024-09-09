import json
import re
import os

# Helper functions for processing different && sections
def process_grouping(lines):
    grouping_data = []
    for line in lines:
        # Process each line and convert values to integers, skipping empty ones
        line_parts = [int(x) for x in line.split(",") if x.strip()]
        grouping_data.extend(line_parts)
    return grouping_data

def process_regiontechs(lines):
    regiontechs_data = []
    for line in lines:
        # Process each line and convert values to integers
        line_parts = [int(x) for x in line.split(",") if x.strip()]
        regiontechs_data.extend(line_parts)
    return regiontechs_data

def process_regionunitdesigns(lines):
    regionunitdesigns_data = []
    for line in lines:
        # Process each line and convert values to integers
        line_parts = [int(x) for x in line.split(",") if x.strip()]
        regionunitdesigns_data.extend(line_parts)
    return regionunitdesigns_data

def process_regionproducts(lines):
    regionproducts_data = []
    for line in lines:
        # Process each line as an array of values (some null) and trim trailing nulls
        line_parts = [int(x) if x.strip().isdigit() else None for x in line.split(",")]
        while line_parts and line_parts[-1] is None:
            line_parts.pop()  # Remove trailing nulls
        regionproducts_data.append(line_parts)
    return regionproducts_data

def process_regionsocials(lines):
    regionsocials_data = []
    for line in lines:
        line_parts = line.split(",")
        # Ensure the first value is an integer (if valid), otherwise set it to None
        first_part = int(line_parts[0].strip()) if line_parts[0].strip().isdigit() else None
        # Ensure the second value is a float or None
        second_part = float(line_parts[1].strip()) if len(line_parts) > 1 and line_parts[1].strip() else None
        # Ensure the third value is None, we always add this
        third_part = None
        # Append the result as [first_part, second_part, third_part]
        if first_part is not None or second_part is not None:  # Skip completely empty rows
            regionsocials_data.append([first_part, second_part, third_part])
    return regionsocials_data


def process_regionreligions(lines):
    regionreligions_data = []
    for line in lines:
        # Process each line as an array of values (some null), keeping pairs of [int, float]
        line_parts = [int(line.split(',')[0].strip()), float(line.split(',')[1].strip()) if line.split(',')[1].strip() != "" else 0.0]
        regionreligions_data.append(line_parts)
    return regionreligions_data

# Main function to extract data
def extract_data(file_path):
    data = {
        "Theaters_Data": {},
        "Regions_Data": []
    }
    
    # Flags to track sections
    in_theaters = False
    in_transfers = False
    in_regions = False
    region_data = None
    current_section = None
    section_lines = []

    with open(file_path, 'r') as file:
        for line in file:
            stripped_line = line.strip()
            
            # Start of Theaters_Data
            if stripped_line.startswith("&&THEATRES"):
                in_theaters = True
                continue
            
            # End of Theaters_Data, and start of Theatre Transfer Data
            if in_theaters and stripped_line.startswith("&&THEATRETRANSF"):
                in_theaters = False
                in_transfers = True
                continue

            # Collecting Theaters_Data
            if in_theaters:
                theater_parts = [x.strip() for x in stripped_line.split(',')]
                if len(theater_parts) >= 6:
                    theater_id = int(theater_parts[0])
                    data["Theaters_Data"][theater_id] = {
                        "theatreName": theater_parts[1],
                        "theatreCode": theater_parts[2],
                        "culture": int(theater_parts[3]),
                        "xLocation": int(theater_parts[4]),
                        "yLocation": int(theater_parts[5]),
                        "transfers": []  # Initialize transfers as an empty array
                    }
                continue

            # Collecting Theatre Transfer Data
            if in_transfers:
                if stripped_line.startswith("&&END"):
                    in_transfers = False
                    continue
                
                transfer_parts = stripped_line.split('//')[0].strip().split(',')
                transfer_ids = [int(x.strip()) for x in transfer_parts if x.strip()]
                
                if transfer_ids:
                    theatre_id = transfer_ids[0]  # First value represents the theatre ID
                    if theatre_id in data["Theaters_Data"]:
                        data["Theaters_Data"][theatre_id]["transfers"] = transfer_ids[1:]  # Add all other IDs as transfers
                continue

            # Start of Regions_Data
            if stripped_line.startswith("&&CVP"):
                in_regions = True
                if region_data:
                    data["Regions_Data"].append(region_data)
                region_data = {"ID": int(stripped_line.split()[1]), "Properties": {}}
                current_section = None
                continue

            # Collecting Regions_Data
            if in_regions:
                if stripped_line.startswith("&&"):
                    if current_section and section_lines:
                        # Process the last section before moving to a new one
                        if current_section == "grouping":
                            region_data["grouping"] = process_grouping(section_lines)
                        elif current_section == "regiontechs":
                            region_data["regiontechs"] = process_regiontechs(section_lines)
                        elif current_section == "regionunitdesigns":
                            region_data["regionunitdesigns"] = process_regionunitdesigns(section_lines)
                        elif current_section == "regionproducts":
                            region_data["regionproducts"] = process_regionproducts(section_lines)
                        elif current_section == "regionsocials":
                            region_data["regionsocials"] = process_regionsocials(section_lines)
                        elif current_section == "regionreligions":
                            region_data["regionreligions"] = process_regionreligions(section_lines)
                    
                    # Start new section
                    current_section = stripped_line.replace("&&", "").lower().split()[0]
                    section_lines = []
                    continue

                if current_section is None:
                    # Process properties outside special sections
                    parts = re.split(r'\s+', stripped_line, 1)
                    if len(parts) == 2:
                        label, value = parts[0], parts[1]
                    elif len(parts) == 1:
                        label, value = parts[0], None
                    else:
                        continue

                    # Ensure we skip empty labels (to avoid adding "")
                    if label and value is not None:
                        if label in ["altregionname", "influence", "influenceval"]:
                            value = [x.strip() if x.strip() else None for x in value.split(",")]
                        elif label == "regioncolor":
                            value = value.strip()  # Keep regioncolor as string, no conversion to int
                        elif value.startswith('"') and value.endswith('"'):
                            value = value.strip('"')
                        elif value == ",":
                            value = []
                        elif value.startswith('0x'):
                            value = value  # Keep hex as string
                        elif re.match(r'^-?\d+(\.\d+)?$', value):
                            value = float(value) if '.' in value else int(value)
                        elif value == "":
                            value = None
                        
                        # Add property if the label is valid (non-empty)
                        region_data["Properties"][label] = value

                else:
                    # Collect lines for the current section
                    section_lines.append(stripped_line)

        if region_data:
            # Ensure the last section is processed
            if current_section == "grouping":
                region_data["grouping"] = process_grouping(section_lines)
            elif current_section == "regiontechs":
                region_data["regiontechs"] = process_regiontechs(section_lines)
            elif current_section == "regionunitdesigns":
                region_data["regionunitdesigns"] = process_regionunitdesigns(section_lines)
            elif current_section == "regionproducts":
                region_data["regionproducts"] = process_regionproducts(section_lines)
            elif current_section == "regionsocials":
                region_data["regionsocials"] = process_regionsocials(section_lines)
            elif current_section == "regionreligions":
                region_data["regionreligions"] = process_regionreligions(section_lines)
            
            data["Regions_Data"].append(region_data)

    # Save the resulting JSON to a file
    with open('output.json', 'w') as json_file:
        json.dump(data, json_file, indent=4)
    
    return data

# Example usage: assuming the file is located in the same directory as the script
file_path = os.path.join(os.getcwd(), 'SR1936short.cvp')
output_data = extract_data(file_path)

# Output file saved as 'output.json' in the script's directory
print("JSON data has been saved to 'output.json'")
