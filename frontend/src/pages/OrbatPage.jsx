import React, { useState, useEffect } from 'react';
import '../assets/styles/OrbatPage.css'; // Ensure you have the appropriate CSS
import debounce from 'lodash/debounce';

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
        { id: 101, name: 'Unit Alpha', class: 'Infantry', year: 2020, region: 'Region A' },
        { id: 102, name: 'Unit Beta', class: 'Armor', year: 2019, region: 'Region B' },
        { id: 103, name: 'Unit Gamma', class: 'Artillery', year: 2018, region: 'Region C' }
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
                    // Deep copy units to avoid mutating state directly
                    const unitsCopy = data.units.map(unit => ({ ...unit }));
                    setOrbatUnits(unitsCopy);
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

    // Handle changes in Unit filters
    const handleUnitIDFilterChange = (e) => {
        setUnitIDFilter(e.target.value);
    };

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
            Name: unit.name,
            Class: unit.class,
            // Additional default values can be set here
            X: 0,
            Y: 0,
            Status: 'Active',
            // ... other fields as needed
        };

        if (settings.addToAllRegions) {
            // Add to all regions in one request
            addUnitToMultipleRegions(unitToAdd);
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

    const addUnitToMultipleRegions = (unit) => {
        const regionIds = regions.map(region => region.ID);
        fetch('http://localhost:5000/orbat/add_unit_multiple', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ regionIds, unit })
        })
            .then(response => response.json())
            .then(data => {
                console.log('Add unit to multiple regions response:', data);
                alert(data.message);
                // Optionally, refresh the current region's units
                fetchOrbatUnits(regionID);
            })
            .catch(error => {
                console.error('Error adding unit to multiple regions:', error);
                alert(`Error adding unit to multiple regions: ${error}`);
            });
    };

    // Debounced function to update unit in backend
    const updateUnitInBackend = debounce((regionId, unit) => {
        fetch('http://localhost:5000/orbat/update_unit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ regionId, unit })
        })
            .then(response => response.json())
            .then(data => {
                console.log(`Unit ${unit.unitId} updated:`, data);
            })
            .catch(error => {
                console.error(`Error updating unit ${unit.unitId}:`, error);
            });
    }, 500);

    // Handle input changes in units table
    const handleUnitChange = (index, field, value) => {
        setOrbatUnits(prevUnits => {
            const updatedUnits = [...prevUnits];
            const unit = { ...updatedUnits[index], [field]: value };
            updatedUnits[index] = unit;
            // Update backend
            updateUnitInBackend(regionID, unit);
            return updatedUnits;
        });
    };

    // Columns that are string inputs
    const stringFields = ['LocName', 'Status', 'BattName', 'Special', 'Facing', 'TargetRole', 'StatustoBattC', 'StatustoBattN', 'Name', 'Class'];

    // Columns that are numerical inputs
    const numericalFields = ['unitId', 'X', 'Y', 'Quantity', 'BattNum', 'Entrench', 'Eff', 'Exp', 'Str', 'MaxStr', 'DaysLeft', 'GroupId'];

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
                                {/* <th>Region ID</th> */}
                                <th>Unit ID</th>
                                <th>X</th>
                                <th>Y</th>
                                <th>Quantity</th>
                                <th>Status</th>
                                <th>Name</th>
                                <th>Entrenchment</th>
                                <th>Experience</th>
                                <th>LocName</th>
                                <th>BattNum</th>
                                <th>BattName</th>
                                <th>Eff</th>
                                <th>Special</th>
                                <th>Str</th>
                                <th>MaxStr</th>
                                <th>DaysLeft</th>
                                <th>Facing</th>
                                <th>Group#</th>
                                <th>TargetRole</th>
                                <th>StatustoBattC</th>
                                <th>StatustoBattN</th>
                                <th>Class</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="21">Loading units...</td>
                                </tr>
                            ) : orbatUnits.length > 0 ? (
                                orbatUnits.map((unit, index) => (
                                    <tr key={index}>
                                        {/* <td>{regionID}</td> */}
                                        {numericalFields.map(field => (
                                            <td key={field}>
                                                <input
                                                    type="number"
                                                    value={unit[field] !== undefined ? unit[field] : ''}
                                                    onChange={(e) => handleUnitChange(index, field, e.target.value !== '' ? parseInt(e.target.value) : '')}
                                                />
                                            </td>
                                        ))}
                                        {stringFields.map(field => (
                                            <td key={field}>
                                                <input
                                                    type="text"
                                                    value={unit[field] !== undefined ? unit[field] : ''}
                                                    onChange={(e) => handleUnitChange(index, field, e.target.value)}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="21">No units found for this region.</td>
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
                    {/* Add more classes as needed */}
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
                                <th>Name</th>
                                <th>Class</th>
                                <th>Year</th>
                                <th>Region</th>
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
                                    <td>{unit.name}</td>
                                    <td>{unit.class}</td>
                                    <td>{unit.year}</td>
                                    <td>{unit.region}</td>
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
