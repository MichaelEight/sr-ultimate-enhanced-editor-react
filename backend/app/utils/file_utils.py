# file_utils.py

from pathlib import Path
import shutil
import zipfile
import io
import os

from ..utils.logging_utils import add_to_log, LogLevel
from ..config import Config
from ..models import project

def extract_archive(zip_file_path: str, extract_to_path: str):
    add_to_log(f"Starting extraction of '{zip_file_path}' to '{extract_to_path}'", LogLevel.INFO)
    with zipfile.ZipFile(zip_file_path, 'r') as zip_ref:
        for member in zip_ref.namelist():
            if member.endswith('/'):
                continue
            member_path = Path(member)
            parts = member_path.parts
            if len(parts) > 1:
                parts = parts[1:]
            # else:
            #     parts = parts
            target_path = Path(extract_to_path).joinpath(*parts)
            target_path.parent.mkdir(parents=True, exist_ok=True)
            with zip_ref.open(member) as source_file, open(target_path, 'wb') as target_file:
                shutil.copyfileobj(source_file, target_file)
            add_to_log(f"Extracted '{member}' to '{target_path}'", LogLevel.TRACE)
    add_to_log(f"Extraction completed for '{zip_file_path}'", LogLevel.INFO)

def copy_file(source: Path, destination: Path) -> bool:
    try:
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy(str(source), str(destination))
        add_to_log(f"Copied file from {source} to {destination}", LogLevel.INFO)
        return True
    except FileNotFoundError:
        add_to_log(f"File not found: {source}", LogLevel.ERROR)
        return False
    except Exception as e:
        add_to_log(f"Error copying file from {source} to {destination}: {e}", LogLevel.ERROR)
        return False

def create_zip_archive_with_scenario(project_dir, scenario_file_path):
    """
    Create a zip archive containing the scenario file and the project directory.

    Args:
        project_dir (Path): The path to the project directory to include in the zip.
        scenario_file_path (Path): The path to the scenario file to include in the zip.

    Returns:
        io.BytesIO: A buffer containing the zip archive data.
    """
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        # Add the scenario file at the root of the zip
        zip_file.write(scenario_file_path, arcname=scenario_file_path.name)

        # Add the project directory and its contents
        for root, dirs, files in os.walk(project_dir):
            for file in files:
                file_path = Path(root) / file
                arcname = file_path.relative_to(project_dir.parent)
                zip_file.write(file_path, arcname=str(arcname))

    zip_buffer.seek(0)
    return zip_buffer