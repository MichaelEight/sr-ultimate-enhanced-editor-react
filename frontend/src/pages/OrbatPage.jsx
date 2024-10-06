import React, { useState, useEffect, useCallback, useRef } from 'react';
import debounce from 'lodash/debounce';
import '../assets/styles/OrbatPage.css'; // Ensure you have the appropriate CSS

const OrbatPage = ({ activeTab, project, setProject }) => {
    // States for Regions, Settings, and Units
    const [regionID, setRegionID] = useState('');
    const [regionName, setRegionName] = useState('');
    const [regions, setRegions] = useState([]);
    const [orbatUnits, setOrbatUnits] = useState([]);
    const [settings, setSettings] = useState({
        branch: 'All',
        classType: 'Infantry',
        showKnownDesigns: false,
        showRegionalUnits: false,
        addToAllRegions: false,
        addBy: 1
    });
    const [allUnits, setAllUnits] = useState([
        { id: 101, name: 'Unit Alpha' },
        { id: 102, name: 'Unit Beta' },
        { id: 103, name: 'Unit Gamma' }
    ]);
    const [unitIDFilter, setUnitIDFilter] = useState('');
    const [unitNameFilter, setUnitNameFilter] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch regions data from backend
    useEffect(() => {
        fetch('http://localhost:5000/regions')
            .then(response => response.json())
            .then(data => {
                if (data && data.regions) {
                    setRegions(data.regions);
                    // Set default regionID and regionName
                    if (data.regions.length > 0) {
                        setRegionID(data.regions[0].ID);
                        setRegionName(data.regions[0].Properties.regionname);
                    }
                }
            })
            .catch(error => {
                console.error('Error fetching regions:', error);
            });
    }, []);

    // Update regionName when regionID changes
    useEffect(() => {
        const selectedRegion = regions.find(region => region.ID === parseInt(regionID));
        if (selectedRegion) {
            setRegionName(selectedRegion.Properties.regionname);
            fetchOrbatUnits(regionID);
        } else {
            setRegionName('');
            setOrbatUnits([]);
        }
    }, [regionID, regions]);

    // Update regionID when regionName changes
    useEffect(() => {
        const selectedRegion = regions.find(region => region.Properties.regionname === regionName);
        if (selectedRegion) {
            setRegionID(selectedRegion.ID);
            fetchOrbatUnits(selectedRegion.ID);
        }
    }, [regionName, regions]);

    const fetchOrbatUnits = (regionId) => {
        if (!regionId) return;
        setLoading(true);
        fetch(`http://localhost:5000/orbat/${regionId}`)
            .then(response => response.json())
            .then(data => {
                if (data && data.units) {
                    setOrbatUnits(data.units);
                } else {
                    setOrbatUnits([]);
                }
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching orbat units:', error);
                setLoading(false);
            });
    };

    // Handle changes in settings
    const handleSettingsChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle changes in Unit ID filter
    const handleUnitIDFilterChange = (e) => {
        setUnitIDFilter(e.target.value);
    };

    // Handle changes in Unit Name filter
    const handleUnitNameFilterChange = (e) => {
        setUnitNameFilter(e.target.value);
    };

    // Filtered units based on filters
    const filteredUnits = allUnits.filter(unit => {
        const idMatch = unitIDFilter ? unit.id.toString().startsWith(unitIDFilter) : true;
        const nameMatch = unitNameFilter ? unit.name.toLowerCase().includes(unitNameFilter.toLowerCase()) : true;
        return idMatch && nameMatch;
    });

    const handleAddClick = (unit) => {
        const quantity = settings.addBy || 1;
        const unitToAdd = {
            unitId: unit.id,
            Quantity: quantity,
            // Additional fields can be added here
        };

        if (settings.addToAllRegions) {
            // Add to all regions
            regions.forEach(region => {
                addUnitToRegion(region.ID, unitToAdd);
            });
        } else {
            // Add to selected region
            addUnitToRegion(regionID, unitToAdd);
        }
    };

    const addUnitToRegion = (regionId, unit) => {
        fetch('http://localhost:5000/orbat/add_unit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ regionId, unit })
        })
            .then(response => response.json())
            .then(data => {
                console.log(`Unit added to region ${regionId}:`, data);
                if (parseInt(regionId) === parseInt(regionID)) {
                    // If the current region, refresh the units
                    fetchOrbatUnits(regionId);
                }
            })
            .catch(error => {
                console.error(`Error adding unit to region ${regionId}:`, error);
            });
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
                    {regions.map(region => (
                        <option key={region.ID} value={region.Properties.regionname}>
                            {region.Properties.regionname}
                        </option>
                    ))}
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
                            {loading ? (
                                <tr>
                                    <td colSpan="4">Loading units...</td>
                                </tr>
                            ) : orbatUnits.length > 0 ? (
                                orbatUnits.map((unit, index) => (
                                    <tr key={index}>
                                        <td>{regionID}</td>
                                        <td>{unit.unitId}</td>
                                        <td>{unit.X}</td>
                                        <td>{unit.Y}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4">No units found for this region.</td>
                                </tr>
                            )}
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
                <input
                    type="number"
                    min="0"
                    max="99999"
                    value={unitIDFilter}
                    onChange={handleUnitIDFilterChange}
                />

                <label>Name:</label>
                <input
                    type="text"
                    value={unitNameFilter}
                    onChange={handleUnitNameFilterChange}
                />

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
                            {filteredUnits.map((unit, index) => (
                                <tr key={index}>
                                    <td>
                                        <button onClick={() => handleAddClick(unit)}>
                                            {settings.addToAllRegions ? 'Add to All' : 'Add'}
                                        </button>
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
