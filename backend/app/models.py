from pathlib import Path
from .config import Config
from .utils.logging_utils import add_to_log, LogLevel

from .importers.scenario_importer import extract_scenario_file_data
from .importers.cvp_importer import extract_cvp_data
class Project:
    def __init__(self):
        self.original_structure = {}
        self.modified_structure = {}
        self.new_project = True
        self.root_directory = Path('unnamed')
        self.extracted_base_path = Path('unnamed')
        self.supported_extensions = ['scenario', 'cvp', 'wmdata', 'oof', 'oob', 'regionincl']

        # Initialize data attributes with default structures
        self.settings_data = Config.DEFAULT_SETTINGS_STRUCTURE.copy()
        self.regions_data = Config.DEFAULT_REGIONS_STRUCTURE.copy()
        self.theaters_data = Config.DEFAULT_THEATERS_STRUCTURE.copy()
        self.regionincl_data = Config.DEFAULT_REGIONINCL_STRUCTURE.copy()
        self.orbat_data = Config.DEFAULT_ORBAT_STRUCTURE.copy()
        self.resources_data = Config.DEFAULT_RESOURCES_STRUCTURE.copy()
        self.worldmarket_data = Config.DEFAULT_WORLDMARKET_STRUCTURE.copy()
        self.scenario_data = {}  # Assuming scenario_data is a separate attribute

    def create_empty(self):
        # Reset all data to default values from Config
        self.settings_data = Config.DEFAULT_SETTINGS_STRUCTURE.copy()
        self.regions_data = Config.DEFAULT_REGIONS_STRUCTURE.copy()
        self.theaters_data = Config.DEFAULT_THEATERS_STRUCTURE.copy()
        self.regionincl_data = Config.DEFAULT_REGIONINCL_STRUCTURE.copy()
        self.orbat_data = Config.DEFAULT_ORBAT_STRUCTURE.copy()
        self.resources_data = Config.DEFAULT_RESOURCES_STRUCTURE.copy()
        self.worldmarket_data = Config.DEFAULT_WORLDMARKET_STRUCTURE.copy()
        self.scenario_data = {}
        self.original_structure = {}
        self.modified_structure = {}
        self.new_project = True
        self.root_directory = Path('unnamed')
        self.extracted_base_path = Path('unnamed')
        add_to_log("Created empty project data", LogLevel.INFO)

    def load_data_from_file(self, file_path):
        file_extension = Path(file_path).suffix.lower().lstrip('.')

        # Check if the file extension is supported
        if file_extension not in self.supported_extensions:
            add_to_log(f"Skipping unsupported file type: {file_extension}", LogLevel.WARNING)
            return

        add_to_log(f"Loading data from file: {file_path}", LogLevel.DEBUG)
        if file_extension == 'scenario':
            scenario_file_data = extract_scenario_file_data(file_path)
            self.settings_data = scenario_file_data['settings_data']
            self.scenario_data = scenario_file_data['scenario_data']
            add_to_log(f"Loaded .scenario file: {file_path}", LogLevel.INFO)
        elif file_extension == 'cvp':
            cvp_data = extract_cvp_data(file_path)
            self.regions_data = cvp_data['Regions_Data']
            self.theaters_data = cvp_data['Theaters_Data']
            add_to_log(f"Loaded .cvp file: {file_path}", LogLevel.INFO)
        elif file_extension == 'regionincl':
            # Implement the importer for regionincl files
            pass  # Replace with actual implementation
        elif file_extension == 'oob':
            # Implement the importer for oob files
            pass  # Replace with actual implementation
        elif file_extension == 'wmdata':
            # Implement the importer for wmdata files
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
        add_to_log(f"Changed value of {label} to {new_value}", LogLevel.INFO)

# Global project instance
project = Project()


def create_empty_structure():
    project.original_structure = {}
    project.modified_structure = {}
    for ext, info in Config.DEFAULT_PROJECT_FILE_STRUCTURE.items():
        project.modified_structure[ext] = info.copy()
    project.new_project = True
    project.root_directory = Path('unnamed')
    project.extracted_base_path = Path('unnamed')
    add_to_log("Created empty (default) project structure", LogLevel.INFO)
