# cvp_exporter.py

import json
from ..utils.logging_utils import add_to_log, LogLevel
from ..config import Config  # Adjust the relative import based on your project structure

def write_theaters(theaters_data):
    # Writing the &&THEATRES section
    theatres_output = "&&THEATRES\n"
    for theatre_id, theatre in theaters_data.items():
        theatres_output += f"{theatre_id}, {theatre['theatreName']}, {theatre['theatreCode']}, {theatre['culture']}, {theatre['xLocation']}, {theatre['yLocation']},\n"

    # Writing the &&THEATRETRANSF section
    theatres_output += "\n&&THEATRETRANSF\n"
    for theatre_id, theatre in theaters_data.items():
        transfer_str = ", ".join(map(str, theatre.get("transfers", [])))
        theatres_output += f"{theatre_id}, {transfer_str}                               // \"{theatre['theatreName']}\", \"{theatre['theatreCode']}\"\n"
    
    theatres_output += "&&END\n\n"
    return theatres_output

def write_region_properties(properties):
    output = ""
    for key, value in properties.items():
        if isinstance(value, list):
            # Write arrays like "influence" or "altregionname"
            value_str = ", ".join([str(x) if x is not None else "" for x in value])
            output += f"{key}\t\t\t\t{value_str}\n"
        else:
            # Handle regular properties
            if value is None:
                output += f"{key}\n"
            elif isinstance(value, str) and value.startswith("0x"):
                output += f"{key}\t\t\t\t{value}\n"
            elif isinstance(value, (int, float)):
                if int(value) == value:
                    output += f"{key}\t\t\t\t{int(value)}\n"
                else:
                    output += f"{key}\t\t\t\t{value}\n"
            else:
                output += f"{key}\t\t\t\t{value}\n"
    return output

def write_grouping(grouping):
    if grouping:
        grouping_str = ",\n".join(map(str, grouping)) + ",\n"
        return f"&&GROUPING\t\t\t\t{grouping[0]}\n{grouping_str}\n"
    return "&&GROUPING\t\t\t\t0\n\n"

def write_regiontechs(regiontechs):
    if regiontechs:
        regiontechs_str = ",\n".join(map(str, regiontechs)) + ",\n"
        return f"&&REGIONTECHS\t\t\t{regiontechs[0]}\n{regiontechs_str}\n"
    return "&&REGIONTECHS\t\t\t0\n\n"

def write_regionunitdesigns(regionunitdesigns):
    if regionunitdesigns:
        regionunitdesigns_str = ",\n".join(map(str, regionunitdesigns)) + ",\n"
        return f"&&REGIONUNITDESIGNS\t{regionunitdesigns[0]}\n{regionunitdesigns_str}\n"
    return "&&REGIONUNITDESIGNS\t0\n\n"

def write_regionproducts(regionproducts):
    if regionproducts:
        products_output = "&&REGIONPRODUCTS\t\t0\n"
        for product in regionproducts:
            product_str = ", ".join([str(x) if x is not None else "" for x in product])
            products_output += f"{product_str},\n"
        return products_output + "\n"
    return "&&REGIONPRODUCTS\t\t0\n\n"

def write_regionsocials(regionsocials):
    if regionsocials:
        socials_output = "&&REGIONSOCIALS\t\t0\n"
        for social in regionsocials:
            social_str = ", ".join([str(x) if x is not None else "" for x in social])
            socials_output += f"{social_str},\n"
        return socials_output + "\n"
    return "&&REGIONSOCIALS\t\t0\n\n"

def write_regionreligions(regionreligions):
    if regionreligions:
        religions_output = "&&REGIONRELIGIONS\t0\n"
        for religion in regionreligions:
            religion_str = ", ".join([str(x) if x == int(x) else f"{x:.6g}" for x in religion])
            religions_output += f"{religion_str},\n"
        return religions_output + "\n"
    return "&&REGIONRELIGIONS\t0\n\n"

def write_regions(regions_data):
    regions_output = ""
    for region in regions_data:
        regions_output += f"&&CVP\t\t\t\t{region['ID']}\n"
        regions_output += write_region_properties(region["Properties"])
        regions_output += write_grouping(region.get("grouping", []))
        regions_output += write_regiontechs(region.get("regiontechs", []))
        regions_output += write_regionunitdesigns(region.get("regionunitdesigns", []))
        regions_output += write_regionproducts(region.get("regionproducts", []))
        regions_output += write_regionsocials(region.get("regionsocials", []))
        regions_output += write_regionreligions(region.get("regionreligions", []))
    return regions_output

def json_to_cvp(json_data):
    # Convert JSON data to the CVP file format
    cvp_output = "// Generated CVP File\n\n"
    cvp_output += write_theaters(json_data.get("Theaters_Data", {}))
    cvp_output += write_regions(json_data.get("Regions_Data", []))
    return cvp_output

def export_cvp(cvp_data, output_file_path):
    """
    Export the CVP data from cvp_data to the specified output_file_path.

    Args:
        cvp_data (dict): The CVP data containing 'Theaters_Data' and 'Regions_Data'.
        output_file_path (str): The file path where the CVP file will be saved.
    """
    try:
        with open(output_file_path, 'w') as cvp_file:
            # Export Theaters Data
            cvp_file.write('Theaters Data\n')
            theaters = cvp_data.get('Theaters_Data', [])
            if not theaters:
                add_to_log("No theaters data found in CVP data.", LogLevel.WARNING)
                cvp_file.write("No theaters data available.\n")
            else:
                for theater in theaters:
                    # Safely get 'theatreName', defaulting to 'Unknown' if not present
                    theater_name = theater.get('theatreName', 'Unknown')
                    cvp_file.write(f"{theater_name}\n")
            cvp_file.write('\n')  # Add a newline for separation

            # Export Regions Data
            cvp_file.write('Regions Data\n')
            regions = cvp_data.get('Regions_Data', [])
            if not regions:
                add_to_log("No regions data found in CVP data.", LogLevel.WARNING)
                cvp_file.write("No regions data available.\n")
            else:
                for region in regions:
                    # Safely get 'regionName', defaulting to 'Unknown' if not present
                    region_name = region.get('regionName', 'Unknown')
                    cvp_file.write(f"{region_name}\n")
        
        # Log successful export
        print(f"CVP file has been generated at {output_file_path}.")
        add_to_log(f"CVP file has been generated at {output_file_path}.", LogLevel.INFO)

    except Exception as e:
        # Log the error with details
        error_message = f"Error exporting CVP file: {e}"
        print(error_message)
        add_to_log(error_message, LogLevel.ERROR)
        raise  # Re-raise the exception to be handled by the calling function
# Example usage (uncomment to test):
# if __name__ == "__main__":
#     with open('exampleInput.json') as json_file:
#         json_data = json.load(json_file)
#     export_cvp(json_data, 'output.cvp')
