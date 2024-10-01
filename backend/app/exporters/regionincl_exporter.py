# regionincl_exporter.py

from ..utils.logging_utils import add_to_log, LogLevel

def write_regionincl(json_data, output_file_path):
    regionincl_output = "// Generated REGIONINCL File\n\n&&REGIONINCL\n"
    
    for region in json_data["regions"]:
        if region["isActive"]:
            # Active region
            if region["comment"]:
                regionincl_output += f"{region['regionId']}    //    {region['comment']}\n"
            else:
                regionincl_output += f"{region['regionId']}\n"
        else:
            # Inactive region
            if region["comment"]:
                regionincl_output += f"// {region['regionId']}    //    {region['comment']}\n"
            else:
                regionincl_output += f"// {region['regionId']}\n"
    
    try:
        with open(output_file_path, 'w') as file:
            file.write(regionincl_output)
        add_to_log(f"REGIONINCL file saved as '{output_file_path}'.", LogLevel.INFO)
    except Exception as e:
        add_to_log(f"Error exporting REGIONINCL file: {e}", LogLevel.ERROR)
        raise
