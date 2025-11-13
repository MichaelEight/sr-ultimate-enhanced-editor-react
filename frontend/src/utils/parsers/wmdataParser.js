// wmdataParser.js - Parse .WMDATA files

const ID_TO_RESOURCE = {
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
};

const BATTSTRDEFAULT_LABELS = [
    "inf", "rec", "tank", "at", "art", "aa", "trp", "helo", "miss", "int",
    "fig", "multi", "bomb", "rec_air", "a-trp", "sub", "carr", "bship", "frig",
    "spat", "strp", "upgrade", "unused"
];

const SOCIALDEFAULTS_LABELS = [
    "healthcare", "education", "familysubsidy", "lawenforcement",
    "infrastructure", "socialassistance", "culturalsubsidy", "environment"
];

const HEXRESMULTS_LABELS = [
    "agriculture", "rubber", "timber", "petroleum", "coal", "ore", "uranium", "electricity"
];

function ensureLength(lst, length) {
    // Only add elements if list is shorter than desired length
    const diff = length - lst.length;
    if (diff > 0) {
        lst = [...lst, ...Array(diff).fill(null)];
    }
    // Remove trailing nulls
    while (lst.length > 0 && lst[lst.length - 1] === null) {
        lst.pop();
    }
    return lst;
}

function parseFloatWithComma(parts) {
    if (parts[1]) {
        const decimalStr = parts[1].replace(',', '.');
        try {
            return parseFloat(decimalStr);
        } catch (e) {
            return null;
        }
    }
    return null;
}

export function extractWmdata(content) {
    const data = {
        worldmarket: {
            settings: {},
            military: {},
            economic: {},
            weather: {}
        },
        resources: {}
    };

    let currentSection = null;
    let currentResourceId = null;

    const lines = content.split('\n');

    for (const line of lines) {
        const strippedLine = line.trim();

        // Skip comments and empty lines
        if (strippedLine.startsWith("//") || !strippedLine) {
            continue;
        }

        // Start of worldmarket data
        if (strippedLine.startsWith("&&WMDATA")) {
            currentSection = "worldmarket";
            continue;
        }

        // End of section
        if (strippedLine === "&&END") {
            currentSection = null;
            continue;
        }

        // Start of a WMPRODDATA section
        const match = strippedLine.match(/&&WMPRODDATA, (\d+)/);
        if (match) {
            const resourceId = parseInt(match[1], 10);
            currentResourceId = ID_TO_RESOURCE[resourceId];
            if (currentResourceId) {
                data.resources[currentResourceId] = {
                    cost: {},
                    production: {},
                    producefrom: {}
                };
                currentSection = "resources";
            } else {
                console.warn(`Unknown resource ID: ${resourceId}`);
            }
            continue;
        }

        // Processing worldmarket section
        if (currentSection === "worldmarket") {
            const parts = strippedLine.split(',').map(x => x.trim() || null);
            const key = parts[0].toLowerCase();

            if (["wmlevel", "gdpcbase", "dayswmlevel"].includes(key)) {
                const value = parts[1] ? parseInt(parts[1], 10) : null;
                data.worldmarket.settings[key] = value;
            } else if (["primerate", "socadj", "wmrelrate"].includes(key)) {
                const value = parseFloatWithComma(parts);
                data.worldmarket.settings[key] = value;
            } else if (key === "battstrdefault") {
                const values = ensureLength(
                    parts.slice(1).map(x => x ? parseInt(x, 10) : null),
                    BATTSTRDEFAULT_LABELS.length
                );
                data.worldmarket.military[key] = Object.fromEntries(
                    BATTSTRDEFAULT_LABELS.map((label, i) => [label, values[i]])
                );
            } else if (key === "unitgarrison") {
                const values = parts.slice(1).map(x => x ? parseInt(x, 10) : null);
                data.worldmarket.military[key] = values;
            } else if (key === "garrisonprogression") {
                const values = parts.slice(1).map(x => x ? parseInt(x, 10) : null);
                data.worldmarket.military[key] = values;
            } else if (key === "hexresmults") {
                const values = ensureLength(
                    parts.slice(1).map(x => x ? parseInt(x, 10) : null),
                    HEXRESMULTS_LABELS.length
                );
                data.worldmarket.economic[key] = Object.fromEntries(
                    HEXRESMULTS_LABELS.map((label, i) => [label, values[i]])
                );
            } else if (key === "socialdefaults") {
                const values = ensureLength(
                    parts.slice(1).map(x => x ? parseInt(x, 10) : null),
                    SOCIALDEFAULTS_LABELS.length
                );
                data.worldmarket.economic[key] = Object.fromEntries(
                    SOCIALDEFAULTS_LABELS.map((label, i) => [label, values[i]])
                );
            } else if (key === "weatheroffy") {
                const values = parts.slice(1).map(x => x ? parseInt(x, 10) : null);
                data.worldmarket.weather[key] = values;
            } else if (key === "weatherspeed") {
                const values = parts.slice(1).map(x => x ? parseInt(x, 10) : null);
                data.worldmarket.weather[key] = values;
            } else if (key === "weatheryear") {
                const value = parts[1] ? parseInt(parts[1], 10) : null;
                data.worldmarket.weather[key] = value;
            } else {
                const values = parts.slice(1).map(x => x && /^\d+$/.test(x) ? parseInt(x, 10) : null);
                data.worldmarket[key] = values.length > 1 ? values : (values[0] || null);
            }
        }
        // Processing resources section
        else if (currentSection === "resources" && currentResourceId) {
            const parts = strippedLine.split(',').map(x => x.trim() || null);
            const key = parts[0].toLowerCase();

            const resource = data.resources[currentResourceId];

            if (key === "producefrom") {
                const values = ensureLength(
                    parts.slice(1).map(x => x ? parseInt(x, 10) : 0),
                    Object.keys(ID_TO_RESOURCE).length
                );
                resource.producefrom = Object.fromEntries(
                    Object.values(ID_TO_RESOURCE).map((res, i) => [res, values[i]])
                );
            } else if (["wmbasecost", "wmfullcost", "wmmargin"].includes(key)) {
                const value = parts[1] ? parseInt(parts[1], 10) : 0;
                resource.cost[key] = value;
            } else if (["nodeproduction", "wmprodperpersonmax", "wmprodperpersonmin", "wmurbanproduction"].includes(key)) {
                const value = parts[1] ? parseInt(parts[1], 10) : 0;
                resource.production[key] = value;
            } else {
                const value = parts[1] && /^\d+$/.test(parts[1]) ? parseInt(parts[1], 10) : 0;
                resource[key] = value;
            }
        }
    }

    console.log('Successfully extracted WMData');
    return data;
}
