import React, { useState } from 'react';
import '../assets/styles/WorldMarketPage.css'; // Assuming you have a CSS file for this page

const WorldMarket = () => {
    // States for inputs
    const [settings, setSettings] = useState({ level: 0, duration: 0, baseGDPC: 0 });
    const [military, setMilitary] = useState({
        garrisonProgression: Array(6).fill(0),
        battalionSize: [
            { type: 'Infantry', size: 0 },
            { type: 'Recon', size: 0 },
            { type: 'Artillery', size: 0 },
            { type: 'Armor', size: 0 },
            { type: 'Airborne', size: 0 },
            { type: 'Engineer', size: 0 }
        ]
    });
    const [economic, setEconomic] = useState({
        resourceMultipliers: [
            { resource: 'Agriculture', value: 0 },
            { resource: 'Rubber', value: 0 },
            { resource: 'Timber', value: 0 },
            { resource: 'Petroleum', value: 0 },
            { resource: 'Coal', value: 0 }
        ],
        socialSpendingDefaults: [
            { category: 'Healthcare', value: 0 },
            { category: 'Education', value: 0 },
            { category: 'Family Subsidy', value: 0 }
        ]
    });
    const [weather, setWeather] = useState({
        days: 0,
        weatherOffset: Array(8).fill(0),
        weatherSpeed: Array(8).fill(0)
    });

    const handleInputChange = (group, name, value) => {
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleMilitaryChange = (index, value, field) => {
        if (field === 'garrisonProgression') {
            const updated = [...military.garrisonProgression];
            updated[index] = value;
            setMilitary(prev => ({ ...prev, garrisonProgression: updated }));
        } else {
            const updated = [...military.battalionSize];
            updated[index][field] = value;
            setMilitary(prev => ({ ...prev, battalionSize: updated }));
        }
    };

    const handleEconomicChange = (index, value, field) => {
        const updated = [...economic[field]];
        updated[index].value = value;
        setEconomic(prev => ({ ...prev, [field]: updated }));
    };

    const handleWeatherChange = (index, value, field) => {
        const updated = [...weather[field]];
        updated[index] = value;
        setWeather(prev => ({ ...prev, [field]: updated }));
    };

    return (
        <div className="world-market-page">
            <h2>World Market</h2>

            {/* Group Settings */}
            <div className="settings-group">
                <h3>Settings</h3>
                <label>Level:</label>
                <input
                    type="number"
                    value={settings.level}
                    onChange={e => handleInputChange('settings', 'level', e.target.value)}
                    min="0"
                    max="9999999999"
                />
                <label>Duration:</label>
                <input
                    type="number"
                    value={settings.duration}
                    onChange={e => handleInputChange('settings', 'duration', e.target.value)}
                    min="0"
                    max="9999999999"
                />
                <label>Base GDPC:</label>
                <input
                    type="number"
                    value={settings.baseGDPC}
                    onChange={e => handleInputChange('settings', 'baseGDPC', e.target.value)}
                    min="0"
                    max="9999999999"
                />
            </div>

            {/* Group Military */}
            <div className="military-group">
                <h3>Military</h3>
                <label>Garrison Progression:</label>
                <div className="table-wrapper">
                    <table className="garrison-progression-table">
                        <tbody>
                            {military.garrisonProgression.map((value, index) => (
                                <tr key={index}>
                                    <td>
                                        <input
                                            type="number"
                                            value={value}
                                            onChange={e => handleMilitaryChange(index, e.target.value, 'garrisonProgression')}
                                            min="0"
                                            max="9999999999"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <label>Battalion Size:</label>
                <div className="table-wrapper">
                    <table className="battalion-size-table">
                        <tbody>
                            {military.battalionSize.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.type}</td>
                                    <td>
                                        <input
                                            type="number"
                                            value={item.size}
                                            onChange={e => handleMilitaryChange(index, e.target.value, 'size')}
                                            min="0"
                                            max="9999999999"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Group Economic */}
            <div className="economic-group">
                <h3>Economic</h3>
                <label>On Hex Resource Multipliers:</label>
                <div className="table-wrapper">
                    <table className="resource-multipliers-table">
                        <tbody>
                            {economic.resourceMultipliers.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.resource}</td>
                                    <td>
                                        <input
                                            type="number"
                                            value={item.value}
                                            onChange={e => handleEconomicChange(index, e.target.value, 'resourceMultipliers')}
                                            min="0"
                                            max="9999999999"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <label>Social Spending Defaults:</label>
                <div className="table-wrapper">
                    <table className="social-spending-table">
                        <tbody>
                            {economic.socialSpendingDefaults.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.category}</td>
                                    <td>
                                        <input
                                            type="number"
                                            value={item.value}
                                            onChange={e => handleEconomicChange(index, e.target.value, 'socialSpendingDefaults')}
                                            min="0"
                                            max="9999999999"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Group Weather */}
            <div className="weather-group">
                <h3>Weather</h3>
                <label>Days:</label>
                <input
                    type="number"
                    value={weather.days}
                    onChange={e => setWeather(prev => ({ ...prev, days: e.target.value }))}
                    min="0"
                    max="9999999999"
                />

                <label>Weather Offset:</label>
                <div className="table-wrapper">
                    <table className="weather-offset-table">
                        <tbody>
                            {weather.weatherOffset.map((value, index) => (
                                <tr key={index}>
                                    <td>
                                        <input
                                            type="number"
                                            value={value}
                                            onChange={e => handleWeatherChange(index, e.target.value, 'weatherOffset')}
                                            min="0"
                                            max="9999999999"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <label>Weather Speed:</label>
                <div className="table-wrapper">
                    <table className="weather-speed-table">
                        <tbody>
                            {weather.weatherSpeed.map((value, index) => (
                                <tr key={index}>
                                    <td>
                                        <input
                                            type="number"
                                            value={value}
                                            onChange={e => handleWeatherChange(index, e.target.value, 'weatherSpeed')}
                                            min="0"
                                            max="9999999999"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default WorldMarket;
