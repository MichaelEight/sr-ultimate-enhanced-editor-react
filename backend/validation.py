import os
from message import send_message, add_to_log
from config import EXTRACT_FOLDER, DEFAULT_PROJECT_FILE_STRUCTURE

def check_file_existance(base_dir, scenario_name, scenario_data, extractedProjectBasePath):
    add_to_log("************ Checking file existance ************")

    print(f'base_dir: {base_dir}')
    print(f'scenario_name: {scenario_name}')
    print(f'scenario_data: {scenario_data}')
    print(f'extractedProjectName: {extractedProjectBasePath}')

    add_to_log(f"** Checking file existance for scenario: {scenario_name}")
    add_to_log(f'base_dir: {base_dir}')
    add_to_log(f'scenario_name: {scenario_name}')
    add_to_log(f'scenario_data: {scenario_data}')
    add_to_log(f'extractedProjectName: {extractedProjectBasePath}')

    # TODO move it to separate function setting the projectFileStructure
    projectFileStructure = DEFAULT_PROJECT_FILE_STRUCTURE

    # Extract filenames and mark isRequired for each
    # Loop through the scenario_data dictionary
    for label, file_list in scenario_data.items():        
        # Split the filename to remove the extension and get the base name
        filename = file_list[0].split('.')[0]

        if label in projectFileStructure:
            projectFileStructure[label]['filename'] = filename
        
            # If filename == 'default' OR is listed as game default files (cvp etc) then mark it as non required
            # TODO write full list of names also based on label
            if not (filename in ['default', "DEFAULT"]):
                projectFileStructure[label]['isRequired'] = True

    # Check if each file exists
    for ext in projectFileStructure:
        if ext == 'scenario':
            fullExtractedFilePath = os.path.join(extractedProjectBasePath, (projectFileStructure[ext]['filename'] + '.' + ext))
        else:
            fullExtractedFilePath = os.path.join(extractedProjectBasePath, projectFileStructure['scenario']['filename'], projectFileStructure[ext]['dir'], (projectFileStructure[ext]['filename'] + '.' + ext))
        projectFileStructure[ext]['doesExist'] = os.path.exists(fullExtractedFilePath)
        add_to_log(f"{ext} doesExist: {projectFileStructure[ext]['doesExist']} in {fullExtractedFilePath}")

    add_to_log(f"** Finished checking file existance for scenario: {scenario_name}")
    add_to_log(f"** projectFileStructure: {projectFileStructure}")

    # existing_files = set()
    # for root, _, files in os.walk(base_dir):
    #     for file in files:
    #         relative_path = os.path.relpath(os.path.join(root, file), base_dir).replace("\\", "/").lower()
    #         existing_files.add(relative_path)
    #         if relative_path in projectFileStructure:
    #             projectFileStructure[relative_path]['exists'] = True
    #             add_to_log(f"** Found existing file: {relative_path}")
    #         else:
    #             add_to_log(f"?? Unexpected file: {relative_path}")
    #             expected_folder = '/'.join(relative_path.split('/')[:-1])
    #             for key in projectFileStructure.keys():
    #                 if key.startswith(expected_folder) and file in key:
    #                     send_message(f"?? File out of place: {relative_path}")
    #                     break

    # TODO Additional validation
    # for path, info in projectFileStructure.items():
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


    add_to_log("** Check complete, returning projectFileStructure: " + str(projectFileStructure))
    add_to_log("************ Checking file existance DONE ************")
    return projectFileStructure
