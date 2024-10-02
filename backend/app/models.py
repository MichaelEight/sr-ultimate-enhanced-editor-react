# models.py

import copy
from pathlib import Path
from .config import Config
from .utils.logging_utils import add_to_log, LogLevel

from .importers.scenario_importer import import_scenario_file
from .exporters.scenario_exporter import export_scenario_file
from .importers.cvp_importer import extract_cvp_data
from .exporters.cvp_exporter import export_cvp
from .importers.oob_importer import extract_oob_data
from .exporters.oob_exporter import export_oob
from .importers.regionincl_importer import extract_regionincl_data
from .exporters.regionincl_exporter import write_regionincl
from .importers.wmdata_importer import extract_wmdata
from .exporters.wmdata_exporter import write_wmdata

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
        elif file_extension == 'oob':
            orbat_data = extract_oob_data(file_path)
            if "OOB_Data" not in orbat_data:
                orbat_data["OOB_Data"] = []  # Ensure 'OOB_Data' exists
                add_to_log(f"'OOB_Data' missing in {file_path}. Initialized as empty list.", LogLevel.WARNING)
            self.orbat_data = orbat_data
            self.seen_since_last_update['orbat'] = False
            add_to_log(f"Loaded .oob file: {file_path}", LogLevel.INFO)
        elif file_extension == 'regionincl':
            regionincl_data = extract_regionincl_data(file_path)
            self.regionincl_data = regionincl_data
            self.seen_since_last_update['regionincl'] = False
            add_to_log(f"Loaded .regionincl file: {file_path}", LogLevel.INFO)
        elif file_extension == 'wmdata':
            wmdata = extract_wmdata(file_path)
            self.worldmarket_data = wmdata.get('worldmarket', {})
            self.resources_data = wmdata.get('resources', {})
            self.seen_since_last_update['worldmarket'] = False
            add_to_log(f"Loaded .wmdata file: {file_path}", LogLevel.INFO)
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


    def export_orbat_file(self, output_file_path):
        add_to_log(f"Exporting OOB file to {output_file_path}", LogLevel.INFO)
        if not isinstance(self.orbat_data, dict):
            add_to_log(f"Invalid or missing orbat_data: {self.orbat_data}", LogLevel.ERROR)
            raise ValueError("Invalid orbat_data structure.")
        if "OOB_Data" not in self.orbat_data:
            add_to_log("OOB_Data key missing in orbat_data. Initializing as empty list.", LogLevel.WARNING)
            self.orbat_data["OOB_Data"] = []
        export_oob(self.orbat_data, output_file_path)
        add_to_log("OOB file export completed.", LogLevel.INFO)

    def export_regionincl_file(self, output_file_path):
        add_to_log(f"Exporting REGIONINCL file to {output_file_path}", LogLevel.INFO)
        write_regionincl(self.regionincl_data, output_file_path)
        add_to_log("REGIONINCL file export completed.", LogLevel.INFO)

    def export_wmdata_file(self, output_file_path):
        add_to_log(f"Exporting WMData file to {output_file_path}", LogLevel.INFO)
        wmdata = {
            'worldmarket': self.worldmarket_data,
            'resources': self.resources_data
        }
        write_wmdata(wmdata, output_file_path)
        add_to_log("WMData file export completed.", LogLevel.INFO)

# Global project instance
project = Project()
