# oob_exporter.py

from ..utils.logging_utils import add_to_log, LogLevel

def write_oob_units(units):
    units_output = ""
    for unit in units:
        unit_str = ", ".join([str(unit[key]) if unit[key] is not None else "" for key in [
            "unitId", "X", "Y", "LocName", "Quantity", "Status", "BattNum", "BattName",
            "Entrench", "Eff", "Exp", "Special", "Str", "MaxStr", "DaysLeft", "Facing",
            "GroupId", "TargetRole", "StatustoBattC", "StatustoBattN"
        ]])
        units_output += f"{unit_str},\n"
    return units_output

def write_oob_region(region):
    region_output = f"&&OOB {region['regionId']}\n"
    region_output += write_oob_units(region["units"])
    return region_output + "\n"

def json_to_oob(oob_data):
    oob_output = "// Generated OOB File\n\n"
    oob_data_list = oob_data.get("OOB_Data", [])
    if not oob_data_list:
        add_to_log("No OOB_Data found. Exporting empty OOB file.", LogLevel.WARNING)
    for region in oob_data_list:
        oob_output += write_oob_region(region)
    return oob_output

def export_oob(oob_data, output_file_path):
    """
    Export the OOB data to the specified output_file_path.

    Args:
        oob_data (dict): The OOB data containing 'OOB_Data'.
        output_file_path (str): The file path where the OOB file will be saved.
    """
    try:
        oob_content = json_to_oob(oob_data)
        with open(output_file_path, 'w') as oob_file:
            oob_file.write(oob_content)
        add_to_log(f"OOB file has been generated at {output_file_path}.", LogLevel.INFO)
    except Exception as e:
        error_message = f"Error exporting OOB file: {e}"
        add_to_log(error_message, LogLevel.ERROR)
        raise
