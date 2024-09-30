# models.py

from pathlib import Path
from .config import Config
from .utils.logging_utils import add_to_log, LogLevel

from .importers.scenario_importer import import_scenario_file
from .exporters.scenario_exporter import export_scenario_file
from .importers.cvp_importer import extract_cvp_data
from .exporters.cvp_exporter import export_cvp
import copy

class Project:
    def __init__(self):
        self.original_structure = {}
        self.modified_structure = {}
        self.new_project = True
        self.root_directory = Path('unnamed')
        self.extracted_base_path = Path('unnamed')
        self.supported_extensions = ['scenario', 'cvp', 'wmdata', 'oof', 'oob', 'regionincl']

        # Initialize data attributes with default structures
        self.settings_data = copy.deepcopy(Config.DEFAULT_SETTINGS_STRUCTURE)
        self.regions_data = copy.deepcopy(Config.DEFAULT_REGIONS_STRUCTURE)
        self.theaters_data = copy.deepcopy(Config.DEFAULT_THEATERS_STRUCTURE)
        self.regionincl_data = copy.deepcopy(Config.DEFAULT_REGIONINCL_STRUCTURE)
        self.orbat_data = copy.deepcopy(Config.DEFAULT_ORBAT_STRUCTURE)
        self.resources_data = copy.deepcopy(Config.DEFAULT_RESOURCES_STRUCTURE)
        self.worldmarket_data = copy.deepcopy(Config.DEFAULT_WORLDMARKET_STRUCTURE)
        self.scenario_data = {}  # Scenario data

        # Initialize seenSinceLastUpdate flags
        self.seen_since_last_update = {
            'settings': False,
            'regions': False,
            'theaters': False,
            'regionincl': False,
            'orbat': False,
            'resources': False,
            'worldmarket': False,
            'scenario': False
        }

    def create_empty(self):
        # Reset all data to default values from Config
        self.settings_data = copy.deepcopy(Config.DEFAULT_SETTINGS_STRUCTURE)
        self.regions_data = copy.deepcopy(Config.DEFAULT_REGIONS_STRUCTURE)
        self.theaters_data = copy.deepcopy(Config.DEFAULT_THEATERS_STRUCTURE)
        self.regionincl_data = copy.deepcopy(Config.DEFAULT_REGIONINCL_STRUCTURE)
        self.orbat_data = copy.deepcopy(Config.DEFAULT_ORBAT_STRUCTURE)
        self.resources_data = copy.deepcopy(Config.DEFAULT_RESOURCES_STRUCTURE)
        self.worldmarket_data = copy.deepcopy(Config.DEFAULT_WORLDMARKET_STRUCTURE)
        self.scenario_data = {}
        self.original_structure = {}
        self.modified_structure = {}
        self.new_project = True
        self.root_directory = Path('unnamed')
        self.extracted_base_path = Path('unnamed')

        self.seen_since_last_update = {key: False for key in self.seen_since_last_update}

        add_to_log("Created empty project data", LogLevel.INFO)

    def load_data_from_file(self, file_path):
        file_extension = Path(file_path).suffix.lower().lstrip('.')

        # Check if the file extension is supported
        if file_extension not in self.supported_extensions:
            add_to_log(f"Skipping unsupported file type: {file_extension}", LogLevel.WARNING)
            return

        add_to_log(f"Loading data from file: {file_path}", LogLevel.DEBUG)
        if file_extension == 'scenario':
            scenario_file_data = import_scenario_file(file_path)
            self.settings_data = scenario_file_data['settings_data']
            self.scenario_data = scenario_file_data['scenario_data']
            self.seen_since_last_update['settings'] = False
            self.seen_since_last_update['scenario'] = False
            add_to_log(f"Loaded .scenario file: {file_path}", LogLevel.INFO)
        elif file_extension == 'cvp':
            cvp_data = extract_cvp_data(file_path)
            self.regions_data = cvp_data['Regions_Data']
            self.theaters_data = cvp_data['Theaters_Data']
            self.seen_since_last_update['regions'] = False
            self.seen_since_last_update['theaters'] = False
            add_to_log(f"Loaded .cvp file: {file_path}", LogLevel.INFO)
        elif file_extension == 'regionincl':
            # Implement the importer for regionincl files
            self.seen_since_last_update['regionincl'] = False
            pass  # Replace with actual implementation
        elif file_extension == 'oob':
            # Implement the importer for oob files
            self.seen_since_last_update['orbat'] = False
            pass  # Replace with actual implementation
        elif file_extension == 'wmdata':
            # Implement the importer for wmdata files
            self.seen_since_last_update['worldmarket'] = False
            pass  # Replace with actual implementation
        # Add handling for other file types as needed
        else:
            add_to_log(f"No importer available for file type: {file_extension}", LogLevel.WARNING)
        add_to_log(f"Loaded data from {file_path}", LogLevel.DEBUG)

    def get_data(self):
        # Return the current state of data
        data = {
            'settings_data': self.settings_data,
            'regions_data': self.regions_data,
            'theaters_data': self.theaters_data,
            'regionincl_data': self.regionincl_data,
            'orbat_data': self.orbat_data,
            'resources_data': self.resources_data,
            'worldmarket_data': self.worldmarket_data,
            'scenario_data': self.scenario_data
        }
        return data

    def change_value(self, label, new_value):
        # Update the value based on the label
        parts = label.split('.')
        current_data = self
        for part in parts[:-1]:
            if '[' in part and ']' in part:
                attr_name, index = part.split('[')
                index = int(index.rstrip(']'))
                current_data = getattr(current_data, attr_name)
                current_data = current_data[index]
            else:
                current_data = getattr(current_data, part)
        last_part = parts[-1]
        if '[' in last_part and ']' in last_part:
            attr_name, index = last_part.split('[')
            index = int(index.rstrip(']'))
            target_data = getattr(current_data, attr_name)
            target_data[index] = new_value
        else:
            if isinstance(current_data, dict):
                current_data[last_part] = new_value
            else:
                setattr(current_data, last_part, new_value)

        # Set seenSinceLastUpdate flag to False for settings
        if label.startswith('settings_data.'):
            self.seen_since_last_update['settings'] = False
        # Add similar checks for other data types if needed

        add_to_log(f"Changed value of {label} to {new_value}", LogLevel.INFO)

    def export_scenario_file(self, output_file_path):
        """
        Export the scenario data and settings data to a .scenario file.
        """
        add_to_log(f"Exporting scenario file to {output_file_path}", LogLevel.INFO)
        export_scenario_file(self.scenario_data, self.settings_data, output_file_path)
        add_to_log("Scenario file export completed.", LogLevel.INFO)

    def export_cvp_file(self, output_file_path):
        """
        Export the CVP data to a .cvp file.
        """
        add_to_log(f"Exporting CVP file to {output_file_path}", LogLevel.INFO)
        cvp_data = {
            "Theaters_Data": self.theaters_data,
            "Regions_Data": self.regions_data
        }
        export_cvp(cvp_data, output_file_path)
        add_to_log("CVP file export completed.", LogLevel.INFO)

# Global project instance
project = Project()
