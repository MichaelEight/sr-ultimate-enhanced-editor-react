# backend/utils.py
import zipfile
import rarfile
import os

def extract_archive(file_path, extract_path):
    if file_path.endswith('.zip'):
        with zipfile.ZipFile(file_path, 'r') as zip_ref:
            zip_ref.extractall(extract_path)
    elif file_path.endswith('.rar'):
        with rarfile.RarFile(file_path, 'r') as rar_ref:
            rar_ref.extractall(extract_path)
    else:
        raise ValueError("Unsupported archive format")

def find_scenario_file(extract_path):
    for root, _, files in os.walk(extract_path):
        for file in files:
            if file.endswith('.SCENARIO'):
                return os.path.splitext(file)[0], root
    raise ValueError("No .SCENARIO file found")
