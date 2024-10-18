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

    // Define column configurations
    const columns = [
        { field: 'unitId', label: 'Unit ID', type: 'number', min: 0, max: 99999 },
        { field: 'X', label: 'X', type: 'number', min: 0, max: 99999 },
        { field: 'Y', label: 'Y', type: 'number', min: 0, max: 99999 },
        { field: 'Quantity', label: 'Quantity', type: 'number', min: 0, max: 99999 },
        { field: 'Status', label: 'Status', type: 'text' },
        { field: 'Name', label: 'Name', type: 'text' },
        { field: 'Entrench', label: 'Entrenchment', type: 'number', min: 0, max: 99999 },
        { field: 'Experience', label: 'Experience', type: 'number', min: 0, max: 99999 },
        { field: 'LocName', label: 'LocName', type: 'text' },
        { field: 'BattNum', label: 'BattNum', type: 'number', min: 0, max: 99999 },
        { field: 'BattName', label: 'BattName', type: 'text' },
        { field: 'Eff', label: 'Eff', type: 'number', min: 0, max: 99999 },
        { field: 'Special', label: 'Special', type: 'text' },
        { field: 'Str', label: 'Str', type: 'number', min: 0, max: 99999 },
        { field: 'MaxStr', label: 'MaxStr', type: 'number', min: 0, max: 99999 },
        { field: 'DaysLeft', label: 'DaysLeft', type: 'number', min: 0, max: 99999 },
        { field: 'Facing', label: 'Facing', type: 'text' },
        { field: 'GroupId', label: 'Group#', type: 'number', min: 0, max: 99999 },
        { field: 'TargetRole', label: 'TargetRole', type: 'text' },
        { field: 'StatustoBattC', label: 'StatustoBattC', type: 'text' },
        { field: 'StatustoBattN', label: 'StatustoBattN', type: 'text' },
        { field: 'Class', label: 'Class', type: 'text' },
    ];

    // Fetch regions data from backend
    useEffect(() => {
        fetch('http://localhost:5000/regions')
        .then(response => {
            if (!response.ok) {
            throw new Error('Failed to fetch regions');
            }
            return response.json();
        })
        .then(data => {
            if (data && data.regions) {
            setRegions(data.regions);
            // Set default regionID and regionName
            if (data.regions.length > 0) {
                setRegionID(data.regions[0].ID);
                setRegionName(data.regions[0].Properties.regionname);
            }
            } else {
            setRegions([]);
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
            // Include all required fields with default values
            X: 0,
            Y: 0,
            Status: 'Active',
            LocName: '',
            BattNum: 0,
            BattName: '',
            Entrench: 0,
            Eff: 0,
            Exp: 0,
            Special: '',
            Str: 0,
            MaxStr: 0,
            DaysLeft: 0,
            Facing: '',
            GroupId: 0,
            TargetRole: '',
            StatustoBattC: '',
            StatustoBattN: '',
            Experience: 0,
            // Add other fields if necessary
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
                if (data.unit) {
                    // Update the orbatUnits state with the new unit
                    setOrbatUnits(prevUnits => [...prevUnits, data.unit]);
                } else {
                    // Fetch the updated units from the backend
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
                // Optionally, refresh the current region's units
                fetchOrbatUnits(regionID);
            })
            .catch(error => {
                console.error('Error adding unit to multiple regions:', error);
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
                if (data.error) {
                    console.error(`Error updating unit ${unit.unitId}:`, data.error);
                }
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

    return (
        <div className="orbat-page">
            {/* Group: Regions */}
            <div className="orbat-group regions-group">
                <h3>Regions</h3>
                <div className="orbat-input-container">
                    <label htmlFor="orbat-region-id">ID:</label>
                    <input
                        type="number"
                        id="orbat-region-id"
                        value={regionID}
                        onChange={(e) => setRegionID(e.target.value)}
                        min="0"
                        max="99999"
                        className="orbat-input"
                    />
                </div>

                <div className="orbat-input-container">
                    <label htmlFor="orbat-region-name">Name:</label>
                    <select
                        id="orbat-region-name"
                        value={regionName}
                        onChange={(e) => setRegionName(e.target.value)}
                        className="orbat-select"
                    >
                        {regions.map(region => (
                            <option key={region.ID} value={region.Properties.regionname}>
                                {region.Properties.regionname}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="orbat-table-wrapper">
                    <table className="orbat-region-table">
                        <thead>
                            <tr>
                                {columns.map(col => (
                                    <th key={col.field}>{col.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={columns.length}>Loading units...</td>
                                </tr>
                            ) : orbatUnits.length > 0 ? (
                                orbatUnits.map((unit, index) => (
                                    <tr key={index}>
                                        {columns.map(col => (
                                            <td key={col.field}>
                                                <input
                                                    type={col.type}
                                                    value={unit[col.field] !== undefined && unit[col.field] !== null ? unit[col.field] : ''}
                                                    onChange={(e) => {
                                                        let value = e.target.value;
                                                        if (col.type === 'number') {
                                                            value = e.target.value !== '' ? parseInt(e.target.value) : '';
                                                        }
                                                        handleUnitChange(index, col.field, value);
                                                    }}
                                                    className="orbat-table-input"
                                                    min={col.min}
                                                    max={col.max}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length}>No units found for this region.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Group: Settings */}
            <div className="orbat-group settings-group">
                <h3>Settings</h3>
                <div className="orbat-input-container">
                    <label htmlFor="orbat-branch">Branch:</label>
                    <select
                        id="orbat-branch"
                        name="branch"
                        value={settings.branch}
                        onChange={handleSettingsChange}
                        className="orbat-select"
                    >
                        <option value="All">All</option>
                        <option value="Land">Land</option>
                        <option value="Air">Air</option>
                        <option value="Naval">Naval</option>
                    </select>
                </div>

                <div className="orbat-input-container">
                    <label htmlFor="orbat-class">Class:</label>
                    <select
                        id="orbat-class"
                        name="classType"
                        value={settings.classType}
                        onChange={handleSettingsChange}
                        className="orbat-select"
                    >
                        <option value="Infantry">Infantry</option>
                        <option value="Armor">Armor</option>
                        <option value="Artillery">Artillery</option>
                        {/* Add more classes as needed */}
                    </select>
                </div>

                <div className="orbat-checkbox-container">
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
                </div>

                <div className="orbat-input-container">
                    <label htmlFor="orbat-add-by">Add by:</label>
                    <input
                        type="number"
                        id="orbat-add-by"
                        name="addBy"
                        value={settings.addBy}
                        onChange={handleSettingsChange}
                        min="1"
                        max="9999"
                        className="orbat-input"
                    />
                </div>
            </div>

            {/* Group: Units */}
            <div className="orbat-group units-group">
                <h3>Units</h3>
                <div className="orbat-input-container">
                    <label htmlFor="orbat-unit-id-filter">ID:</label>
                    <input
                        type="number"
                        id="orbat-unit-id-filter"
                        min="0"
                        max="99999"
                        value={unitIDFilter}
                        onChange={handleUnitIDFilterChange}
                        className="orbat-input"
                    />
                </div>

                <div className="orbat-input-container">
                    <label htmlFor="orbat-unit-name-filter">Name:</label>
                    <input
                        type="text"
                        id="orbat-unit-name-filter"
                        value={unitNameFilter}
                        onChange={handleUnitNameFilterChange}
                        className="orbat-input"
                    />
                </div>

                <div className="orbat-table-wrapper">
                    <table className="orbat-units-table">
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
                                        <button
                                            onClick={() => handleAddClick(unit)}
                                            className="orbat-add-button"
                                        >
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
