# project_services.py

from pathlib import Path

from ..utils.file_utils import copy_file
from ..utils.logging_utils import add_to_log, LogLevel
from ..config import Config
from ..models import project

EXTRACTS_PATH = Path(Config.EXTRACT_FOLDER)

def process_file_for_export(ext, file_info, export_base_dir):
    """
    Process the given file for export.

    Args:
        ext (str): The file extension (without dot).
        file_info (dict): Information about the file.
        export_base_dir (Path): The base directory for the export.
    """

    if ext == 'wmdata':
            # FIXME temp check, remove later
            # Skip processing here since it's handled separately
            return
    source_filename = f"{file_info['filename']}.{ext.upper()}"
    dest_filename = f"{file_info['filename']}.{ext.upper()}"

    # Build source and destination paths
    source_dir = project.extracted_base_path / file_info.get('dir', '')
    source_path = EXTRACTS_PATH / source_dir / source_filename

    dest_dir = export_base_dir / file_info.get('dir', '')
    dest_path = dest_dir / dest_filename

    add_to_log(f"Processing {ext} file from {source_path} to {dest_path}", LogLevel.DEBUG)

    if file_info['doesExist']:
        # Copy existing file
        success = copy_file(source_path, dest_path)
        if success:
            add_to_log(f"Copied file from {source_path} to {dest_path}", LogLevel.INFO)
    else:
        # Handle cases where the file does not exist or has been modified
        # For now, just create an empty file or handle accordingly
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        dest_path.touch()
        add_to_log(f"Created new or modified file: {dest_path}", LogLevel.INFO)

