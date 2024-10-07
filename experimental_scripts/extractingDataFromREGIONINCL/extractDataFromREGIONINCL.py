import json
import re

def extract_regionincl(file_path):
    data = {
        "regions": []
    }

    with open(file_path, 'r') as file:
        for line in file:
            stripped_line = line.strip()

            # Skip completely empty lines
            if not stripped_line:
                continue
            
            # Skip lines that start with "//" and don't contain a region ID
            if stripped_line.startswith("//") and not re.match(r'//\s*(\d+)', stripped_line):
                continue

            # Look for regionID and comment
            match = re.match(r'//\s*(\d+)\s*//\s*(.*)', stripped_line)
            if match:
                # Inactive region with a comment
                region_id = int(match.group(1))
                comment = match.group(2).strip() if match.group(2).strip() else None
                data["regions"].append({"regionId": region_id, "comment": comment, "isActive": False})
            else:
                match_active = re.match(r'(\d+)\s*//\s*(.*)', stripped_line)
                if match_active:
                    # Active region with a comment
                    region_id = int(match_active.group(1))
                    comment = match_active.group(2).strip() if match_active.group(2).strip() else None
                    data["regions"].append({"regionId": region_id, "comment": comment, "isActive": True})
                else:
                    # Active region without a comment
                    match_active_no_comment = re.match(r'(\d+)', stripped_line)
                    if match_active_no_comment:
                        region_id = int(match_active_no_comment.group(1))
                        data["regions"].append({"regionId": region_id, "comment": None, "isActive": True})

    # Save the extracted data as JSON
    with open('output_regionincl.json', 'w') as json_file:
        json.dump(data, json_file, indent=4)

    return data

# Example usage
file_path = 'example.REGIONINCL'
extracted_data = extract_regionincl(file_path)
print("Extracted data saved as 'regionincl.json'.")
