# config.py
import os

UPLOAD_FOLDER = 'uploads'
EXTRACT_FOLDER = 'extracted'
EXPORT_FOLDER = 'exported'

for folder in [UPLOAD_FOLDER, EXTRACT_FOLDER, EXPORT_FOLDER]:
    if not os.path.exists(folder):
        os.makedirs(folder)
