import os

class Config:
    #LOGGING_LEVEL = 'trace' # DEPRECATED

    UPLOAD_FOLDER = 'uploaded'
    EXTRACT_FOLDER = 'extracted'
    EXPORT_FOLDER = 'exported'

    # Ensure necessary directories exist
    for folder in [UPLOAD_FOLDER, EXTRACT_FOLDER, EXPORT_FOLDER, 'logs']:
        if not os.path.exists(folder):
            os.makedirs(folder)

    DEFAULT_PROJECT_FILE_STRUCTURE = {
        'scenario':    {'isRequired': True,  'doesExist': False, 'isModified': False, 'dir': '',            'filename': "NewScenario"},
        'sav':         {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': '',            'filename': ""},
        'cvp':         {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': 'maps',        'filename': ""},
        'mapx':        {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': 'maps',        'filename': ""},
        'oof':         {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': 'maps',        'filename': ""},
        'regionincl':  {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': 'maps',        'filename': ""},
        'oob':         {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': 'maps/orbats', 'filename': ""},
        'wmdata':      {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': 'maps/data',   'filename': ""},
        'unit':        {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': 'maps/data',   'filename': "DEFAULT"},
        'pplx':        {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': 'maps/data',   'filename': "DEFAULT"},
        'ttrx':        {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': 'maps/data',   'filename': "DEFAULT"},
        'terx':        {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': 'maps/data',   'filename': "DEFAULT"},
        'newsitems':   {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': 'maps/data',   'filename': "DEFAULT"},
        'prf':         {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': 'maps/data',   'filename': "DEFAULT"},
        'preCache':    {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': 'maps/data',   'filename': ""},
        'postCache':   {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': 'maps/data',   'filename': ""}
    }

    # TODO Check for missing properties
    DEFAULT_SETTINGS_STRUCTURE = {
        'startymd': [2022, 8, 22],  # Format: [YYYY, MM, DD]
        'defaultregion': None, 
        'difficulty': [2, 2, 2],  # [military, economic, diplomatic]
        'resources': 2,
        'initialfunds': 2,
        'aistance': 0,
        'limitdareffect': 0,
        'limitmareffect': 0,
        'reservelimit': 0,
        'missilenolimit': 0,
        'wminvolve': 0,
        'wmduse': 0,
        'grouployaltymerge': 0,
        'groupresearchmerge': 0,
        'alliedvictory': 0,
        'debtfree': 1,
        'noloypenalty': 0,
        'mapgui': 2,
        'approvaleff': 0,
        'wmdeff': 2,
        'svictorycond': 0,
        'victoryhex': [],  # Empty list, can be filled as needed
        'gamelength': 0,
        'fastfwddays': 0,
        'mapsplash': 0
    }

    DEFAULT_THEATERS_STRUCTURE = {
        'theaters': {}
    }

    DEFAULT_REGIONS_STRUCTURE = {
        'regions': {}
    }

    DEFAULT_REGIONINCL_STRUCTURE = {
        'regions': {}
    }

    DEFAULT_ORBAT_STRUCTURE = {
        'regions': {}
    }
    
    DEFAULT_RESOURCES_STRUCTURE = {
        # TODO
    }

    DEFAULT_WORLDMARKET_STRUCTURE = {
        # TODO
    }
    
    

