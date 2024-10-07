from pathlib import Path
import json
from config import Config

class RegionsHandler:
    def __init__(self):
        self.regions_data = Config.DEFAULT_REGIONS_STRUCTURE.copy()

    def load_data_from_file(self, file_path):
        """
        Load regions data from a .cvp file.
        """
        file_path = Path(file_path)
        if not file_path.exists():
            raise FileNotFoundError(f"{file_path} not found")

        with open(file_path, 'r') as file:
            self.regions_data = json.load(file)
        return self.regions_data

    def load_default_project_data(self, project_name):
        """
        Load default regions data based on project name.
        """
        default_project_path = Path(Config.EXTRACT_FOLDER) / f"{project_name}.cvp"
        return self.load_data_from_file(default_project_path)

    def create_new_empty_structure(self):
        """
        Create a new empty structure for regions.
        """
        self.regions_data = Config.DEFAULT_REGIONS_STRUCTURE.copy()
        return self.regions_data

    def update_value(self, label, value):
        """
        Update a specific value in the regions data.
        """
        if label in self.regions_data:
            self.regions_data[label] = value
        else:
            raise KeyError(f"Label {label} does not exist in regions data")

    def get_structure(self):
        """
        Return the current regions structure as a JSON object.
        """
        return self.regions_data

# Instantiate the handler
regions_handler = RegionsHandler()
