from pathlib import Path
import json
from ..config import Config

class SettingsHandler:
    def __init__(self):
        self.scenario_file_data = {}
        self.settings_data = Config.DEFAULT_SETTINGS_STRUCTURE.copy()

    def load_data_from_file(self, file_path):
        """
        Load data from a .scenario file and extract both settings and scenario data.
        """
        file_path = Path(file_path)
        if not file_path.exists():
            raise FileNotFoundError(f"{file_path} not found")

        with open(file_path, 'r') as file:
            self.scenario_file_data = json.load(file)
            self.settings_data = self.scenario_file_data.get('settings_data', Config.DEFAULT_SETTINGS_STRUCTURE.copy())
        return self.settings_data

    def load_default_project_data(self, project_name):
        """
        Load default project data based on project name.
        """
        default_project_path = Path(Config.EXTRACT_FOLDER) / f"{project_name}.scenario"
        return self.load_data_from_file(default_project_path)

    def create_new_empty_structure(self):
        """
        Create a new empty structure based on the default settings structure.
        """
        self.settings_data = Config.DEFAULT_SETTINGS_STRUCTURE.copy()
        return self.settings_data

    def update_value(self, label, value):
        """
        Update a specific value in the settings data.
        """
        if label in self.settings_data:
            self.settings_data[label] = value
        else:
            raise KeyError(f"Label {label} does not exist in settings data")

    def get_structure(self):
        """
        Return the current settings structure as a JSON object.
        """
        return self.settings_data

# Instantiate the handler
settings_handler = SettingsHandler()
