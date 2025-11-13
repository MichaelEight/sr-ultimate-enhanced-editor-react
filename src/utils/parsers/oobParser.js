// oobParser.js - Parse .OOB files

function processOobUnit(line) {
    const unitParts = line.split(',').map(x => x.trim() || null);

    const unit_data = {
        unitId: unitParts[0] ? parseInt(unitParts[0], 10) : null,
        X: unitParts[1] ? parseInt(unitParts[1], 10) : null,
        Y: unitParts[2] ? parseInt(unitParts[2], 10) : null,
        LocName: unitParts[3],
        Quantity: unitParts[4] ? parseInt(unitParts[4], 10) : null,
        Status: unitParts[5],
        BattNum: unitParts[6] ? parseInt(unitParts[6], 10) : null,
        BattName: unitParts[7],
        Entrench: unitParts[8] ? parseInt(unitParts[8], 10) : null,
        Eff: unitParts[9] ? parseInt(unitParts[9], 10) : null,
        Exp: unitParts[10] ? parseInt(unitParts[10], 10) : null,
        Special: unitParts[11],
        Str: unitParts[12] ? parseInt(unitParts[12], 10) : null,
        MaxStr: unitParts[13] ? parseInt(unitParts[13], 10) : null,
        DaysLeft: unitParts[14] ? parseInt(unitParts[14], 10) : null,
        Facing: unitParts[15],
        GroupId: unitParts[16] ? parseInt(unitParts[16], 10) : null,
        TargetRole: unitParts[17],
        StatustoBattC: unitParts[18],
        StatustoBattN: unitParts[19]
    };

    return unit_data;
}

export function extractOobData(content) {
    const data = {
        OOB_Data: []
    };

    let currentRegionId = null;
    let currentUnits = [];

    const lines = content.split('\n');

    for (const line of lines) {
        let strippedLine = line.trim();

        // Ignore comments (anything after "//")
        strippedLine = strippedLine.split('//')[0].trim();
        if (!strippedLine) {
            continue;
        }

        // Detect start of new region
        if (strippedLine.startsWith("&&OOB")) {
            // Process previous region if any
            if (currentRegionId !== null) {
                data.OOB_Data.push({
                    regionId: currentRegionId,
                    units: currentUnits
                });
            }

            // Extract region ID
            currentRegionId = parseInt(strippedLine.split(/\s+/)[1], 10);
            currentUnits = [];
            continue;
        }

        // Process each unit line
        currentUnits.push(processOobUnit(strippedLine));
    }

    // Ensure last region is processed
    if (currentRegionId !== null) {
        data.OOB_Data.push({
            regionId: currentRegionId,
            units: currentUnits
        });
    }

    console.log('Successfully extracted OOB data');
    return data;
}
