import os
from message import send_message

def validate_file_structure(base_dir, scenario_name, scenario_data):
    structure = {
        f"{scenario_name}.SCENARIO".lower(): {'required': True, 'exists': False},
        f"{scenario_name}/maps/{scenario_name}.cvp".lower(): {'required': False, 'exists': False},
        f"{scenario_name}/maps/{scenario_name}.mapx".lower(): {'required': False, 'exists': False},
        f"{scenario_name}/maps/{scenario_name}.oof".lower(): {'required': False, 'exists': False},
        f"{scenario_name}/maps/{scenario_name}.regionincl".lower(): {'required': False, 'exists': False},
        f"{scenario_name}/maps/orbats/{scenario_name}.oob".lower(): {'required': False, 'exists': False},
        f"{scenario_name}/maps/data/{scenario_name}.wmdata".lower(): {'required': False, 'exists': False},
        f"{scenario_name}/maps/data/{scenario_name}.unit".lower(): {'required': False, 'exists': False},
        f"{scenario_name}/maps/data/{scenario_name}.pplx".lower(): {'required': False, 'exists': False},
        f"{scenario_name}/maps/data/{scenario_name}.ttrx".lower(): {'required': False, 'exists': False},
        f"{scenario_name}/maps/data/{scenario_name}.terx".lower(): {'required': False, 'exists': False},
        f"{scenario_name}/maps/data/{scenario_name}.newsitems".lower(): {'required': False, 'exists': False},
        f"{scenario_name}/maps/data/{scenario_name}.prf".lower(): {'required': False, 'exists': False},
    }

    # Check for specific files in the scenario data
    file_checks = {
        "cvp": "maps",
        "regionincl": "maps",
        "unit": "maps/data",
        "pplx": "maps/data",
        "ttrx": "maps/data",
        "terx": "maps/data",
        "wmdata": "maps/data",
        "newsitems": "maps/data",
        "profile": "maps/data",
        "oob": "maps/orbats"
    }

    for key, folder in file_checks.items():
        for filename in scenario_data[key]:
            if filename.upper() != f"DEFAULT.{key.upper()}":
                relative_path = f"{scenario_name}/{folder}/{filename}".lower()
                structure[relative_path] = {'required': True, 'exists': False}

    existing_files = set()
    for root, _, files in os.walk(base_dir):
        for file in files:
            relative_path = os.path.relpath(os.path.join(root, file), base_dir).replace("\\", "/").lower()
            existing_files.add(relative_path)
            if relative_path in structure:
                structure[relative_path]['exists'] = True
                send_message(f"** Found existing file: {relative_path}")
            else:
                send_message(f"?? Unexpected file: {relative_path}")
                expected_folder = '/'.join(relative_path.split('/')[:-1])
                for key in structure.keys():
                    if key.startswith(expected_folder) and file in key:
                        send_message(f"?? File out of place: {relative_path}")
                        break

    # Additional validation
    for path, info in structure.items():
        if info['required'] and not info['exists']:
            # Check for file in the correct destination but different name
            found = False
            for existing_file in existing_files:
                if existing_file.endswith(path.split('/')[-1]):
                    send_message(f"!! Required file {path} not found, but found similar file {existing_file}")
                    found = True
                    break
            if not found:
                send_message(f"!! Required file {path} not found")

    return structure
