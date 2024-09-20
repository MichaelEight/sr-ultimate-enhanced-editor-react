from pathlib import Path
import shutil
import zipfile
import io

from ..utils.logging_utils import add_to_log, LogLevel
from ..config import Config
from ..models import project

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
