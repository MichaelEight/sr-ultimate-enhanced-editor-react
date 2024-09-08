import React, { useState } from 'react';
import '../assets/styles/OrbatPage.css'; // Assuming you have a CSS file for this page

const OrbatPage = () => {
    // States for Regions, Settings, and Units
    const [regionID, setRegionID] = useState(0);
    const [regionName, setRegionName] = useState('');
    const [settings, setSettings] = useState({
        branch: 'All',
        classType: 'Infantry',
        showKnownDesigns: false,
        showRegionalUnits: false,
        addToAllRegions: false,
        addBy: 1
    });
    const [units, setUnits] = useState([
        { id: 101, name: 'Unit Alpha' },
        { id: 102, name: 'Unit Beta' },
        { id: 103, name: 'Unit Gamma' }
    ]);

    const handleSettingsChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAddClick = (index) => {
        console.log(`Add button clicked for row ${index}`);
        // Implement your logic here for adding the unit or interacting with the row
    };

    return (
        <div className="orbat-page">
            <h2>Orbat</h2>

            {/* Group: Regions */}
            <div className="regions-group">
                <h3>Regions</h3>
                <label>ID:</label>
                <input
                    type="number"
                    value={regionID}
                    onChange={(e) => setRegionID(e.target.value)}
                    min="0"
                    max="99999"
                />

                <label>Name:</label>
                <select value={regionName} onChange={(e) => setRegionName(e.target.value)}>
                    <option value="Region Alpha">Region Alpha</option>
                    <option value="Region Beta">Region Beta</option>
                    <option value="Region Gamma">Region Gamma</option>
                </select>

                <div className="table-wrapper">
                    <table className="region-table">
                        <thead>
                            <tr>
                                <th>Region ID</th>
                                <th>Unit ID</th>
                                <th>X</th>
                                <th>Y</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>101</td>
                                <td>120</td>
                                <td>340</td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>102</td>
                                <td>140</td>
                                <td>360</td>
                            </tr>
                            <tr>
                                <td>3</td>
                                <td>103</td>
                                <td>160</td>
                                <td>380</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Group: Settings */}
            <div className="settings-group">
                <h3>Settings</h3>
                <label>Branch:</label>
                <select name="branch" value={settings.branch} onChange={handleSettingsChange}>
                    <option value="All">All</option>
                    <option value="Land">Land</option>
                    <option value="Air">Air</option>
                    <option value="Naval">Naval</option>
                </select>

                <label>Class:</label>
                <select name="classType" value={settings.classType} onChange={handleSettingsChange}>
                    <option value="Infantry">Infantry</option>
                    <option value="Armor">Armor</option>
                    <option value="Artillery">Artillery</option>
                </select>

                <label>
                    <input
                        type="checkbox"
                        name="showKnownDesigns"
                        checked={settings.showKnownDesigns}
                        onChange={handleSettingsChange}
                    />
                    Show known designs
                </label>

                <label>
                    <input
                        type="checkbox"
                        name="showRegionalUnits"
                        checked={settings.showRegionalUnits}
                        onChange={handleSettingsChange}
                    />
                    Show regional units
                </label>

                <label>
                    <input
                        type="checkbox"
                        name="addToAllRegions"
                        checked={settings.addToAllRegions}
                        onChange={handleSettingsChange}
                    />
                    Add to all regions
                </label>

                <label>Add by:</label>
                <input
                    type="number"
                    name="addBy"
                    value={settings.addBy}
                    onChange={handleSettingsChange}
                    min="1"
                    max="9999"
                />
            </div>

            {/* Group: Units */}
            <div className="units-group">
                <h3>Units</h3>
                <label>ID:</label>
                <input type="number" min="0" max="99999" />

                <label>Name:</label>
                <input type="text" />

                <div className="table-wrapper">
                    <table className="units-table">
                        <thead>
                            <tr>
                                <th>Add</th>
                                <th>ID</th>
                                <th>Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {units.map((unit, index) => (
                                <tr key={index}>
                                    <td>
                                        <button onClick={() => handleAddClick(index)}>Add</button>
                                    </td>
                                    <td>{unit.id}</td>
                                    <td>{unit.name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OrbatPage;
