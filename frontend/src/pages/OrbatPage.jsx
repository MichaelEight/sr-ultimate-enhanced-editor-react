// OrbatPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import '../assets/styles/OrbatPage.css'; // Adjust the path if necessary

const OrbatPage = ({ activeTab }) => {
  // State variables
  const [regionID, setRegionID] = useState('');
  const [regionName, setRegionName] = useState('');
  const [regionsList, setRegionsList] = useState([]);
  const [settings, setSettings] = useState({
    branch: 'All',
    classType: 'Infantry',
    showKnownDesigns: false,
    showRegionalUnits: false,
    addToAllRegions: false,
    addBy: 1,
  });
  const [units, setUnits] = useState([]);
  const [availableUnits, setAvailableUnits] = useState([]);
  const [unitFilter, setUnitFilter] = useState({ id: '', name: '' });

  // Fetch regions and units data from the backend
  const fetchOrbatData = useCallback(() => {
    fetch('http://localhost:5000/orbat')
      .then((response) => response.json())
      .then((data) => {
        if (data && data.orbat_data) {
          setRegionsList(data.orbat_data);
          console.log('Fetched Orbat data.');
        }
      })
      .catch((error) => {
        console.error('Error fetching Orbat data:', error);
      });
  }, []);

  // Check if Orbat data needs to be fetched
  const checkAndFetchOrbatData = useCallback(() => {
    fetch('http://localhost:5000/check_seen_since_last_update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tab: 'orbat' }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data && data.seenSinceLastUpdate === false) {
          fetchOrbatData();
        } else {
          console.log('Orbat data is up to date.');
        }
      })
      .catch((error) => {
        console.error('Error checking seenSinceLastUpdate for Orbat:', error);
      });
  }, [fetchOrbatData]);

  useEffect(() => {
    if (activeTab === '/orbat') {
      checkAndFetchOrbatData();
    }
  }, [activeTab, checkAndFetchOrbatData]);

  // Handle settings change
  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle adding a unit
  const handleAddClick = (unit) => {
    console.log(`Add button clicked for unit ID ${unit.unitId}`);
    // Implement logic to add unit to the selected region
    if (!regionID) {
      alert('Please select a region ID.');
      return;
    }

    // Prepare the unit data to be added
    const newUnit = { ...unit };
    // Send request to backend to add the unit
    fetch('http://localhost:5000/orbat/add_unit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ regionId: parseInt(regionID, 10), unit: newUnit }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        console.log('Unit added successfully');
        // Refresh the units list
        fetchOrbatData();
      })
      .catch((error) => {
        console.error('Error adding unit:', error);
      });
  };

  // Handle selection of a region
  const handleRegionIDChange = (e) => {
    const id = e.target.value;
    setRegionID(id);

    // Find the region name based on ID
    const region = regionsList.find((r) => r.regionId === parseInt(id, 10));
    setRegionName(region ? `Region ${region.regionId}` : '');

    // Set units for the selected region
    setUnits(region ? region.units : []);
  };

  // Handle unit data change (e.g., updating unit's properties)
  const handleUnitChange = (index, field, value) => {
    setUnits((prevUnits) => {
      const updatedUnits = [...prevUnits];
      updatedUnits[index] = { ...updatedUnits[index], [field]: value };
      return updatedUnits;
    });
  };

  // Handle saving changes to a unit
  const handleSaveUnit = (unit) => {
    // Send update to backend
    fetch('http://localhost:5000/orbat/update_unit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ regionId: parseInt(regionID, 10), unit }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        console.log('Unit updated successfully');
        // Optionally refetch data
        fetchOrbatData();
      })
      .catch((error) => {
        console.error('Error updating unit:', error);
      });
  };

  // Fetch available units (this could be from another endpoint or static data)
  useEffect(() => {
    // For demonstration, using static data
    setAvailableUnits([
      { unitId: 201, name: 'Available Unit A' },
      { unitId: 202, name: 'Available Unit B' },
      { unitId: 203, name: 'Available Unit C' },
    ]);
  }, []);

  // Filter available units based on input
  const filteredAvailableUnits = availableUnits.filter((unit) => {
    const idMatch = unitFilter.id ? unit.unitId.toString().includes(unitFilter.id) : true;
    const nameMatch = unitFilter.name
      ? unit.name.toLowerCase().includes(unitFilter.name.toLowerCase())
      : true;
    return idMatch && nameMatch;
  });

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
          onChange={handleRegionIDChange}
          min="0"
          max="99999"
        />

        <label>Name:</label>
        <select value={regionName} onChange={(e) => setRegionName(e.target.value)}>
          <option value="">Select Region</option>
          {regionsList.map((region) => (
            <option key={region.regionId} value={`Region ${region.regionId}`}>
              Region {region.regionId}
            </option>
          ))}
        </select>

        {units.length > 0 && (
          <div className="table-wrapper">
            <table className="region-table">
              <thead>
                <tr>
                  <th>Unit ID</th>
                  <th>X</th>
                  <th>Y</th>
                  <th>Loc Name</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  {/* Add other unit fields as needed */}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {units.map((unit, index) => (
                  <tr key={index}>
                    <td>{unit.unitId}</td>
                    <td>
                      <input
                        type="number"
                        value={unit.X || ''}
                        onChange={(e) => handleUnitChange(index, 'X', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={unit.Y || ''}
                        onChange={(e) => handleUnitChange(index, 'Y', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={unit.LocName || ''}
                        onChange={(e) => handleUnitChange(index, 'LocName', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={unit.Quantity || ''}
                        onChange={(e) => handleUnitChange(index, 'Quantity', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={unit.Status || ''}
                        onChange={(e) => handleUnitChange(index, 'Status', e.target.value)}
                      />
                    </td>
                    {/* Add other unit fields as needed */}
                    <td>
                      <button onClick={() => handleSaveUnit(unit)}>Save</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
          type="text"
          value={unitFilter.id}
          onChange={(e) => setUnitFilter({ ...unitFilter, id: e.target.value })}
          placeholder="Filter by ID"
        />

        <label>Name:</label>
        <input
          type="text"
          value={unitFilter.name}
          onChange={(e) => setUnitFilter({ ...unitFilter, name: e.target.value })}
          placeholder="Filter by Name"
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
              {filteredAvailableUnits.map((unit, index) => (
                <tr key={index}>
                  <td>
                    <button onClick={() => handleAddClick(unit)}>Add</button>
                  </td>
                  <td>{unit.unitId}</td>
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
