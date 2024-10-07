import React, { useState, useEffect, useCallback, useRef } from 'react';
import '../assets/styles/SettingsPage.css';

const SettingsPage = ({ activeTab, project, setProject }) => {
    const [scenarioSettings, setScenarioSettings] = useState({});
    const [loading, setLoading] = useState(false);

    const isMounted = useRef(false);

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

        // Send updated value to backend
        const backendKey = mapFrontendKeyToBackendKey(name);
        let backendValue;

        if (type === 'checkbox') {
            backendValue = checked ? 1 : 0;
        } else if (type === 'number') {
            backendValue = value === '' ? null : Number(value);
        } else {
            backendValue = value;
        }

        // Special handling for arrays and complex structures
        if (['militaryDifficulty', 'economicDifficulty', 'diplomaticDifficulty'].includes(name)) {
            // Update difficulty array
            const difficultyIndex = {
                'militaryDifficulty': 0,
                'economicDifficulty': 1,
                'diplomaticDifficulty': 2,
            }[name];

            const currentDifficulty = scenarioSettings.difficulty || [2, 2, 2];
            const newDifficulty = [...currentDifficulty];
            newDifficulty[difficultyIndex] = backendValue;

            // Send updated difficulty array
            fetch('http://localhost:5000/updateSetting', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ key: 'difficulty', value: newDifficulty }),
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then((data) => {
                    console.log('Difficulty setting updated successfully:', data);
                })
                .catch((error) => {
                    console.error('Error updating difficulty setting:', error);
                });
        } else if (['victoryHexX', 'victoryHexY'].includes(name)) {
            // Update victoryhex array
            const victoryHexIndex = name === 'victoryHexX' ? 0 : 1;
            const currentVictoryHex = scenarioSettings.victoryhex || [0, 0];
            const newVictoryHex = [...currentVictoryHex];
            newVictoryHex[victoryHexIndex] = backendValue || 0;

            // Send updated victoryhex array
            fetch('http://localhost:5000/updateSetting', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ key: 'victoryhex', value: newVictoryHex }),
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then((data) => {
                    console.log('Victory Hex setting updated successfully:', data);
                })
                .catch((error) => {
                    console.error('Error updating Victory Hex setting:', error);
                });
        } else if (name === 'startingDate') {
            // Convert date string to array [YYYY, MM, DD]
            const dateArray = value ? value.split('-').map(Number) : [];
            fetch('http://localhost:5000/updateSetting', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ key: 'startymd', value: dateArray }),
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then((data) => {
                    console.log('Starting date updated successfully:', data);
                })
                .catch((error) => {
                    console.error('Error updating starting date:', error);
                });
        } else {
            // Send other settings directly
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
        }
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
        // Logic to reset settings to default values
    };

    const undoReset = () => {
        // Logic to undo reset
    };

    const fetchSettingsData = useCallback(() => {
    setLoading(true);
    fetch('http://localhost:5000/get_data')
      .then((response) => response.json())
      .then((data) => {
        if (data && data.settings_data) {
          const backendSettings = data.settings_data;
          if (isMounted.current) {
            setScenarioSettings(mapBackendSettingsToFrontend(backendSettings));
            setLoading(false);
            console.log('Fetched latest settings data.');
          }
        }
      })
      .catch((error) => {
        if (isMounted.current) {
          setLoading(false);
          console.error('Error fetching settings:', error);
        }
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
          console.log('Settings data has changed. Fetching new data.');
          fetchSettingsData();
        } else {
          console.log('Settings data is up to date.');
        }
      })
      .catch((error) => {
        console.error('Error checking seenSinceLastUpdate:', error);
      });
  }, [fetchSettingsData]);

  useEffect(() => {
        isMounted.current = true;
        if (activeTab === '/settings' && project) {
            if (Object.keys(scenarioSettings).length === 0) {
                fetchSettingsData();
            } else {
                checkAndFetchSettings();
            }
        } else if (!project) {
            // Reset state when project is closed
            setScenarioSettings({});
        }
        return () => {
            isMounted.current = false;
        };
    }, [activeTab, fetchSettingsData, checkAndFetchSettings, scenarioSettings, project]);

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

            {/* Difficulties */}
            <div className="scenario-group">
                <h3>Difficulties</h3>
                <label>Military Difficulty:</label>
                <select
                    name="militaryDifficulty"
                    value={scenarioSettings.militaryDifficulty}
                    onChange={handleInputChange}
                >
                    {difficultyOptions.map((option, index) => (
                        <option key={index} value={index}>{option}</option>
                    ))}
                </select>

                <label>Economic Difficulty:</label>
                <select
                    name="economicDifficulty"
                    value={scenarioSettings.economicDifficulty}
                    onChange={handleInputChange}
                >
                    {difficultyOptions.map((option, index) => (
                        <option key={index} value={index}>{option}</option>
                    ))}
                </select>

                <label>Diplomatic Difficulty:</label>
                <select
                    name="diplomaticDifficulty"
                    value={scenarioSettings.diplomaticDifficulty}
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
                    value={scenarioSettings.gameLength}
                    onChange={handleInputChange}
                >
                    {gameLengthOptions.map((option, index) => (
                        <option key={index} value={index}>{option}</option>
                    ))}
                </select>

                <label>Victory:</label>
                <select
                    name="victory"
                    value={scenarioSettings.victory}
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
                    value={scenarioSettings.victoryHexX}
                    onChange={handleInputChange}
                />
                <input
                    type="number"
                    name="victoryHexY"
                    min="0"
                    value={scenarioSettings.victoryHexY}
                    onChange={handleInputChange}
                />

                <label>Victory Tech:</label>
                <input
                    type="number"
                    name="victoryTech"
                    min="0"
                    value={scenarioSettings.victoryTech}
                    onChange={handleInputChange}
                />
            </div>

            {/* Starting Conditions */}
            <div className="scenario-group">
                <h3>Starting Conditions</h3>
                <label>Resources Level:</label>
                <select
                    name="resourcesLevel"
                    value={scenarioSettings.resourcesLevel}
                    onChange={handleInputChange}
                >
                    {resourcesOptions.map((option, index) => (
                        <option key={index} value={index}>{option}</option>
                    ))}
                </select>

                <label>Initial Funds:</label>
                <select
                    name="initialFunds"
                    value={scenarioSettings.initialFunds}
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
                    value={scenarioSettings.globalAIStance}
                    onChange={handleInputChange}
                >
                    {aiStanceOptions.map((option, index) => (
                        <option key={index} value={index}>{option}</option>
                    ))}
                </select>

                <label>Nuke Effect:</label>
                <select
                    name="nukeEffect"
                    value={scenarioSettings.nukeEffect}
                    onChange={handleInputChange}
                >
                    {nukeEffectOptions.map((option, index) => (
                        <option key={index} value={index}>{option}</option>
                    ))}
                </select>

                <label>Approval Effect:</label>
                <select
                    name="approvalEffect"
                    value={scenarioSettings.approvalEffect}
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
                    value={scenarioSettings.guiLevel}
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
                    value={scenarioSettings.mapSplash}
                    onChange={handleInputChange}
                />

                <label>Map Music:</label>
                <input
                    type="number"
                    name="mapMusic"
                    min="0"
                    value={scenarioSettings.mapMusic}
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
                    value={scenarioSettings.startingYear}
                    onChange={handleInputChange}
                />

                <label>Tech Tree Default:</label>
                <input
                    type="text"
                    name="techTreeDefault"
                    value={scenarioSettings.techTreeDefault}
                    onChange={handleInputChange}
                />

                <label>Region Allies:</label>
                <input
                    type="text"
                    name="regionAllies"
                    value={scenarioSettings.regionAllies}
                    onChange={handleInputChange}
                />

                <label>Region Axis:</label>
                <input
                    type="text"
                    name="regionAxis"
                    value={scenarioSettings.regionAxis}
                    onChange={handleInputChange}
                />

                <label>Sphere NN:</label>
                <input
                    type="text"
                    name="sphereNN"
                    value={scenarioSettings.sphereNN}
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
                            checked={scenarioSettings[option]}
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
