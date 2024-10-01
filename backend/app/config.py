# config.py

import os

class Config:
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
        'cvp':         {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': 'Maps',        'filename': ""},
        'mapx':        {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': 'Maps',        'filename': ""},
        'oof':         {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': 'Maps',        'filename': ""},
        'regionincl':  {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': 'Maps',        'filename': ""},
        'oob':         {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': 'Maps/ORBATS', 'filename': ""},
        'wmdata':      {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': 'Maps/DATA',   'filename': ""},
        'unit':        {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': 'Maps/DATA',   'filename': "DEFAULT"},
        'pplx':        {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': 'Maps/DATA',   'filename': "DEFAULT"},
        'ttrx':        {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': 'Maps/DATA',   'filename': "DEFAULT"},
        'terx':        {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': 'Maps/DATA',   'filename': "DEFAULT"},
        'newsitems':   {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': 'Maps/DATA',   'filename': "DEFAULT"},
        'prf':         {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': 'Maps/DATA',   'filename': "DEFAULT"},
        'preCache':    {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': 'Maps/DATA',   'filename': ""},
        'postCache':   {'isRequired': False, 'doesExist': False, 'isModified': False, 'dir': 'Maps/DATA',   'filename': ""}
    }

    DEFAULT_SETTINGS_STRUCTURE = {
        # General Info
        'startymd': [2022, 8, 22],  # 'startingDate' in frontend
        'scenarioid': 0,            # 'scenarioId'
        'fastfwddays': 0,           # 'fastForwardDays'
        'defaultregion': 0,         # 'defaultRegion'
        # Difficulties
        'difficulty': [2, 2, 2],    # [military, economic, diplomatic]
        # Victory Conditions
        'gamelength': '',           # 'gameLength'
        'svictorycond': '',         # 'victory'
        'victoryhex': [0, 0],       # 'victoryHexX', 'victoryHexY'
        'victorytech': 0,           # 'victoryTech'
        # Starting Conditions
        'resources': '',            # 'resourcesLevel'
        'initialfunds': '',         # 'initialFunds'
        # AI Settings
        'aistance': '',             # 'globalAIStance'
        'wmduse': '',               # 'nukeEffect'
        'approvaleff': '',          # 'approvalEffect'
        # Graphics Options
        'mapgui': '',               # 'guiLevel'
        'mapsplash': 0,             # 'mapSplash'
        'mapmusic': 0,              # 'mapMusic'
        # Miscellaneous
        'startingyear': 0,          # 'startingYear'
        'techtreedefault': '',      # 'techTreeDefault'
        'regionalallies': '',       # 'regionAllies'
        'regionalaxis': '',         # 'regionAxis'
        'spherenn': '',             # 'sphereNN'
        # Scenario Options (Checkboxes)
        'fixedcapitals': 0,                 # 'fixedCapitals'
        'criticalun': 0,                    # 'criticalUN'
        'allownukes': 0,                    # 'allowNukes'
        'alliedvictory': 0,                 # 'alliedVictory'
        'debtfree': 0,                      # 'noStartingDebt'
        'limitdareffect': 0,                # 'limitDarEffect'
        'limitregionsinscenario': 0,        # 'limitRegionsInScenario'
        'restricttechtrade': 0,             # 'restrictTechTrade'
        'regionequip': 0,                   # 'regionEquip'
        'fastbuild': 0,                     # 'fastBuild'
        'noloypenalty': 0,                  # 'noLoyaltyPenalty'
        'missilenolimit': 0,                # 'missileLimit'
        'reservelimit': 0,                  # 'reserveLimit'
        'grouployaltymerge': 0,             # 'groupLoyaltyMerge'
        'groupresearchmerge': 0,            # 'groupResearchMerge'
        'limitmareffect': 0,                # 'limitMarEffect'
        'nosphere': 0,                      # 'noSphere'
        'campaigngame': 0,                  # 'campaignGame'
        'govchoice': 0,                     # 'govChoice'
        'thirdpartyrelationseffect': 0,     # 'thirdPartyRelationsEffect'

        # Missing values detected
        # [WARNING][scenario_importer - import_scenario_file]: Unknown key in GMC: wminvolve
        # [WARNING][scenario_importer - import_scenario_file]: Unknown key in GMC: wmdeff
        # TODO check their purpose, add them to frontend
        'wminvolve': 0,
        'wmdeff': '',
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
        "agriculture": {
            "producefrom": {
                "agriculture": 0,
                "rubber": 0,
                "timber": 0,
                "petroleum": 0,
                "coal": 0,
                "ore": 0,
                "uranium": 0,
                "electricity": 0,
                "consumergoods": 0,
                "militarygoods": 0,
                "industrialgoods": 0
            }
        },
        "rubber": {
            "producefrom": {
                "agriculture": 0,
                "rubber": 0,
                "timber": 0,
                "petroleum": 0,
                "coal": 0,
                "ore": 0,
                "uranium": 0,
                "electricity": 0,
                "consumergoods": 0,
                "militarygoods": 0,
                "industrialgoods": 0
            }
        },
        "timber": {
            "producefrom": {
                "agriculture": 0,
                "rubber": 0,
                "timber": 0,
                "petroleum": 0,
                "coal": 0,
                "ore": 0,
                "uranium": 0,
                "electricity": 0,
                "consumergoods": 0,
                "militarygoods": 0,
                "industrialgoods": 0
            }
        },
        "petroleum": {
            "producefrom": {
                "agriculture": 0,
                "rubber": 0,
                "timber": 0,
                "petroleum": 0,
                "coal": 0,
                "ore": 0,
                "uranium": 0,
                "electricity": 0,
                "consumergoods": 0,
                "militarygoods": 0,
                "industrialgoods": 0
            }
        },
        "coal": {
            "producefrom": {
                "agriculture": 0,
                "rubber": 0,
                "timber": 0,
                "petroleum": 0,
                "coal": 0,
                "ore": 0,
                "uranium": 0,
                "electricity": 0,
                "consumergoods": 0,
                "militarygoods": 0,
                "industrialgoods": 0
            }
        },
        "ore": {
            "producefrom": {
                "agriculture": 0,
                "rubber": 0,
                "timber": 0,
                "petroleum": 0,
                "coal": 0,
                "ore": 0,
                "uranium": 0,
                "electricity": 0,
                "consumergoods": 0,
                "militarygoods": 0,
                "industrialgoods": 0
            }
        },
        "uranium": {
            "producefrom": {
                "agriculture": 0,
                "rubber": 0,
                "timber": 0,
                "petroleum": 0,
                "coal": 0,
                "ore": 0,
                "uranium": 0,
                "electricity": 0,
                "consumergoods": 0,
                "militarygoods": 0,
                "industrialgoods": 0
            }
        },
        "electricity": {
            "producefrom": {
                "agriculture": 0,
                "rubber": 0,
                "timber": 0,
                "petroleum": 0,
                "coal": 0,
                "ore": 0,
                "uranium": 0,
                "electricity": 0,
                "consumergoods": 0,
                "militarygoods": 0,
                "industrialgoods": 0
            }
        },
        "consumergoods": {
            "producefrom": {
                "agriculture": 0,
                "rubber": 0,
                "timber": 0,
                "petroleum": 0,
                "coal": 0,
                "ore": 0,
                "uranium": 0,
                "electricity": 0,
                "consumergoods": 0,
                "militarygoods": 0,
                "industrialgoods": 0
            }
        },
        "militarygoods": {
            "producefrom": {
                "agriculture": 0,
                "rubber": 0,
                "timber": 0,
                "petroleum": 0,
                "coal": 0,
                "ore": 0,
                "uranium": 0,
                "electricity": 0,
                "consumergoods": 0,
                "militarygoods": 0,
                "industrialgoods": 0
            }
        },
        "industrialgoods": {
            "producefrom": {
                "agriculture": 0,
                "rubber": 0,
                "timber": 0,
                "petroleum": 0,
                "coal": 0,
                "ore": 0,
                "uranium": 0,
                "electricity": 0,
                "consumergoods": 0,
                "militarygoods": 0,
                "industrialgoods": 0
            }
        }
    }

    DEFAULT_WORLDMARKET_STRUCTURE = {
        "battstrdefault": {
            "inf": 0,
            "rec": 0,
            "tank": 0,
            "at": 0,
            "art": 0,
            "aa": 0,
            "trp": 0,
            "helo": 0,
            "miss": 0,
            "int": 0,
            "fig": 0,
            "multi": 0,
            "bomb": 0,
            "rec_air": 0,
            "a-trp": 0,
            "sub": 0,
            "carr": 0,
            "bship": 0,
            "frig": 0,
            "spat": 0,
            "strp": 0,
            "upgrade": 0,
            "unused": 0
        },
        "socialdefaults": {
            "healthcare": 0,
            "education": 0,
            "familysubsidy": 0,
            "lawenforcement": 0,
            "infrastructure": 0,
            "socialassistance": 0,
            "culturalsubsidy": 0,
            "environment": 0
        },
        "hexresmults": {
            "agriculture": 0,
            "rubber": 0,
            "timber": 0,
            "petroleum": 0,
            "coal": 0,
            "ore": 0,
            "uranium": 0,
            "electricity": 0
        },
        "primerate": 1.0,      # Default primerate
        "socadj": 1.0,         # Default social adjustment
        "wmrelrate": 1         # Default world market relation rate
    }