import React, { useState, useEffect, useCallback } from 'react';
import { useProject } from '../context/ProjectContext';
import '../assets/styles/SettingsPage.css';

const SettingsPage = ({ activeTab, project }) => {
    const { projectData, updateData } = useProject();
    const [scenarioSettings, setScenarioSettings] = useState({});
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        let newValue;

        if (type === 'checkbox') {
            newValue = checked;
        } else if (type === 'number' || type === 'date') {
            newValue = value === '' ? '' : value;
        } else {
            newValue = value;
        }

        setScenarioSettings((prevState) => ({
            ...prevState,
            [name]: newValue,
        }));

        // Get backend key and value
        const backendKey = mapFrontendKeyToBackendKey(name);
        let backendValue;

        if (type === 'checkbox') {
            backendValue = checked ? 1 : 0;
        } else if (type === 'number') {
            backendValue = value === '' ? null : Number(value);
        } else {
            backendValue = value;
        }

        // Update settings in ProjectContext
        const updatedSettings = { ...projectData.settings_data };

        if (['militaryDifficulty', 'economicDifficulty', 'diplomaticDifficulty'].includes(name)) {
            const difficultyIndex = {
                'militaryDifficulty': 0,
                'economicDifficulty': 1,
                'diplomaticDifficulty': 2,
            }[name];

            const currentDifficulty = updatedSettings.difficulty || [2, 2, 2];
            const newDifficulty = [...currentDifficulty];
            newDifficulty[difficultyIndex] = backendValue;
            updatedSettings.difficulty = newDifficulty;
        } else if (['victoryHexX', 'victoryHexY'].includes(name)) {
            const victoryHexIndex = name === 'victoryHexX' ? 0 : 1;
            const currentVictoryHex = updatedSettings.victoryhex || [0, 0];
            const newVictoryHex = [...currentVictoryHex];
            newVictoryHex[victoryHexIndex] = backendValue || 0;
            updatedSettings.victoryhex = newVictoryHex;
        } else if (name === 'startingDate') {
            const dateArray = value ? value.split('-').map(Number) : [];
            updatedSettings.startymd = dateArray;
        } else {
            updatedSettings[backendKey] = backendValue;
        }

        // Update context
        updateData('settings_data', updatedSettings);
    };

    const mapFrontendKeyToBackendKey = (frontendKey) => {
        const keyMapping = {
            // General Info
            startingDate: 'startymd',
            scenarioId: 'scenarioid',
            fastForwardDays: 'fastfwddays',
            defaultRegion: 'defaultregion',
            // Difficulties
            militaryDifficulty: 'difficulty',
            economicDifficulty: 'difficulty',
            diplomaticDifficulty: 'difficulty',
            // Victory Conditions
            gameLength: 'gamelength',
            victory: 'svictorycond',
            victoryHexX: 'victoryhex',
            victoryHexY: 'victoryhex',
            victoryTech: 'victorytech',
            // Starting Conditions
            resourcesLevel: 'resources',
            initialFunds: 'initialfunds',
            // AI Settings
            globalAIStance: 'aistance',
            nukeEffect: 'wmduse',
            approvalEffect: 'approvaleff',
            // Graphics Options
            guiLevel: 'mapgui',
            mapSplash: 'mapsplash',
            mapMusic: 'mapmusic',
            // Miscellaneous
            startingYear: 'startingyear',
            techTreeDefault: 'techtreedefault',
            regionAllies: 'regionalallies',
            regionAxis: 'regionalaxis',
            sphereNN: 'spherenn',
            // Scenario Options (Checkboxes)
            fixedCapitals: 'fixedcapitals',
            criticalUN: 'criticalun',
            allowNukes: 'allownukes',
            alliedVictory: 'alliedvictory',
            noStartingDebt: 'debtfree',
            limitDarEffect: 'limitdareffect',
            limitRegionsInScenario: 'limitregionsinscenario',
            restrictTechTrade: 'restricttechtrade',
            regionEquip: 'regionequip',
            fastBuild: 'fastbuild',
            noLoyaltyPenalty: 'noloypenalty',
            missileLimit: 'missilenolimit',
            reserveLimit: 'reservelimit',
            groupLoyaltyMerge: 'grouployaltymerge',
            groupResearchMerge: 'groupresearchmerge',
            limitMarEffect: 'limitmareffect',
            noSphere: 'nosphere',
            campaignGame: 'campaigngame',
            govChoice: 'govchoice',
            thirdPartyRelationsEffect: 'thirdpartyrelationseffect',
        };
        return keyMapping[frontendKey];
    };

    const resetSettings = () => {
        // Reset to default settings from config
        const { DEFAULT_SETTINGS_STRUCTURE } = require('../utils/config');
        updateData('settings_data', JSON.parse(JSON.stringify(DEFAULT_SETTINGS_STRUCTURE)));
    };

    const undoReset = () => {
        console.log('Undo reset - not implemented');
    };

    const loadSettingsData = useCallback(() => {
        if (projectData && projectData.settings_data) {
            setScenarioSettings(mapBackendSettingsToFrontend(projectData.settings_data));
        }
    }, [projectData]);

    useEffect(() => {
        if (activeTab === '/settings' && project) {
            loadSettingsData();
        } else if (!project) {
            setScenarioSettings({});
        }
    }, [activeTab, project, loadSettingsData]);

    const mapBackendSettingsToFrontend = (backendSettings) => {
        const formatDate = (dateArray) => {
            if (!dateArray || dateArray.length !== 3) return '';
            const [year, month, day] = dateArray;
            const formattedMonth = month.toString().padStart(2, '0');
            const formattedDay = day.toString().padStart(2, '0');
            return `${year}-${formattedMonth}-${formattedDay}`;
        };

        return {
            // General Info
            startingDate: backendSettings.startymd ? formatDate(backendSettings.startymd) : new Date().toISOString().substr(0, 10),
            scenarioId: backendSettings.scenarioid !== undefined ? backendSettings.scenarioid : '',
            fastForwardDays: backendSettings.fastfwddays !== undefined ? backendSettings.fastfwddays : '',
            defaultRegion: backendSettings.defaultregion !== undefined ? backendSettings.defaultregion : '',
            // Difficulties
            militaryDifficulty: backendSettings.difficulty ? backendSettings.difficulty[0] : 2,
            economicDifficulty: backendSettings.difficulty ? backendSettings.difficulty[1] : 2,
            diplomaticDifficulty: backendSettings.difficulty ? backendSettings.difficulty[2] : 2,
            // Victory Conditions
            gameLength: backendSettings.gamelength !== undefined ? backendSettings.gamelength : 0,
            victory: backendSettings.svictorycond !== undefined ? backendSettings.svictorycond : 0,
            victoryHexX: backendSettings.victoryhex ? backendSettings.victoryhex[0] : '',
            victoryHexY: backendSettings.victoryhex ? backendSettings.victoryhex[1] : '',
            victoryTech: backendSettings.victorytech !== undefined ? backendSettings.victorytech : '',
            // Starting Conditions
            resourcesLevel: backendSettings.resources !== undefined ? backendSettings.resources : 2,
            initialFunds: backendSettings.initialfunds !== undefined ? backendSettings.initialfunds : 2,
            // AI Settings
            globalAIStance: backendSettings.aistance !== undefined ? backendSettings.aistance : 0,
            nukeEffect: backendSettings.wmduse !== undefined ? backendSettings.wmduse : 2,
            approvalEffect: backendSettings.approvaleff !== undefined ? backendSettings.approvaleff : 0,
            // Graphics Options
            guiLevel: backendSettings.mapgui !== undefined ? backendSettings.mapgui : 0,
            mapSplash: backendSettings.mapsplash !== undefined ? backendSettings.mapsplash : '',
            mapMusic: backendSettings.mapmusic !== undefined ? backendSettings.mapmusic : '',
            // Miscellaneous
            startingYear: backendSettings.startingyear !== undefined ? backendSettings.startingyear : '',
            techTreeDefault: backendSettings.techtreedefault || '',
            regionAllies: backendSettings.regionalallies || '',
            regionAxis: backendSettings.regionalaxis || '',
            sphereNN: backendSettings.spherenn || '',
            // Scenario Options (Checkboxes)
            fixedCapitals: backendSettings.fixedcapitals === 1,
            criticalUN: backendSettings.criticalun === 1,
            allowNukes: backendSettings.allownukes === 1,
            alliedVictory: backendSettings.alliedvictory === 1,
            noStartingDebt: backendSettings.debtfree === 1,
            limitDarEffect: backendSettings.limitdareffect === 1,
            limitRegionsInScenario: backendSettings.limitregionsinscenario === 1,
            restrictTechTrade: backendSettings.restricttechtrade === 1,
            regionEquip: backendSettings.regionequip === 1,
            fastBuild: backendSettings.fastbuild === 1,
            noLoyaltyPenalty: backendSettings.noloypenalty === 1,
            missileLimit: backendSettings.missilenolimit === 1,
            reserveLimit: backendSettings.reservelimit === 1,
            groupLoyaltyMerge: backendSettings.grouployaltymerge === 1,
            groupResearchMerge: backendSettings.groupresearchmerge === 1,
            limitMarEffect: backendSettings.limitmareffect === 1,
            noSphere: backendSettings.nosphere === 1,
            campaignGame: backendSettings.campaigngame === 1,
            govChoice: backendSettings.govchoice === 1,
            thirdPartyRelationsEffect: backendSettings.thirdpartyrelationseffect === 1,
        };
    };

    // Dropdown options
    const difficultyOptions = ['Very Easy', 'Easy', 'Normal', 'Hard', 'Very Hard'];
    const resourcesOptions = ['Depleted', 'Dwindling', 'Standard', 'Abundant'];
    const fundsOptions = ['No New Bonds', 'Low', 'Default', 'High'];
    const gameLengthOptions = [
        'None', '120 months', '108 months', '96 months', '84 months',
        '72 months', '60 months', '48 months', '36 months', '24 months',
        '18 months', '12 months', '6 months'
    ];
    const victoryOptions = [
        'Complete', 'Capital', 'Capture', 'Unification', 'Total Score',
        'Diplomatic Score', 'Economic Score', 'Technology Score', 'Approval Score',
        'Military Score', 'Sphere', 'Victory Points'
    ];
    const aiStanceOptions = ['Normal', 'Passive', 'Defensive', 'Aggressive', 'Unpredictable', 'None'];
    const nukeEffectOptions = ['Low', 'Medium', 'High'];
    const approvalOptions = ['Low', 'Medium', 'High'];
    const guiLevelOptions = [
        'Skin 0 - 1936',
        'Skin 1 - 1954',
        'Skin 2 - 2020',
        'Skin 3 - 1914'
    ];

    return (
        <div className="scenario-page-container">
            {loading ? (
                <p>Loading data...</p>
            ) : (
            <>
            {/* General Info */}
            <div className="scenario-group">
                <h3>General Info</h3>
                <label>Starting Date (YYYY-MM-DD):</label>
                <input
                    type="date"
                    name="startingDate"
                    value={scenarioSettings.startingDate || ''}
                    onChange={handleInputChange}
                />

                <label>Scenario ID:</label>
                <input
                    type="number"
                    name="scenarioId"
                    min="0"
                    max="9999"
                    value={scenarioSettings.scenarioId || ''}
                    onChange={handleInputChange}
                />

                <label>Fast Forward Days:</label>
                <input
                    type="number"
                    name="fastForwardDays"
                    min="0"
                    max="99999"
                    value={scenarioSettings.fastForwardDays || ''}
                    onChange={handleInputChange}
                />

                <label>Default Region:</label>
                <input
                    type="number"
                    name="defaultRegion"
                    min="0"
                    max="99999"
                    value={scenarioSettings.defaultRegion || ''}
                    onChange={handleInputChange}
                />
            </div>

            {/* Difficulties */}
            <div className="scenario-group">
                <h3>Difficulties</h3>
                <label>Military Difficulty:</label>
                <select
                    name="militaryDifficulty"
                    value={scenarioSettings.militaryDifficulty || 2}
                    onChange={handleInputChange}
                >
                    {difficultyOptions.map((option, index) => (
                        <option key={index} value={index}>{option}</option>
                    ))}
                </select>

                <label>Economic Difficulty:</label>
                <select
                    name="economicDifficulty"
                    value={scenarioSettings.economicDifficulty || 2}
                    onChange={handleInputChange}
                >
                    {difficultyOptions.map((option, index) => (
                        <option key={index} value={index}>{option}</option>
                    ))}
                </select>

                <label>Diplomatic Difficulty:</label>
                <select
                    name="diplomaticDifficulty"
                    value={scenarioSettings.diplomaticDifficulty || 2}
                    onChange={handleInputChange}
                >
                    {difficultyOptions.map((option, index) => (
                        <option key={index} value={index}>{option}</option>
                    ))}
                </select>
            </div>

            {/* Victory Conditions */}
            <div className="scenario-group">
                <h3>Victory Conditions</h3>
                <label>Game Length:</label>
                <select
                    name="gameLength"
                    value={scenarioSettings.gameLength || 0}
                    onChange={handleInputChange}
                >
                    {gameLengthOptions.map((option, index) => (
                        <option key={index} value={index}>{option}</option>
                    ))}
                </select>

                <label>Victory:</label>
                <select
                    name="victory"
                    value={scenarioSettings.victory || 0}
                    onChange={handleInputChange}
                >
                    {victoryOptions.map((option, index) => (
                        <option key={index} value={index}>{option}</option>
                    ))}
                </select>

                <label>Victory Hex (X, Y):</label>
                <input
                    type="number"
                    name="victoryHexX"
                    min="0"
                    value={scenarioSettings.victoryHexX || ''}
                    onChange={handleInputChange}
                />
                <input
                    type="number"
                    name="victoryHexY"
                    min="0"
                    value={scenarioSettings.victoryHexY || ''}
                    onChange={handleInputChange}
                />

                <label>Victory Tech:</label>
                <input
                    type="number"
                    name="victoryTech"
                    min="0"
                    value={scenarioSettings.victoryTech || ''}
                    onChange={handleInputChange}
                />
            </div>

            {/* Starting Conditions */}
            <div className="scenario-group">
                <h3>Starting Conditions</h3>
                <label>Resources Level:</label>
                <select
                    name="resourcesLevel"
                    value={scenarioSettings.resourcesLevel || 2}
                    onChange={handleInputChange}
                >
                    {resourcesOptions.map((option, index) => (
                        <option key={index} value={index}>{option}</option>
                    ))}
                </select>

                <label>Initial Funds:</label>
                <select
                    name="initialFunds"
                    value={scenarioSettings.initialFunds || 2}
                    onChange={handleInputChange}
                >
                    {fundsOptions.map((option, index) => (
                        <option key={index} value={index}>{option}</option>
                    ))}
                </select>
            </div>

            {/* AI Settings */}
            <div className="scenario-group">
                <h3>AI Settings</h3>
                <label>Global AI Stance:</label>
                <select
                    name="globalAIStance"
                    value={scenarioSettings.globalAIStance || 0}
                    onChange={handleInputChange}
                >
                    {aiStanceOptions.map((option, index) => (
                        <option key={index} value={index}>{option}</option>
                    ))}
                </select>

                <label>Nuke Effect:</label>
                <select
                    name="nukeEffect"
                    value={scenarioSettings.nukeEffect || 2}
                    onChange={handleInputChange}
                >
                    {nukeEffectOptions.map((option, index) => (
                        <option key={index} value={index}>{option}</option>
                    ))}
                </select>

                <label>Approval Effect:</label>
                <select
                    name="approvalEffect"
                    value={scenarioSettings.approvalEffect || 0}
                    onChange={handleInputChange}
                >
                    {approvalOptions.map((option, index) => (
                        <option key={index} value={index}>{option}</option>
                    ))}
                </select>
            </div>

            {/* Graphics Options */}
            <div className="scenario-group">
                <h3>Graphics Options</h3>
                <label>GUI Level:</label>
                <select
                    name="guiLevel"
                    value={scenarioSettings.guiLevel || 0}
                    onChange={handleInputChange}
                >
                    {guiLevelOptions.map((option, index) => (
                        <option key={index} value={index}>{option}</option>
                    ))}
                </select>

                <label>Map Splash:</label>
                <input
                    type="number"
                    name="mapSplash"
                    min="0"
                    value={scenarioSettings.mapSplash || ''}
                    onChange={handleInputChange}
                />

                <label>Map Music:</label>
                <input
                    type="number"
                    name="mapMusic"
                    min="0"
                    value={scenarioSettings.mapMusic || ''}
                    onChange={handleInputChange}
                />
            </div>

            {/* Miscellaneous */}
            <div className="scenario-group">
                <h3>Miscellaneous</h3>
                <label>Starting Year:</label>
                <input
                    type="number"
                    name="startingYear"
                    min="0"
                    value={scenarioSettings.startingYear || ''}
                    onChange={handleInputChange}
                />

                <label>Tech Tree Default:</label>
                <input
                    type="text"
                    name="techTreeDefault"
                    value={scenarioSettings.techTreeDefault || ''}
                    onChange={handleInputChange}
                />

                <label>Region Allies:</label>
                <input
                    type="text"
                    name="regionAllies"
                    value={scenarioSettings.regionAllies || ''}
                    onChange={handleInputChange}
                />

                <label>Region Axis:</label>
                <input
                    type="text"
                    name="regionAxis"
                    value={scenarioSettings.regionAxis || ''}
                    onChange={handleInputChange}
                />

                <label>Sphere NN:</label>
                <input
                    type="text"
                    name="sphereNN"
                    value={scenarioSettings.sphereNN || ''}
                    onChange={handleInputChange}
                />
            </div>

            {/* Scenario Options */}
            <div className="scenario-group">
                <h3>Scenario Options</h3>
                {[
                    'fixedCapitals',
                    'criticalUN',
                    'allowNukes',
                    'alliedVictory',
                    'noStartingDebt',
                    'limitDarEffect',
                    'limitRegionsInScenario',
                    'restrictTechTrade',
                    'regionEquip',
                    'fastBuild',
                    'noLoyaltyPenalty',
                    'missileLimit',
                    'reserveLimit',
                    'groupLoyaltyMerge',
                    'groupResearchMerge',
                    'limitMarEffect',
                    'noSphere',
                    'campaignGame',
                    'govChoice',
                    'thirdPartyRelationsEffect'
                ].map(option => (
                    <label key={option}>
                        <input
                            type="checkbox"
                            name={option}
                            checked={scenarioSettings[option] || false}
                            onChange={handleInputChange}
                        /> {option.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </label>
                ))}
            </div>

            <div className="button-group">
                <button onClick={resetSettings}>Reset Settings to Default</button>
                <button onClick={undoReset}>Undo Reset</button>
            </div>
            </>
            )}
        </div>
    );
};

export default SettingsPage;
