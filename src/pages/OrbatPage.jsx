// OrbatPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useProject } from '../context/ProjectContext';
import '../assets/styles/OrbatPage.css';

const OrbatPage = ({ activeTab }) => {
  const { projectData, updateData } = useProject();
  const [regions, setRegions] = useState([]);
  const [selectedRegionId, setSelectedRegionId] = useState(null);
  const [orbatData, setOrbatData] = useState([]);
  const [units, setUnits] = useState([]);

  // Load regions from ProjectContext
  useEffect(() => {
    if (projectData && projectData.regions_data) {
      setRegions(projectData.regions_data);
      if (projectData.regions_data.length > 0 && !selectedRegionId) {
        setSelectedRegionId(projectData.regions_data[0].ID);
      }
    }
  }, [projectData, selectedRegionId]);

  // Load ORBAT data
  useEffect(() => {
    if (projectData && projectData.orbat_data?.OOB_Data) {
      setOrbatData(projectData.orbat_data.OOB_Data);
    }
  }, [projectData]);

  // Load units for selected region
  useEffect(() => {
    if (selectedRegionId !== null) {
      const regionOrbat = orbatData.find(r => r.regionId === selectedRegionId);
      setUnits(regionOrbat?.units || []);
    }
  }, [selectedRegionId, orbatData]);

  // Handle unit changes
  const handleUnitChange = (unitIndex, field, value) => {
    const updatedUnits = [...units];
    updatedUnits[unitIndex] = {
      ...updatedUnits[unitIndex],
      [field]: value
    };
    setUnits(updatedUnits);

    // Update in ProjectContext
    const updatedOrbat = orbatData.map(r =>
      r.regionId === selectedRegionId
        ? { ...r, units: updatedUnits }
        : r
    );

    // If region doesn't exist in ORBAT, add it
    if (!orbatData.find(r => r.regionId === selectedRegionId)) {
      updatedOrbat.push({
        regionId: selectedRegionId,
        units: updatedUnits
      });
    }

    updateData('orbat_data', { OOB_Data: updatedOrbat });
  };

  // Add new unit
  const handleAddUnit = () => {
    const newUnit = {
      unitId: 0,
      X: 0,
      Y: 0,
      LocName: '',
      Quantity: 0,
      Status: '',
      BattNum: 0,
      BattName: '',
      Entrench: 0,
      Eff: 100,
      Exp: 0,
      Special: '',
      Str: 0,
      MaxStr: 0,
      DaysLeft: 0,
      Facing: '',
      GroupId: 0,
      TargetRole: '',
      StatustoBattC: '',
      StatustoBattN: ''
    };

    const updatedUnits = [...units, newUnit];
    setUnits(updatedUnits);

    // Update in ProjectContext
    const existingRegionIndex = orbatData.findIndex(r => r.regionId === selectedRegionId);
    let updatedOrbat;

    if (existingRegionIndex >= 0) {
      updatedOrbat = orbatData.map(r =>
        r.regionId === selectedRegionId
          ? { ...r, units: updatedUnits }
          : r
      );
    } else {
      updatedOrbat = [...orbatData, { regionId: selectedRegionId, units: updatedUnits }];
    }

    updateData('orbat_data', { OOB_Data: updatedOrbat });
  };

  const unitFields = [
    { name: 'unitId', label: 'Unit ID', type: 'number' },
    { name: 'X', label: 'X', type: 'number' },
    { name: 'Y', label: 'Y', type: 'number' },
    { name: 'LocName', label: 'Location', type: 'text' },
    { name: 'Quantity', label: 'Quantity', type: 'number' },
    { name: 'Status', label: 'Status', type: 'text' },
    { name: 'BattNum', label: 'Battalion #', type: 'number' },
    { name: 'BattName', label: 'Battalion Name', type: 'text' },
    { name: 'Entrench', label: 'Entrenchment', type: 'number' },
    { name: 'Eff', label: 'Efficiency', type: 'number' },
    { name: 'Exp', label: 'Experience', type: 'number' },
    { name: 'Special', label: 'Special', type: 'text' },
    { name: 'Str', label: 'Strength', type: 'number' },
    { name: 'MaxStr', label: 'Max Strength', type: 'number' },
    { name: 'DaysLeft', label: 'Days Left', type: 'number' }
  ];

  return (
    <div className="orbat-page">
      <h2>ORBAT (Order of Battle)</h2>

      {/* Region Selection */}
      <div className="region-selection">
        <label>Select Region:</label>
        <select
          value={selectedRegionId || ''}
          onChange={(e) => setSelectedRegionId(parseInt(e.target.value, 10))}
        >
          {regions.map(region => (
            <option key={region.ID} value={region.ID}>
              {region.Properties?.regionname || `Region ${region.ID}`}
            </option>
          ))}
        </select>
      </div>

      {/* Add Unit Button */}
      <div className="button-group">
        <button onClick={handleAddUnit}>Add New Unit</button>
      </div>

      {/* Units Table */}
      <div className="orbat-table-wrapper">
        <table className="orbat-table">
          <thead>
            <tr>
              {unitFields.map(field => (
                <th key={field.name}>{field.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {units.length > 0 ? (
              units.map((unit, index) => (
                <tr key={index}>
                  {unitFields.map(field => (
                    <td key={field.name}>
                      <input
                        type={field.type}
                        value={unit[field.name] || (field.type === 'number' ? 0 : '')}
                        onChange={(e) => {
                          const value = field.type === 'number'
                            ? parseInt(e.target.value, 10) || 0
                            : e.target.value;
                          handleUnitChange(index, field.name, value);
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={unitFields.length}>No units available for this region</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrbatPage;
