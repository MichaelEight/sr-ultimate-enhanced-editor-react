// config.js - Frontend configuration with default data structures

export const DEFAULT_PROJECT_FILE_STRUCTURE = {
    'scenario':    { isRequired: true,  doesExist: false, isModified: false, dir: '',            filename: "NewScenario" },
    'sav':         { isRequired: false, doesExist: false, isModified: false, dir: '',            filename: "" },
    'cvp':         { isRequired: false, doesExist: false, isModified: false, dir: 'Maps',        filename: "" },
    'mapx':        { isRequired: false, doesExist: false, isModified: false, dir: 'Maps',        filename: "" },
    'oof':         { isRequired: false, doesExist: false, isModified: false, dir: 'Maps',        filename: "" },
    'regionincl':  { isRequired: false, doesExist: false, isModified: false, dir: 'Maps',        filename: "" },
    'oob':         { isRequired: false, doesExist: false, isModified: false, dir: 'Maps/ORBATS', filename: "" },
    'wmdata':      { isRequired: false, doesExist: false, isModified: false, dir: 'Maps/DATA',   filename: "" },
    'unit':        { isRequired: false, doesExist: false, isModified: false, dir: 'Maps/DATA',   filename: "DEFAULT" },
    'pplx':        { isRequired: false, doesExist: false, isModified: false, dir: 'Maps/DATA',   filename: "DEFAULT" },
    'ttrx':        { isRequired: false, doesExist: false, isModified: false, dir: 'Maps/DATA',   filename: "DEFAULT" },
    'terx':        { isRequired: false, doesExist: false, isModified: false, dir: 'Maps/DATA',   filename: "DEFAULT" },
    'newsitems':   { isRequired: false, doesExist: false, isModified: false, dir: 'Maps/DATA',   filename: "DEFAULT" },
    'prf':         { isRequired: false, doesExist: false, isModified: false, dir: 'Maps/DATA',   filename: "DEFAULT" },
    'preCache':    { isRequired: false, doesExist: false, isModified: false, dir: 'Maps/DATA',   filename: "" },
    'postCache':   { isRequired: false, doesExist: false, isModified: false, dir: 'Maps/DATA',   filename: "" }
};

export const DEFAULT_SETTINGS_STRUCTURE = {
    // General Info
    'startymd': [2022, 8, 22],
    'scenarioid': 0,
    'fastfwddays': 0,
    'defaultregion': 0,
    // Difficulties
    'difficulty': [2, 2, 2],
    // Victory Conditions
    'gamelength': '',
    'svictorycond': '',
    'victoryhex': [0, 0],
    'victorytech': 0,
    // Starting Conditions
    'resources': '',
    'initialfunds': '',
    // AI Settings
    'aistance': '',
    'wmduse': '',
    'approvaleff': '',
    // Graphics Options
    'mapgui': '',
    'mapsplash': 0,
    'mapmusic': 0,
    // Miscellaneous
    'startingyear': 0,
    'techtreedefault': '',
    'regionalallies': '',
    'regionalaxis': '',
    'spherenn': '',
    // Scenario Options (Checkboxes)
    'fixedcapitals': 0,
    'criticalun': 0,
    'allownukes': 0,
    'alliedvictory': 0,
    'debtfree': 0,
    'limitdareffect': 0,
    'limitregionsinscenario': 0,
    'restricttechtrade': 0,
    'regionequip': 0,
    'fastbuild': 0,
    'noloypenalty': 0,
    'missilenolimit': 0,
    'reservelimit': 0,
    'grouployaltymerge': 0,
    'groupresearchmerge': 0,
    'limitmareffect': 0,
    'nosphere': 0,
    'campaigngame': 0,
    'govchoice': 0,
    'thirdpartyrelationseffect': 0,
    'wminvolve': 0,
    'wmdeff': ''
};

export const DEFAULT_THEATERS_STRUCTURE = [];

export const DEFAULT_REGIONS_STRUCTURE = [];

export const DEFAULT_REGIONINCL_STRUCTURE = {
    'regions': {}
};

export const DEFAULT_ORBAT_STRUCTURE = {
    'OOB_Data': []
};

export const DEFAULT_RESOURCES_STRUCTURE = {
    "agriculture": {
        "producefrom": {
            "agriculture": 0, "rubber": 0, "timber": 0, "petroleum": 0, "coal": 0, "ore": 0,
            "uranium": 0, "electricity": 0, "consumergoods": 0, "militarygoods": 0, "industrialgoods": 0
        }
    },
    "rubber": {
        "producefrom": {
            "agriculture": 0, "rubber": 0, "timber": 0, "petroleum": 0, "coal": 0, "ore": 0,
            "uranium": 0, "electricity": 0, "consumergoods": 0, "militarygoods": 0, "industrialgoods": 0
        }
    },
    "timber": {
        "producefrom": {
            "agriculture": 0, "rubber": 0, "timber": 0, "petroleum": 0, "coal": 0, "ore": 0,
            "uranium": 0, "electricity": 0, "consumergoods": 0, "militarygoods": 0, "industrialgoods": 0
        }
    },
    "petroleum": {
        "producefrom": {
            "agriculture": 0, "rubber": 0, "timber": 0, "petroleum": 0, "coal": 0, "ore": 0,
            "uranium": 0, "electricity": 0, "consumergoods": 0, "militarygoods": 0, "industrialgoods": 0
        }
    },
    "coal": {
        "producefrom": {
            "agriculture": 0, "rubber": 0, "timber": 0, "petroleum": 0, "coal": 0, "ore": 0,
            "uranium": 0, "electricity": 0, "consumergoods": 0, "militarygoods": 0, "industrialgoods": 0
        }
    },
    "ore": {
        "producefrom": {
            "agriculture": 0, "rubber": 0, "timber": 0, "petroleum": 0, "coal": 0, "ore": 0,
            "uranium": 0, "electricity": 0, "consumergoods": 0, "militarygoods": 0, "industrialgoods": 0
        }
    },
    "uranium": {
        "producefrom": {
            "agriculture": 0, "rubber": 0, "timber": 0, "petroleum": 0, "coal": 0, "ore": 0,
            "uranium": 0, "electricity": 0, "consumergoods": 0, "militarygoods": 0, "industrialgoods": 0
        }
    },
    "electricity": {
        "producefrom": {
            "agriculture": 0, "rubber": 0, "timber": 0, "petroleum": 0, "coal": 0, "ore": 0,
            "uranium": 0, "electricity": 0, "consumergoods": 0, "militarygoods": 0, "industrialgoods": 0
        }
    },
    "consumergoods": {
        "producefrom": {
            "agriculture": 0, "rubber": 0, "timber": 0, "petroleum": 0, "coal": 0, "ore": 0,
            "uranium": 0, "electricity": 0, "consumergoods": 0, "militarygoods": 0, "industrialgoods": 0
        }
    },
    "militarygoods": {
        "producefrom": {
            "agriculture": 0, "rubber": 0, "timber": 0, "petroleum": 0, "coal": 0, "ore": 0,
            "uranium": 0, "electricity": 0, "consumergoods": 0, "militarygoods": 0, "industrialgoods": 0
        }
    },
    "industrialgoods": {
        "producefrom": {
            "agriculture": 0, "rubber": 0, "timber": 0, "petroleum": 0, "coal": 0, "ore": 0,
            "uranium": 0, "electricity": 0, "consumergoods": 0, "militarygoods": 0, "industrialgoods": 0
        }
    }
};

export const DEFAULT_WORLDMARKET_STRUCTURE = {
    "battstrdefault": {
        "inf": 0, "rec": 0, "tank": 0, "at": 0, "art": 0, "aa": 0, "trp": 0, "helo": 0,
        "miss": 0, "int": 0, "fig": 0, "multi": 0, "bomb": 0, "rec_air": 0, "a-trp": 0,
        "sub": 0, "carr": 0, "bship": 0, "frig": 0, "spat": 0, "strp": 0, "upgrade": 0, "unused": 0
    },
    "socialdefaults": {
        "healthcare": 0, "education": 0, "familysubsidy": 0, "lawenforcement": 0,
        "infrastructure": 0, "socialassistance": 0, "culturalsubsidy": 0, "environment": 0
    },
    "hexresmults": {
        "agriculture": 0, "rubber": 0, "timber": 0, "petroleum": 0,
        "coal": 0, "ore": 0, "uranium": 0, "electricity": 0
    },
    "primerate": 1.0,
    "socadj": 1.0,
    "wmrelrate": 1
};

export const SUPPORTED_EXTENSIONS = ['scenario', 'cvp', 'wmdata', 'oof', 'oob', 'regionincl'];
