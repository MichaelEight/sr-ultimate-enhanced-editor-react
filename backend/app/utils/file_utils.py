# file_utils.py

from pathlib import Path
import shutil
import zipfile
import io

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
            else:
                parts = parts
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


def create_zip_archive(directory_path):
    """
    Create a zip archive of the specified directory and return it as an in-memory file-like object.

    Args:
        directory_path (str or Path): The path to the directory to zip.

    Returns:
        BytesIO: A file-like object containing the zip archive.
    """
    try:
        directory_path = Path(directory_path)
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for file_path in directory_path.rglob('*'):
                zip_file.write(
                    file_path,
                    arcname=file_path.relative_to(directory_path.parent)
                )
        zip_buffer.seek(0)
        add_to_log(f"Created zip archive for directory: {directory_path}", LogLevel.INFO)
        return zip_buffer
    except Exception as e:
        add_to_log(f"Error creating zip archive: {e}", LogLevel.ERROR)
        raise
