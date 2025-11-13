// regioninclParser.js - Parse .REGIONINCL files

export function extractRegioninclData(content) {
    const data = {
        regions: []
    };

    const lines = content.split('\n');

    for (const line of lines) {
        const strippedLine = line.trim();

        // Skip empty lines
        if (!strippedLine) {
            continue;
        }

        // Skip lines that are comments without region IDs
        if (strippedLine.startsWith("//") && !/\/\/\s*(\d+)/.test(strippedLine)) {
            continue;
        }

        // Parse lines
        let match = strippedLine.match(/\/\/\s*(\d+)\s*\/\/\s*(.*)/);
        if (match) {
            // Inactive region with a comment
            const regionId = parseInt(match[1], 10);
            const comment = match[2] ? match[2].trim() : null;
            data.regions.push({ regionId, comment, isActive: false });
        } else {
            match = strippedLine.match(/(\d+)\s*\/\/\s*(.*)/);
            if (match) {
                // Active region with a comment
                const regionId = parseInt(match[1], 10);
                const comment = match[2] ? match[2].trim() : null;
                data.regions.push({ regionId, comment, isActive: true });
            } else {
                // Active region without a comment
                match = strippedLine.match(/(\d+)/);
                if (match) {
                    const regionId = parseInt(match[1], 10);
                    data.regions.push({ regionId, comment: null, isActive: true });
                }
            }
        }
    }

    console.log('Successfully extracted REGIONINCL data');
    return data;
}
