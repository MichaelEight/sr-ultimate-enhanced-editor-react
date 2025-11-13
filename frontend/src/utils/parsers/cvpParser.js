// cvpParser.js - Parse .CVP files

// All possible region property labels
const ALL_PROPERTY_LABELS = [
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
];

// Required region properties with defaults
const REQUIRED_PROPERTIES = {
    "grouping": [],
    "regiontechs": [],
    "regionunitdesigns": [],
    "regionproducts": [],
    "regionsocials": [],
    "regionreligions": []
};

// Helper functions for processing different && sections
function processGrouping(lines) {
    const groupingData = [];
    for (const line of lines) {
        const lineParts = line.split(',')
            .map(x => x.trim())
            .filter(x => x !== '')
            .map(x => parseInt(x, 10));
        groupingData.push(...lineParts);
    }
    return groupingData;
}

function processRegiontechs(lines) {
    const regiontechsData = [];
    for (const line of lines) {
        const lineParts = line.split(',')
            .map(x => x.trim())
            .filter(x => x !== '')
            .map(x => parseInt(x, 10));
        regiontechsData.push(...lineParts);
    }
    return regiontechsData;
}

function processRegionunitdesigns(lines) {
    const regionunitdesignsData = [];
    for (const line of lines) {
        const lineParts = line.split(',')
            .map(x => x.trim())
            .filter(x => x !== '')
            .map(x => parseInt(x, 10));
        regionunitdesignsData.push(...lineParts);
    }
    return regionunitdesignsData;
}

function processRegionproducts(lines) {
    const regionproductsData = [];
    for (const line of lines) {
        let lineParts = line.split(',').map(x => {
            const trimmed = x.trim();
            return /^\d+$/.test(trimmed) ? parseInt(trimmed, 10) : null;
        });
        // Remove trailing nulls
        while (lineParts.length > 0 && lineParts[lineParts.length - 1] === null) {
            lineParts.pop();
        }
        regionproductsData.push(lineParts);
    }
    return regionproductsData;
}

function processRegionsocials(lines) {
    const regionsocialsData = [];
    for (const line of lines) {
        const lineParts = line.split(',');

        const firstPart = lineParts[0] && /^\d+$/.test(lineParts[0].trim())
            ? parseInt(lineParts[0].trim(), 10)
            : null;

        const secondPart = lineParts[1] && lineParts[1].trim() !== ''
            ? parseFloat(lineParts[1].trim())
            : null;

        const thirdPart = null;

        if (firstPart !== null || secondPart !== null) {
            regionsocialsData.push([firstPart, secondPart, thirdPart]);
        }
    }
    return regionsocialsData;
}

function processRegionreligions(lines) {
    const regionreligionsData = [];
    for (const line of lines) {
        const lineParts = line.split(',');

        const firstPart = lineParts[0] && /^\d+$/.test(lineParts[0].trim())
            ? parseInt(lineParts[0].trim(), 10)
            : null;

        let secondPart = 0.0;
        if (lineParts[1] && lineParts[1].trim() !== '') {
            try {
                secondPart = parseFloat(lineParts[1].trim());
            } catch (e) {
                secondPart = 0.0;
            }
        }

        if (firstPart !== null) {
            regionreligionsData.push([firstPart, secondPart]);
        }
    }
    return regionreligionsData;
}

export function extractCvpData(content) {
    const data = {
        Theaters_Data: {},
        Regions_Data: []
    };

    let inTheaters = false;
    let inTransfers = false;
    let regionData = null;
    let currentSection = null;
    let sectionLines = [];

    const lines = content.split('\n');

    for (const line of lines) {
        const strippedLine = line.trim();

        // Start of Theaters_Data
        if (strippedLine.startsWith("&&THEATRES")) {
            inTheaters = true;
            continue;
        }

        // End of Theaters_Data, start of Theatre Transfer Data
        if (inTheaters && strippedLine.startsWith("&&THEATRETRANSF")) {
            inTheaters = false;
            inTransfers = true;
            continue;
        }

        // Collecting Theaters_Data
        if (inTheaters) {
            // Skip empty lines
            if (!strippedLine) {
                continue;
            }

            const theaterParts = strippedLine.split(',').map(x => x.trim());
            if (theaterParts.length >= 6 && theaterParts[0]) {
                const theatreId = parseInt(theaterParts[0], 10);
                if (!isNaN(theatreId)) {
                    data.Theaters_Data[theatreId] = {
                        theatreName: theaterParts[1],
                        theatreCode: theaterParts[2],
                        culture: parseInt(theaterParts[3], 10),
                        xLocation: parseInt(theaterParts[4], 10),
                        yLocation: parseInt(theaterParts[5], 10),
                        transfers: []
                    };
                }
            }
            continue;
        }

        // Collecting Theatre Transfer Data
        if (inTransfers) {
            if (strippedLine.startsWith("&&END")) {
                inTransfers = false;
                continue;
            }

            const transferParts = strippedLine.split('//')[0].trim().split(',');
            const transferIds = transferParts
                .map(x => x.trim())
                .filter(x => x !== '')
                .map(x => parseInt(x, 10));

            if (transferIds.length > 0) {
                const theatreId = transferIds[0];
                if (theatreId in data.Theaters_Data) {
                    data.Theaters_Data[theatreId].transfers = transferIds.slice(1);
                }
            }
            continue;
        }

        // Start of Regions_Data
        if (strippedLine.startsWith("&&CVP")) {
            // Process last section if any
            if (currentSection && sectionLines.length > 0) {
                processSectionLines(regionData, currentSection, sectionLines);
            }

            // Append previously processed region_data if any
            if (regionData) {
                // Ensure all required properties are present
                for (const [key, defaultValue] of Object.entries(REQUIRED_PROPERTIES)) {
                    if (!(key in regionData)) {
                        regionData[key] = JSON.parse(JSON.stringify(defaultValue));
                    }
                }
                data.Regions_Data.push(regionData);
            }

            // Initialize new region data
            const regionId = parseInt(strippedLine.split(/\s+/)[1], 10);
            regionData = { ID: regionId, Properties: {} };
            currentSection = null;
            sectionLines = [];
            continue;
        }

        // Collecting Regions_Data sections
        if (strippedLine.startsWith("&&")) {
            // Process current section before starting new one
            if (currentSection && sectionLines.length > 0) {
                processSectionLines(regionData, currentSection, sectionLines);
            }

            // Start new section
            currentSection = strippedLine.replace("&&", "").toLowerCase().split(/\s+/)[0];
            sectionLines = [];
            continue;
        }

        // Process region properties (not in a section)
        if (currentSection === null && regionData) {
            const parts = strippedLine.split(/\s+/);
            let label, value;

            if (parts.length === 2) {
                [label, value] = parts;
            } else if (parts.length === 1) {
                [label, value] = [parts[0], ''];
            } else {
                continue;
            }

            if (label) {
                // Process the value
                if (value === '') {
                    value = null;
                } else if (['altregionname', 'influence', 'influenceval'].includes(label)) {
                    value = value.split(',').map(x => {
                        const trimmed = x.trim();
                        return trimmed !== '' ? trimmed : null;
                    });
                } else if (label === 'regioncolor') {
                    value = value.trim();
                } else if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                } else if (value === ',') {
                    value = [];
                } else if (value.startsWith('0x')) {
                    value = value;
                } else if (/^-?\d+(\.\d+)?$/.test(value)) {
                    value = value.includes('.') ? parseFloat(value) : parseInt(value, 10);
                } else {
                    value = value.trim();
                }

                // Initialize PropertyOrder if not already
                if (!regionData.PropertyOrder) {
                    regionData.PropertyOrder = [];
                }

                // Add the label and value
                regionData.Properties[label] = value;
                regionData.PropertyOrder.push(label);
            }
        } else if (currentSection !== null) {
            // Collect lines for the current section
            sectionLines.push(strippedLine);
        }
    }

    // Ensure the last region is processed
    if (regionData) {
        // Process last section if any
        if (currentSection && sectionLines.length > 0) {
            processSectionLines(regionData, currentSection, sectionLines);
        }

        // Ensure all required properties are present
        for (const [key, defaultValue] of Object.entries(REQUIRED_PROPERTIES)) {
            if (!(key in regionData)) {
                regionData[key] = JSON.parse(JSON.stringify(defaultValue));
            }
        }

        data.Regions_Data.push(regionData);
    }

    return data;
}

function processSectionLines(regionData, sectionName, lines) {
    switch (sectionName) {
        case 'grouping':
            regionData.grouping = processGrouping(lines);
            break;
        case 'regiontechs':
            regionData.regiontechs = processRegiontechs(lines);
            break;
        case 'regionunitdesigns':
            regionData.regionunitdesigns = processRegionunitdesigns(lines);
            break;
        case 'regionproducts':
            regionData.regionproducts = processRegionproducts(lines);
            break;
        case 'regionsocials':
            regionData.regionsocials = processRegionsocials(lines);
            break;
        case 'regionreligions':
            regionData.regionreligions = processRegionreligions(lines);
            break;
    }
}
