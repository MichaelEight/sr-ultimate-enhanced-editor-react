# cvp_exporter.py

import json
from ..utils.logging_utils import add_to_log, LogLevel

def write_theaters(theaters_data):
    if not theaters_data:
        # If theaters_data is empty, skip writing this section
        return ''
    theatres_output = "&&THEATRES\n"
    for theatre_id, theatre in theaters_data.items():
        theatre_name = theatre.get('theatreName', '')
        theatre_code = theatre.get('theatreCode', '')
        culture = theatre.get('culture', 0)
        x_location = theatre.get('xLocation', 0)
        y_location = theatre.get('yLocation', 0)
        theatres_output += f"{theatre_id}, {theatre_name}, {theatre_code}, {culture}, {x_location}, {y_location},\n"

    # Writing the &&THEATRETRANSF section
    theatres_output += "\n&&THEATRETRANSF\n"
    for theatre_id, theatre in theaters_data.items():
        transfer_str = ", ".join(map(str, theatre.get("transfers", [])))
        theatres_output += f"{theatre_id}, {transfer_str}                               // \"{theatre_name}\", \"{theatre_code}\"\n"

    theatres_output += "&&END\n\n"
    return theatres_output

def write_region_properties(properties):
    output = ""
    ALL_PROPERTY_LABELS = [
        'regionname', 'prefixname', 'altregionname', 'blocknum', 'altblocknum',
        'continentnum', 'flagnum', 'musictrack', 'regioncolor', 'politic', 'govtype',
        'refpopulation', 'poptotalarmy', 'popminreserve', 'treasury', 'nationaldebtgdp',
        'techlevel', 'civapproval', 'milapproval', 'fanaticism', 'defcon', 'loyalty',
        'playeragenda', 'playeraistance', 'worldavail', 'armsavail', 'worldintegrity',
        'treatyintegrity', 'envrating', 'milsubsidyrating', 'domsubsidyrating',
        'creditrating', 'tourismrating', 'literacy', 'lifeexp', 'avgchildren',
        'crimerate', 'unemployment', 'gdpc', 'inflation', 'buyingpower',
        'prodefficiency', 'alertlevel', 'bwmmember', 'religionstate', 'bconscript',
        'forcesplan', 'milspendsalary', 'milspendmaint', 'milspendintel',
        'milspendresearch', 'RacePrimary', 'RaceSecondary', 'capitalx', 'capitaly',
        'masterdata', 'nonplayable', 'influence', 'influenceval', 'couppossibility',
        'revoltpossibility', 'independencedesire', 'parentloyalty',
        'independencetarget', 'sphere', 'civiliansphere', 'keepregion', 'parentregion',
        'theatrehome', 'electiondate'
    ]
    for key in ALL_PROPERTY_LABELS:
        value = properties.get(key)
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
                output += f"{key}\t\t\t\t\"{value}\"\n"
    return output

def write_grouping(grouping, region_id):
    if grouping:
        grouping_str = ",\n".join(map(str, grouping)) + ",\n"
        return f"&&GROUPING\t\t\t\t{region_id}\n{grouping_str}\n"
    return f"&&GROUPING\t\t\t\t{region_id}\n\n"

def write_regiontechs(regiontechs, region_id):
    if regiontechs:
        regiontechs_str = ",\n".join(map(str, regiontechs)) + ",\n"
        return f"&&REGIONTECHS\t\t\t{region_id}\n{regiontechs_str}\n"
    return f"&&REGIONTECHS\t\t\t{region_id}\n\n"

def write_regionunitdesigns(regionunitdesigns, region_id):
    if regionunitdesigns:
        regionunitdesigns_str = ",\n".join(map(str, regionunitdesigns)) + ",\n"
        return f"&&REGIONUNITDESIGNS\t{region_id}\n{regionunitdesigns_str}\n"
    return f"&&REGIONUNITDESIGNS\t{region_id}\n\n"

def write_regionproducts(regionproducts, region_id):
    if regionproducts:
        products_output = f"&&REGIONPRODUCTS\t\t{region_id}\n"
        for product in regionproducts:
            product_str = ", ".join([str(x) if x is not None else "" for x in product])
            products_output += f"{product_str},\n"
        return products_output + "\n"
    return f"&&REGIONPRODUCTS\t\t{region_id}\n\n"

def write_regionsocials(regionsocials, region_id):
    if regionsocials:
        socials_output = f"&&REGIONSOCIALS\t\t{region_id}\n"
        for social in regionsocials:
            social_str = ", ".join([str(x) if x is not None else "" for x in social])
            socials_output += f"{social_str},\n"
        return socials_output + "\n"
    return f"&&REGIONSOCIALS\t\t{region_id}\n\n"

def write_regionreligions(regionreligions, region_id):
    if regionreligions:
        religions_output = f"&&REGIONRELIGIONS\t{region_id}\n"
        for religion in regionreligions:
            religion_str = ", ".join([str(x) if x == int(x) else f"{x:.6g}" for x in religion])
            religions_output += f"{religion_str},\n"
        return religions_output + "\n"
    return f"&&REGIONRELIGIONS\t{region_id}\n\n"

def write_regions(regions_data):
    regions_output = ""
    for region in regions_data:
        region_id = region['ID']
        regions_output += f"&&CVP\t\t\t\t{region_id}\n"
        regions_output += write_region_properties(region["Properties"])
        regions_output += write_grouping(region.get("grouping", []), region_id)
        regions_output += write_regiontechs(region.get("regiontechs", []), region_id)
        regions_output += write_regionunitdesigns(region.get("regionunitdesigns", []), region_id)
        regions_output += write_regionproducts(region.get("regionproducts", []), region_id)
        regions_output += write_regionsocials(region.get("regionsocials", []), region_id)
        regions_output += write_regionreligions(region.get("regionreligions", []), region_id)
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
        cvp_output = json_to_cvp(cvp_data)
        with open(output_file_path, 'w') as cvp_file:
            cvp_file.write(cvp_output)
        # Log successful export
        print(f"CVP file has been generated at {output_file_path}.")
        add_to_log(f"CVP file has been generated at {output_file_path}.", LogLevel.INFO)
    except Exception as e:
        # Log the error with details
        error_message = f"Error exporting CVP file: {e}"
        print(error_message)
        add_to_log(error_message, LogLevel.ERROR)
        raise  # Re-raise the exception to be handled by the calling function
