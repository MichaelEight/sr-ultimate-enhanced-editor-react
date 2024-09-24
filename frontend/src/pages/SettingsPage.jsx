import React, { useState, useEffect, useCallback } from 'react';
import '../assets/styles/SettingsPage.css';

const SettingsPage = ({ activeTab }) => {
    const [scenarioSettings, setScenarioSettings] = useState({
        // General Info
        startingDate: '',
        scenarioId: 0,
        fastForwardDays: 0,
        defaultRegion: 0,
        // Difficulties
        militaryDifficulty: '',
        economicDifficulty: '',
        diplomaticDifficulty: '',
        // Victory Conditions
        gameLength: '',
        victory: '',
        victoryHexX: 0,
        victoryHexY: 0,
        victoryTech: 0,
        // Starting Conditions
        resourcesLevel: '',
        initialFunds: '',
        // AI Settings
        globalAIStance: '',
        nukeEffect: '',
        approvalEffect: '',
        // Graphics Options
        guiLevel: '',
        mapSplash: 0,
        mapMusic: 0,
        // Miscellaneous
        startingYear: 0,
        techTreeDefault: '',
        regionAllies: '',
        regionAxis: '',
        sphereNN: '',
        // Scenario Options (Checkboxes)
        fixedCapitals: false,
        criticalUN: false,
        allowNukes: false,
        alliedVictory: false,
        noStartingDebt: false,
        limitDarEffect: false,
        limitRegionsInScenario: false,
        restrictTechTrade: false,
        regionEquip: false,
        fastBuild: false,
        noLoyaltyPenalty: false,
        missileLimit: false,
        reserveLimit: false,
        groupLoyaltyMerge: false,
        groupResearchMerge: false,
        limitMarEffect: false,
        noSphere: false,
        campaignGame: false,
        govChoice: false,
        thirdPartyRelationsEffect: false,
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        setScenarioSettings((prevState) => ({
            ...prevState,
            [name]: newValue,
        }));

        // Send updated value to backend
        const backendKey = mapFrontendKeyToBackendKey(name);
        const backendValue = type === 'checkbox' ? (checked ? 1 : 0) : value;

        fetch('http://localhost:5000/updateSetting', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ key: backendKey, value: backendValue }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                console.log('Setting updated successfully:', data);
            })
            .catch((error) => {
                console.error('Error updating setting:', error);
            });
    };

    const mapFrontendKeyToBackendKey = (frontendKey) => {
        const keyMapping = {
            // General Info
            startingDate: 'startymd',
            scenarioId: 'scenarioid',
            fastForwardDays: 'fastfwddays',
            defaultRegion: 'defaultregion',
            // Difficulties
            militaryDifficulty: 'difficulty[0]',
            economicDifficulty: 'difficulty[1]',
            diplomaticDifficulty: 'difficulty[2]',
            // Victory Conditions
            gameLength: 'gamelength',
            victory: 'svictorycond',
            victoryHexX: 'victoryhex[0]',
            victoryHexY: 'victoryhex[1]',
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
        // Logic to reset settings to default values
    };

    const undoReset = () => {
        // Logic to undo reset
    };

    const fetchSettingsData = useCallback(() => {
        fetch('http://localhost:5000/get_data')
            .then((response) => response.json())
            .then((data) => {
                if (data && data.settings_data) {
                    const backendSettings = data.settings_data;
                    setScenarioSettings(mapBackendSettingsToFrontend(backendSettings));
                    console.log('Fetched latest settings data.');
                }
            })
            .catch((error) => {
                console.error('Error fetching settings:', error);
            });
    }, []);

    const checkAndFetchSettings = useCallback(() => {
        fetch('http://localhost:5000/check_seen_since_last_update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tab: 'settings' }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data && data.seenSinceLastUpdate === false) {
                    fetchSettingsData();
                } else {
                    console.log('Settings data is up to date.');
                }
            })
            .catch((error) => {
                console.error('Error checking seenSinceLastUpdate:', error);
            });
    }, [fetchSettingsData]);

    // Ensure that useEffect runs after the function has been initialized
    useEffect(() => {
        if (activeTab === '/settings') {
            checkAndFetchSettings();
        }
    }, [activeTab, checkAndFetchSettings]);

    const mapBackendSettingsToFrontend = (backendSettings) => {
        const formatDate = (dateArray) => {
            if (!dateArray || dateArray.length !== 3) return ''; // Return empty if date is invalid
            const [year, month, day] = dateArray;
            const formattedMonth = month.toString().padStart(2, '0'); // Ensure two digits for month
            const formattedDay = day.toString().padStart(2, '0');     // Ensure two digits for day
            return `${year}-${formattedMonth}-${formattedDay}`;
        };

        return {
            // General Info
            startingDate: backendSettings.startymd ? formatDate(backendSettings.startymd) : '',
            scenarioId: backendSettings.scenarioid || 0,
            fastForwardDays: backendSettings.fastfwddays || 0,
            defaultRegion: backendSettings.defaultregion || 0,
            // Difficulties
            militaryDifficulty: backendSettings.difficulty ? backendSettings.difficulty[0] : '',
            economicDifficulty: backendSettings.difficulty ? backendSettings.difficulty[1] : '',
            diplomaticDifficulty: backendSettings.difficulty ? backendSettings.difficulty[2] : '',
            // Victory Conditions
            gameLength: backendSettings.gamelength || '',
            victory: backendSettings.svictorycond || '',
            victoryHexX: backendSettings.victoryhex ? backendSettings.victoryhex[0] : 0,
            victoryHexY: backendSettings.victoryhex ? backendSettings.victoryhex[1] : 0,
            victoryTech: backendSettings.victorytech || 0,
            // Starting Conditions
            resourcesLevel: backendSettings.resources || '',
            initialFunds: backendSettings.initialfunds || '',
            // AI Settings
            globalAIStance: backendSettings.aistance || '',
            nukeEffect: backendSettings.wmduse || '',
            approvalEffect: backendSettings.approvaleff || '',
            // Graphics Options
            guiLevel: backendSettings.mapgui || '',
            mapSplash: backendSettings.mapsplash || 0,
            mapMusic: backendSettings.mapmusic || 0,
            // Miscellaneous
            startingYear: backendSettings.startingyear || 0,
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

    return (
        <div className="scenario-page-container">
            <div className="scenario-group">
                <h3>General Info</h3>
                <label>Starting Date (YYYY-MM-DD):</label>
                <input
                    type="date"
                    name="startingDate"
                    value={scenarioSettings.startingDate}
                    onChange={handleInputChange}
                />

                <label>Scenario ID:</label>
                <input
                    type="number"
                    name="scenarioId"
                    min="0"
                    max="9999"
                    value={scenarioSettings.scenarioId}
                    onChange={handleInputChange}
                />

                <label>Fast Forward Days:</label>
                <input
                    type="number"
                    name="fastForwardDays"
                    min="0"
                    max="99999"
                    value={scenarioSettings.fastForwardDays}
                    onChange={handleInputChange}
                />

                <label>Default Region:</label>
                <input
                    type="number"
                    name="defaultRegion"
                    min="0"
                    max="99999"
                    value={scenarioSettings.defaultRegion}
                    onChange={handleInputChange}
                />
            </div>

            <div className="scenario-group">
                <h3>Difficulties</h3>
                <label>Military Difficulty:</label>
                <select
                    name="militaryDifficulty"
                    value={scenarioSettings.militaryDifficulty}
                    onChange={handleInputChange}
                >
                    <option value="1">Very Easy</option>
                    <option value="2">Easy</option>
                    <option value="3">Normal</option>
                    <option value="4">Hard</option>
                    <option value="5">Very Hard</option>
                </select>

                <label>Economic Difficulty:</label>
                <select
                    name="economicDifficulty"
                    value={scenarioSettings.economicDifficulty}
                    onChange={handleInputChange}
                >
                    <option value="1">Very Easy</option>
                    <option value="2">Easy</option>
                    <option value="3">Normal</option>
                    <option value="4">Hard</option>
                    <option value="5">Very Hard</option>
                </select>

                <label>Diplomatic Difficulty:</label>
                <select
                    name="diplomaticDifficulty"
                    value={scenarioSettings.diplomaticDifficulty}
                    onChange={handleInputChange}
                >
                    <option value="1">Very Easy</option>
                    <option value="2">Easy</option>
                    <option value="3">Normal</option>
                    <option value="4">Hard</option>
                    <option value="5">Very Hard</option>
                </select>
            </div>

            {/* Continue with the rest of the groups, following the structure you've provided... */}

            <div className="button-group">
                <button onClick={resetSettings}>Reset Settings to Default</button>
                <button onClick={undoReset}>Undo Reset</button>
            </div>
        </div>
    );
};

export default SettingsPage;
