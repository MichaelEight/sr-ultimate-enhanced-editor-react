from pathlib import Path
from .config import Config
from .utils.logging_utils import add_to_log, LogLevel

class Project:
    def __init__(self):
        self.original_structure = {}
        self.modified_structure = {}
        self.new_project = True
        self.root_directory = Path('unnamed')
        self.extracted_base_path = Path('unnamed')
        self.settings_data = Config.DEFAULT_SETTINGS_STRUCTURE.copy()

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
