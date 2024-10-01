# regionincl_importer.py

import json
import re
from ..utils.logging_utils import add_to_log, LogLevel

def extract_regionincl_data(file_path):
    data = {
        "regions": []
    }

    try:
        with open(file_path, 'r') as file:
            for line in file:
                stripped_line = line.strip()

                # Skip empty lines
                if not stripped_line:
                    continue

                # Skip lines that are comments without region IDs
                if stripped_line.startswith("//") and not re.match(r'//\s*(\d+)', stripped_line):
                    continue

                # Parse lines
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
        
        add_to_log(f"Successfully extracted REGIONINCL data from {file_path}", LogLevel.INFO)
    except Exception as e:
        add_to_log(f"Error extracting REGIONINCL data: {e}", LogLevel.ERROR)
        raise

    return data
