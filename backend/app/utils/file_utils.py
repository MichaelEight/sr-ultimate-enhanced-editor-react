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

def create_zip_archive():
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        scenario_file_path = Path(Config.EXPORT_FOLDER) / f"{project.modified_structure['scenario']['filename']}.scenario"
        if scenario_file_path.exists():
            arcname = scenario_file_path.name
            zip_file.write(scenario_file_path, arcname)
            add_to_log(f"Added scenario file to ZIP: {scenario_file_path}", LogLevel.DEBUG)
        else:
            add_to_log(f"Scenario file not found: {scenario_file_path}", LogLevel.ERROR)
        export_base_dir = Path(Config.EXPORT_FOLDER) / project.extracted_base_path
        for file_path in export_base_dir.rglob('*'):
            if file_path.is_file():
                arcname = file_path.relative_to(Path(Config.EXPORT_FOLDER)).as_posix()
                zip_file.write(file_path, arcname)
                add_to_log(f"Added file to ZIP: {file_path}", LogLevel.DEBUG)
    zip_buffer.seek(0)
    return zip_buffer
