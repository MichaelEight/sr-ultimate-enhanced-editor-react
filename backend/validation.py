import os
from message import send_message, add_to_log

def check_file_existance(base_dir, scenario_name, scenario_data):
    print(f'base_dir: {base_dir}')
    print(f'scenario_name: {scenario_name}')
    print(f'scenario_data: {scenario_data}')

    structure = {
        'scenario':    {'isRequired': True,  'doesExist': False, 'isModified': False, 'dir': '\\',               'filename': ""},
        'cvp':         {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': '\\maps\\',         'filename': ""},
        'mapx':        {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': '\\maps\\',         'filename': ""},
        'oof':         {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': '\\maps\\',         'filename': ""},
        'regionincl':  {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': '\\maps\\',         'filename': ""},
        'oob':         {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': '\\maps\\orbats\\', 'filename': ""},
        'wmdata':      {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': '\\maps\\data\\',   'filename': ""},
        'unit':        {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': '\\maps\\data\\',   'filename': ""},
        'pplx':        {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': '\\maps\\data\\',   'filename': ""},
        'ttrx':        {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': '\\maps\\data\\',   'filename': ""},
        'terx':        {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': '\\maps\\data\\',   'filename': ""},
        'newsitems':   {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': '\\maps\\data\\',   'filename': ""},
        'prf':         {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': '\\maps\\data\\',   'filename': ""}
    }

    # Extract filenames and mark isRequired for each
    # Loop through the scenario_data dictionary
    for label, file_list in scenario_data.items():        
        # Split the filename to remove the extension and get the base name
        filename = file_list[0].split('.')[0]

        if label in structure:
            structure[label]['filename'] = filename
        
            # If filename == 'default' OR is listed as game default files (cvp etc) then mark it as non required
            # TODO write full list of names also based on label
            if not (filename in ['default', "DEFAULT"]):
                structure[label]['isRequired'] = True

    # TODO Check if each file exists
    # directory = dir + label + filename

    # DEBUG, set all exists to true
    for label in structure:
        structure[label]['doesExist'] = True

    # existing_files = set()
    # for root, _, files in os.walk(base_dir):
    #     for file in files:
    #         relative_path = os.path.relpath(os.path.join(root, file), base_dir).replace("\\", "/").lower()
    #         existing_files.add(relative_path)
    #         if relative_path in structure:
    #             structure[relative_path]['exists'] = True
    #             add_to_log(f"** Found existing file: {relative_path}")
    #         else:
    #             add_to_log(f"?? Unexpected file: {relative_path}")
    #             expected_folder = '/'.join(relative_path.split('/')[:-1])
    #             for key in structure.keys():
    #                 if key.startswith(expected_folder) and file in key:
    #                     send_message(f"?? File out of place: {relative_path}")
    #                     break

    # TODO Additional validation
    # for path, info in structure.items():
    #     if info['required'] and not info['exists']:
    #         # Check for file in the correct destination but different name
    #         found = False
    #         for existing_file in existing_files:
    #             if existing_file.endswith(path.split('/')[-1]):
    #                 send_message(f"!! Required file {path} not found, but found similar file {existing_file}")
    #                 found = True
    #                 break
    #         if not found:
    #             send_message(f"!! Required file {path} not found")

    return structure
