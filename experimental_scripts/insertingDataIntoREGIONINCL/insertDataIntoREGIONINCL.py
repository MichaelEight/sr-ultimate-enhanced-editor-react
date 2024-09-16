import json

def write_regionincl(json_data, output_file):
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
    
    # Save to the output file
    with open(output_file, 'w') as file:
        file.write(regionincl_output)
    
    print(f"REGIONINCL file saved as '{output_file}'.")

# Example usage
with open('example_REGIONINCL.json', 'r') as json_file:
    json_data = json.load(json_file)

write_regionincl(json_data, 'output.REGIONINCL')
