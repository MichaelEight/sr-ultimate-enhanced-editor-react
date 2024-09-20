from pathlib import Path

from ..utils.file_utils import copy_file
from ..utils.logging_utils import add_to_log, LogLevel
from ..config import Config
from ..models import project

def process_file_for_export(ext, file_info):
    modified_filename = file_info['filename']
    is_required = file_info['isRequired']
    does_exist = file_info.get('doesExist', False)
    is_modified = file_info.get('isModified', False)
    modified_dir_path = Path(file_info.get('dir', ''))

    if not modified_filename or not is_required:
        add_to_log(f"Skipping file: {modified_filename}.{ext} (Not required or filename empty)", LogLevel.INFO)
        return

    original_file_info = project.original_structure.get(ext, {})
    original_filename = original_file_info.get('filename', modified_filename)
    original_dir_path = Path(original_file_info.get('dir', modified_dir_path))

    extracted_base_dir = Path(Config.EXTRACT_FOLDER) / project.extracted_base_path
    exported_base_dir = Path(Config.EXPORT_FOLDER) / project.extracted_base_path

    if ext == 'scenario':
        extracted_file_path = extracted_base_dir / f"{original_filename}.{ext}"
        exported_file_path = Path(Config.EXPORT_FOLDER) / f"{modified_filename}.{ext}"
    else:
        extracted_file_path = extracted_base_dir / original_dir_path / f"{original_filename}.{ext}"
        exported_file_path = exported_base_dir / modified_dir_path / f"{modified_filename}.{ext}"

    add_to_log(f"Processing {ext} file from {extracted_file_path} to {exported_file_path}", LogLevel.DEBUG)

    if does_exist and not is_modified:
        success = copy_file(extracted_file_path, exported_file_path)
        if not success:
            add_to_log(f"Failed to copy file: {extracted_file_path} to {exported_file_path}", LogLevel.ERROR)
    else:
        try:
            exported_file_path.parent.mkdir(parents=True, exist_ok=True)
            with open(exported_file_path, 'w') as f:
                f.write(f"Placeholder content for {modified_filename}.{ext}")
            add_to_log(f"Created new or modified file: {exported_file_path}", LogLevel.INFO)
        except Exception as e:
            add_to_log(f"Error creating file: {exported_file_path}. Error: {e}", LogLevel.ERROR)
