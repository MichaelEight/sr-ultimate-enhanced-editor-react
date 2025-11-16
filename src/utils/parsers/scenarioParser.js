// scenarioParser.js - Parse .SCENARIO files

import { DEFAULT_PROJECT_FILE_STRUCTURE, DEFAULT_SETTINGS_STRUCTURE } from '../../config/config';

export function importScenarioFile(content, filename) {
    console.log(`Parsing scenario file: ${filename}`);

    // Initialize scenario_data with expected keys
    const scenarioData = {};
    Object.keys(DEFAULT_PROJECT_FILE_STRUCTURE).forEach(ext => {
        scenarioData[ext] = [];
    });

    const scenarioName = filename.replace('.scenario', '').replace('.SCENARIO', '');
    scenarioData["scenario"] = [scenarioName];

    // Initialize settings_data with default structure
    const settingsData = JSON.parse(JSON.stringify(DEFAULT_SETTINGS_STRUCTURE));

    // Regex patterns
    const includePattern = /#include\s+"([^"]+)",\s*"([^"]+)"/g;
    const savfilePattern = /savfile\s+"([^"]+)"/;
    const mapfilePattern = /mapfile\s+"([^"]+)"/;
    const gmcPattern = /&&GMC([\s\S]*?)&&END/;
    const keyValuePattern = /(\w+):\s*(.*)/;

    // Process includes
    let match;
    while ((match = includePattern.exec(content)) !== null) {
        const filename = match[1];
        const extension = filename.split('.').pop().toLowerCase();
        if (extension in scenarioData) {
            const baseName = filename.substring(0, filename.lastIndexOf('.'));
            scenarioData[extension].push(baseName);
        }
    }

    // Process savfile
    const savfileMatch = content.match(savfilePattern);
    if (savfileMatch) {
        scenarioData['sav'].push(savfileMatch[1]);
    }

    // Process mapfile
    const mapfileMatch = content.match(mapfilePattern);
    if (mapfileMatch) {
        scenarioData['mapx'].push(mapfileMatch[1]);
    }

    // Process GMC section
    const gmcMatch = content.match(gmcPattern);
    if (gmcMatch) {
        const gmcContent = gmcMatch[1];
        const lines = gmcContent.trim().split('\n');

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith('//')) {
                continue;
            }

            const keyValueMatch = trimmedLine.match(keyValuePattern);
            if (keyValueMatch) {
                const key = keyValueMatch[1].toLowerCase();
                const value = keyValueMatch[2].trim();

                if (key in settingsData) {
                    if (['startymd', 'difficulty', 'victoryhex'].includes(key)) {
                        settingsData[key] = value.split(',').map(v => {
                            const trimmed = v.trim();
                            return /^\d+$/.test(trimmed) ? parseInt(trimmed, 10) : null;
                        });
                    } else if (key === 'fastfwddays') {
                        settingsData[key] = value ? parseFloat(value) : null;
                    } else if (typeof settingsData[key] === 'number') {
                        settingsData[key] = /^\d+$/.test(value) ? parseInt(value, 10) : 0;
                    } else {
                        settingsData[key] = value;
                    }
                } else {
                    console.warn(`Unknown key in GMC: ${key}`);
                }
            }
        }
    }

    console.log('Parsed scenario data:', scenarioData);
    console.log('Parsed settings data:', settingsData);

    return {
        scenario_data: scenarioData,
        settings_data: settingsData
    };
}
