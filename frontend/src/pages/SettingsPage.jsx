import React, { useState } from 'react';
import '../assets/styles/SettingsPage.css';

const ScenarioPage = () => {
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
        setScenarioSettings(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const resetSettings = () => {
        // Add logic to reset settings to default values
    };

    const undoReset = () => {
        // Add logic to undo reset
    };

    return (
        <div className="scenario-page-container">
            <h2>Scenario Settings</h2>

            <div className="scenario-group">
                <h3>General Info</h3>
                <label>Starting Date (YYYY, MM, DD):</label>
                <input type="date" name="startingDate" value={scenarioSettings.startingDate} onChange={handleInputChange} />

                <label>Scenario ID:</label>
                <input type="number" name="scenarioId" min="0" max="9999" value={scenarioSettings.scenarioId} onChange={handleInputChange} />

                <label>Fast Forward Days:</label>
                <input type="number" name="fastForwardDays" min="0" max="99999" value={scenarioSettings.fastForwardDays} onChange={handleInputChange} />

                <label>Default Region:</label>
                <input type="number" name="defaultRegion" min="0" max="99999" value={scenarioSettings.defaultRegion} onChange={handleInputChange} />
            </div>

            <div className="scenario-group">
                <h3>Difficulties</h3>
                <label>Military Difficulty:</label>
                <select name="militaryDifficulty" value={scenarioSettings.militaryDifficulty} onChange={handleInputChange}>
                    <option value="very easy">Very Easy</option>
                    <option value="easy">Easy</option>
                    <option value="normal">Normal</option>
                    <option value="hard">Hard</option>
                    <option value="very hard">Very Hard</option>
                </select>

                <label>Economic Difficulty:</label>
                <select name="economicDifficulty" value={scenarioSettings.economicDifficulty} onChange={handleInputChange}>
                    <option value="very easy">Very Easy</option>
                    <option value="easy">Easy</option>
                    <option value="normal">Normal</option>
                    <option value="hard">Hard</option>
                    <option value="very hard">Very Hard</option>
                </select>

                <label>Diplomatic Difficulty:</label>
                <select name="diplomaticDifficulty" value={scenarioSettings.diplomaticDifficulty} onChange={handleInputChange}>
                    <option value="very easy">Very Easy</option>
                    <option value="easy">Easy</option>
                    <option value="normal">Normal</option>
                    <option value="hard">Hard</option>
                    <option value="very hard">Very Hard</option>
                </select>
            </div>

            <div className="scenario-group">
                <h3>Victory Conditions</h3>
                <label>Game Length:</label>
                <select name="gameLength" value={scenarioSettings.gameLength} onChange={handleInputChange}>
                    <option value="2 month">2 Month</option>
                    <option value="5 month">5 Month</option>
                    <option value="6 months">6 Months</option>
                </select>

                <label>Victory:</label>
                <select name="victory" value={scenarioSettings.victory} onChange={handleInputChange}>
                    <option value="complete">Complete</option>
                    <option value="capital">Capital</option>
                    {/* Add more options as needed */}
                </select>

                <label>Victory Hex (X, Y):</label>
                <input type="number" name="victoryHexX" min="0" max="99999" value={scenarioSettings.victoryHexX} onChange={handleInputChange} />
                <input type="number" name="victoryHexY" min="0" max="99999" value={scenarioSettings.victoryHexY} onChange={handleInputChange} />

                <label>Victory Tech:</label>
                <input type="number" name="victoryTech" min="0" max="99999" value={scenarioSettings.victoryTech} onChange={handleInputChange} />
            </div>

            <div className="scenario-group">
                <h3>Starting Conditions</h3>
                <label>Resources Level:</label>
                <select name="resourcesLevel" value={scenarioSettings.resourcesLevel} onChange={handleInputChange}>
                    <option value="depleted">Depleted</option>
                    <option value="abundant">Abundant</option>
                </select>

                <label>Initial Funds:</label>
                <select name="initialFunds" value={scenarioSettings.initialFunds} onChange={handleInputChange}>
                    <option value="no new bonds">No New Bonds</option>
                    <option value="high">High</option>
                    <option value="low">Low</option>
                </select>
            </div>

            <div className="scenario-group">
                <h3>AI Settings</h3>
                <label>Global AI Stance:</label>
                <select name="globalAIStance" value={scenarioSettings.globalAIStance} onChange={handleInputChange}>
                    <option value="normal">Normal</option>
                    <option value="passive">Passive</option>
                    <option value="aggressive">Aggressive</option>
                </select>

                <label>Nuke Effect:</label>
                <select name="nukeEffect" value={scenarioSettings.nukeEffect} onChange={handleInputChange}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>

                <label>Approval Effect:</label>
                <select name="approvalEffect" value={scenarioSettings.approvalEffect} onChange={handleInputChange}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
            </div>

            <div className="scenario-group">
                <h3>Graphics Options</h3>
                <label>GUI Level:</label>
                <select name="guiLevel" value={scenarioSettings.guiLevel} onChange={handleInputChange}>
                    <option value="skin 0">Skin 0</option>
                    <option value="skin 1">Skin 1</option>
                </select>

                <label>Map Splash:</label>
                <input type="number" name="mapSplash" min="0" max="9999" value={scenarioSettings.mapSplash} onChange={handleInputChange} />

                <label>Map Music:</label>
                <input type="number" name="mapMusic" min="0" max="9999" value={scenarioSettings.mapMusic} onChange={handleInputChange} />
            </div>

            <div className="scenario-group">
                <h3>Miscellaneous</h3>
                <label>Starting Year:</label>
                <input type="number" name="startingYear" min="0" max="999" value={scenarioSettings.startingYear} onChange={handleInputChange} />

                <label>Tech Tree Default:</label>
                <input type="text" name="techTreeDefault" value={scenarioSettings.techTreeDefault} onChange={handleInputChange} />

                <label>Region Allies:</label>
                <input type="text" name="regionAllies" value={scenarioSettings.regionAllies} onChange={handleInputChange} />

                <label>Region Axis:</label>
                <input type="text" name="regionAxis" value={scenarioSettings.regionAxis} onChange={handleInputChange} />

                <label>Sphere NN:</label>
                <input type="text" name="sphereNN" value={scenarioSettings.sphereNN} onChange={handleInputChange} />
            </div>

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
        </div>
    );
};

export default ScenarioPage;
