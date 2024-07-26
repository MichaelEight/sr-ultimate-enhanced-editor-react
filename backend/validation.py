# validation.py
import os
from message import send_message

def validate_file_structure(base_dir, scenario_name):
    structure = {
        f"{scenario_name}.SCENARIO".lower(): {'required': True, 'exists': False},
        f"{scenario_name}/MAPS/{scenario_name}.CVP".lower(): {'required': False, 'exists': False},
        f"{scenario_name}/MAPS/{scenario_name}.MAPX".lower(): {'required': False, 'exists': False},
        f"{scenario_name}/MAPS/{scenario_name}.OOF".lower(): {'required': False, 'exists': False},
        f"{scenario_name}/MAPS/{scenario_name}.REGIONINCL".lower(): {'required': False, 'exists': False},
        f"{scenario_name}/MAPS/ORBATS/{scenario_name}.OOB".lower(): {'required': False, 'exists': False},
        f"{scenario_name}/MAPS/DATA/{scenario_name}.WMDATA".lower(): {'required': False, 'exists': False},
        f"{scenario_name}/MAPS/DATA/{scenario_name}.UNIT".lower(): {'required': False, 'exists': False},
        f"{scenario_name}/MAPS/DATA/{scenario_name}.PPLX".lower(): {'required': False, 'exists': False},
        f"{scenario_name}/MAPS/DATA/{scenario_name}.TTRX".lower(): {'required': False, 'exists': False},
        f"{scenario_name}/MAPS/DATA/{scenario_name}.TERX".lower(): {'required': False, 'exists': False},
        f"{scenario_name}/MAPS/DATA/{scenario_name}.NEWSITEMS".lower(): {'required': False, 'exists': False},
        f"{scenario_name}/MAPS/DATA/{scenario_name}.PRF".lower(): {'required': False, 'exists': False},
    }

    for root, _, files in os.walk(base_dir):
        for file in files:
            relative_path = os.path.relpath(os.path.join(root, file), base_dir).replace("\\", "/").lower()
            if relative_path in structure:
                structure[relative_path]['exists'] = True
            else:
                send_message(f"?? Unexpected file: {relative_path}")
                expected_folder = '/'.join(relative_path.split('/')[:-1])
                for key in structure.keys():
                    if key.startswith(expected_folder) and file in key:
                        send_message(f"?? File out of place: {relative_path}")
                        break

    extension_count = {}
    for relative_path in structure.keys():
        ext = os.path.splitext(relative_path)[1]
        if ext not in extension_count:
            extension_count[ext] = 0
        if structure[relative_path]['exists']:
            extension_count[ext] += 1
            if extension_count[ext] > 1:
                send_message(f"?? Possible file conflict: {relative_path}")

    return structure
