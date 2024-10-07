# upload_export_same.py
# NOT WORKING CORRECTLY (02.10.2024)

import os
import requests
from pathlib import Path

# Configure the base URL of your backend server
# Change this if your backend is hosted elsewhere
BASE_URL = 'http://localhost:5000'

# Define the API endpoints
UPLOAD_ENDPOINT = f'{BASE_URL}/upload'
EXPORT_ENDPOINT = f'{BASE_URL}/export'

# Define paths
CURRENT_DIR = Path(__file__).parent
ZIP_FILE_PATH = CURRENT_DIR / 'FourIslands.ZIP'

def upload_project(zip_path):
    """
    Uploads the ZIP file to the backend via the /upload API.

    Args:
        zip_path (Path): Path to the ZIP file to upload.

    Returns:
        Response object from the upload request.
    """
    if not zip_path.is_file():
        print(f"Error: ZIP file not found at {zip_path}")
        return None

    print(f"Uploading project from {zip_path} to {UPLOAD_ENDPOINT}...")
    try:
        with open(zip_path, 'rb') as zip_file:
            files = {'file': (zip_path.name, zip_file, 'application/zip')}
            response = requests.post(UPLOAD_ENDPOINT, files=files)
            if response.status_code == 200:
                print("Upload successful.")
            else:
                print(f"Upload failed with status code {response.status_code}: {response.text}")
            return response
    except Exception as e:
        print(f"Exception during upload: {e}")
        return None

def export_project():
    """
    Calls the /export API to export the project.

    Returns:
        Response object from the export request.
    """
    print(f"Exporting project via {EXPORT_ENDPOINT}...")
    try:
        response = requests.post(EXPORT_ENDPOINT)  # Use POST if backend expects POST
        # If backend expects GET, use:
        # response = requests.get(EXPORT_ENDPOINT)
        if response.status_code == 200:
            print("Export successful.")
            # If the export returns a downloadable file, save it
            if 'application/zip' in response.headers.get('Content-Type', ''):
                export_file_path = CURRENT_DIR / 'exported_project.zip'
                with open(export_file_path, 'wb') as f:
                    f.write(response.content)
                print(f"Exported file saved to {export_file_path}")
            else:
                # If the export returns JSON or other data
                print(f"Export response: {response.json()}")
            return response
        else:
            print(f"Export failed with status code {response.status_code}: {response.text}")
            return response
    except Exception as e:
        print(f"Exception during export: {e}")
        return None

def rename_file(old_path, new_path):
    """
    Renames a file on the server via a hypothetical API.

    Args:
        old_path (str): The current path of the file to rename.
        new_path (str): The new path/name for the file.

    Returns:
        Response object from the rename request.
    """
    # This is a placeholder. Implement the actual API call as per your backend.
    RENAME_ENDPOINT = f'{BASE_URL}/rename'
    payload = {'old_path': old_path, 'new_path': new_path}
    print(f"Renaming file from {old_path} to {new_path} via {RENAME_ENDPOINT}...")
    try:
        response = requests.post(RENAME_ENDPOINT, json=payload)
        if response.status_code == 200:
            print("File renamed successfully.")
        else:
            print(f"File rename failed with status code {response.status_code}: {response.text}")
        return response
    except Exception as e:
        print(f"Exception during file rename: {e}")
        return None

def modify_value(api_endpoint, data):
    """
    Modifies a value in another tab or section via a hypothetical API.

    Args:
        api_endpoint (str): The specific API endpoint to call.
        data (dict): The data to send in the request.

    Returns:
        Response object from the modification request.
    """
    # This is a placeholder. Implement the actual API call as per your backend.
    print(f"Modifying value via {api_endpoint} with data {data}...")
    try:
        response = requests.post(api_endpoint, json=data)
        if response.status_code == 200:
            print("Value modified successfully.")
        else:
            print(f"Value modification failed with status code {response.status_code}: {response.text}")
        return response
    except Exception as e:
        print(f"Exception during value modification: {e}")
        return None

def main():
    # Step 1: Upload the project
    upload_response = upload_project(ZIP_FILE_PATH)
    if not upload_response or upload_response.status_code != 200:
        print("Aborting due to upload failure.")
        return

    # Step 2: Export the project
    export_response = export_project()
    if not export_response or export_response.status_code != 200:
        print("Aborting due to export failure.")
        return

    # Optional Step 3: Perform modifications (Commented Out)
    # Uncomment and adjust the following lines when you need to perform modifications.

    # Example 1: Rename a file
    # old_file_path = 'extracted/FourIslands/FourIslands/Maps/OldName.CVP'
    # new_file_path = 'extracted/FourIslands/FourIslands/Maps/NewName.CVP'
    # rename_response = rename_file(old_file_path, new_file_path)

    # Example 2: Change a value in another tab
    # api_modify_endpoint = f'{BASE_URL}/modify-value'
    # data_to_modify = {
    #     'tab': 'Settings',
    #     'key': 'difficulty',
    #     'value': '3, 3, 3'
    # }
    # modify_response = modify_value(api_modify_endpoint, data_to_modify)

    print("Test script completed successfully.")

if __name__ == '__main__':
    main()
