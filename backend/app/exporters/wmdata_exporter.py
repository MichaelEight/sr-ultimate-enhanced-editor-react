# wmdata_exporter.py

from ..utils.logging_utils import add_to_log, LogLevel

# Reverse dictionary for mapping resources to their IDs
RESOURCE_TO_ID = {v: k for k, v in {
    0: "agriculture",
    1: "rubber",
    2: "timber",
    3: "petroleum",
    4: "coal",
    5: "ore",
    6: "uranium",
    7: "electricity",
    8: "consumergoods",
    9: "militarygoods",
    10: "industrialgoods"
}.items()}

# Dictionary for resource production mappings
ID_TO_RESOURCE = {
    0: "agriculture",
    1: "rubber",
    2: "timber",
    3: "petroleum",
    4: "coal",
    5: "ore",
    6: "uranium",
    7: "electricity",
    8: "consumergoods",
    9: "militarygoods",
    10: "industrialgoods"
}

# Specific labels for world market data
BATTSTRDEFAULT_LABELS = [
    "inf", "rec", "tank", "at", "art", "aa", "trp", "helo", "miss", "int",
    "fig", "multi", "bomb", "rec_air", "a-trp", "sub", "carr", "bship", "frig", 
    "spat", "strp", "upgrade", "unused"
]

SOCIALDEFAULTS_LABELS = [
    "healthcare", "education", "familysubsidy", "lawenforcement",
    "infrastructure", "socialassistance", "culturalsubsidy", "environment"
]

HEXRESMULTS_LABELS = [
    "agriculture", "rubber", "timber", "petroleum", "coal", "ore", "uranium", "electricity"
]

def remove_trailing_nulls(lst):
    """Remove trailing nulls from a list."""
    while lst and lst[-1] is None:
        lst.pop()
    return lst

def write_wmdata(json_data, output_file_path):
    """Writes the JSON data back to the .wmdata format."""
    wmdata_output = "// Generated WMDATA File\n\n&&WMDATA 0\n"

    # Writing worldmarket data
    worldmarket = json_data.get("worldmarket", {})
    settings = worldmarket.get("settings", {})
    military = worldmarket.get("military", {})
    economic = worldmarket.get("economic", {})
    weather = worldmarket.get("weather", {})

    # Write settings
    # Ensure the order matches the uploaded data
    settings_order = ["dayswmlevel", "wmlevel", "gdpcbase", "primerate", "socadj", "wmrelrate"]
    for key in settings_order:
        value = settings.get(key)
        if value is not None:
            wmdata_output += f"{key}, {value},\n"

    # Write military
    if "unitgarrison" in military:
        unitgarrison = military["unitgarrison"]
        value_str = ", ".join(str(v) for v in unitgarrison) + ","
        wmdata_output += f"unitgarrison, {value_str}\n"
    if "battstrdefault" in military:
        battstrdefault = military["battstrdefault"]
        value_str = ",\t".join(str(battstrdefault.get(label, "")) for label in BATTSTRDEFAULT_LABELS) + ","
        wmdata_output += f"battstrdefault, {value_str}\n"

    # Write economic
    if "hexresmults" in economic:
        hexresmults = economic["hexresmults"]
        value_str = ", ".join(str(hexresmults.get(label, 0)) for label in HEXRESMULTS_LABELS) + ","
        wmdata_output += f"hexresmults, {value_str}\n"
    if "socialdefaults" in economic:
        socialdefaults = economic["socialdefaults"]
        value_str = ", ".join(str(socialdefaults.get(label, 0)) for label in SOCIALDEFAULTS_LABELS) + ","
        wmdata_output += f"socialdefaults, {value_str}\n"

    # Write weather
    # Ensure the order matches the uploaded data
    weather_order = ["weatheryear", "weatheroffy", "weatherspeed", "days"]
    for key in weather_order:
        value = weather.get(key)
        if value is not None:
            if isinstance(value, list):
                value_str = ", ".join(str(v) for v in value) + ","
                wmdata_output += f"{key}, {value_str}\n"
            else:
                wmdata_output += f"{key}, {value},\n"

    wmdata_output += "&&END\n\n"

    # Writing resource production data
    resources = json_data.get("resources", {})
    for resource, details in resources.items():
        resource_id = RESOURCE_TO_ID.get(resource)
        if resource_id is not None:
            wmdata_output += f"&&WMPRODDATA, {resource_id}\n"
            # Write producefrom first to match uploaded format
            if "producefrom" in details:
                producefrom = details["producefrom"]
                value_str = ", ".join(str(producefrom.get(label, 0)) for label in ID_TO_RESOURCE.values()) + ","
                wmdata_output += f"producefrom, {value_str}\n"
            # Write cost
            cost = details.get("cost", {})
            cost_order = ["wmbasecost", "wmfullcost", "wmmargin"]
            for key in cost_order:
                value = cost.get(key)
                if value is not None:
                    wmdata_output += f"{key}, {value},\n"
            # Write production
            production = details.get("production", {})
            production_order = ["wmprodperpersonmax", "wmprodperpersonmin", "wmurbanproduction", "nodeproduction"]
            for key in production_order:
                value = production.get(key)
                if value is not None:
                    wmdata_output += f"{key}, {value},\n"
            wmdata_output += "&&END\n\n"
        else:
            add_to_log(f"Unknown resource: {resource}", LogLevel.WARNING)

    try:
        with open(output_file_path, 'w') as file:
            file.write(wmdata_output)
        add_to_log(f"WMDATA file saved as '{output_file_path}'.", LogLevel.INFO)
    except Exception as e:
        add_to_log(f"Error exporting WMDATA file: {e}", LogLevel.ERROR)
        raise
