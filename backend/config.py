# config.py
import os

LOGGING_LEVEL = 'trace'

UPLOAD_FOLDER = 'uploads'
EXTRACT_FOLDER = 'extracted'
EXPORT_FOLDER = 'exported'

DEFAULT_PROJECT_FILE_STRUCTURE = {
    'scenario':    {'isRequired': True,  'doesExist': False, 'isModified': False, 'dir': '\\',               'filename': ""},
    'sav':         {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': '\\',               'filename': ""},
    'cvp':         {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': '\\maps\\',         'filename': ""},
    'mapx':        {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': '\\maps\\',         'filename': ""},
    'oof':         {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': '\\maps\\',         'filename': ""},
    'regionincl':  {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': '\\maps\\',         'filename': ""},
    'oob':         {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': '\\maps\\orbats\\', 'filename': ""},
    'wmdata':      {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': '\\maps\\data\\',   'filename': ""},
    'unit':        {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': '\\maps\\data\\',   'filename': ""},
    'pplx':        {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': '\\maps\\data\\',   'filename': ""},
    'ttrx':        {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': '\\maps\\data\\',   'filename': ""},
    'terx':        {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': '\\maps\\data\\',   'filename': ""},
    'newsitems':   {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': '\\maps\\data\\',   'filename': ""},
    'prf':         {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': '\\maps\\data\\',   'filename': ""},
    'preCache':    {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': '\\maps\\data\\',   'filename': ""},
    'postCache':   {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': '\\maps\\data\\',   'filename': ""}
}

for folder in [UPLOAD_FOLDER, EXTRACT_FOLDER, EXPORT_FOLDER]:
    if not os.path.exists(folder):
        os.makedirs(folder)

DEFAULT_SETTINGS_STRUCTURE = {
    'startingDate': [2020, 1, 1], # Format: YYYY, MM, DD
    'fastForward': False,
    'militaryDifficulty': 0,
    'economicDifficulty': 0,
    'diplomaticDifficulty': 0
    # ...
}