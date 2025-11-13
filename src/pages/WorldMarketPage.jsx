// WorldMarketPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useProject } from '../context/ProjectContext';
import '../assets/styles/WorldMarketPage.css';

const WorldMarketPage = ({ activeTab }) => {
  const { projectData, updateData } = useProject();
  const [worldMarketData, setWorldMarketData] = useState({});

  // Load world market data from ProjectContext
  const loadWorldMarketData = useCallback(() => {
    if (projectData && projectData.worldmarket_data) {
      setWorldMarketData(projectData.worldmarket_data);
      console.log('Loaded world market data from context');
    }
  }, [projectData]);

  useEffect(() => {
    if (activeTab === '/worldmarket') {
      loadWorldMarketData();
    }
  }, [activeTab, loadWorldMarketData]);

  // Handle input changes for nested properties
  const handleInputChange = (category, field, value) => {
    const numericValue = value === '' ? '' : Number(value);

    // Update local state
    setWorldMarketData((prevData) => ({
      ...prevData,
      [category]: {
        ...prevData[category],
        [field]: numericValue
      }
    }));

    // Update in ProjectContext
    const updatedWorldMarket = {
      ...projectData.worldmarket_data,
      [category]: {
        ...projectData.worldmarket_data[category],
        [field]: numericValue
      }
    };
    updateData('worldmarket_data', updatedWorldMarket);
  };

  const settings = worldMarketData.settings || {};
  const military = worldMarketData.military || {};
  const economic = worldMarketData.economic || {};

  return (
    <div className="worldmarket-page">
      <h2>World Market Settings</h2>

      {/* Settings Group */}
      <div className="worldmarket-group">
        <h3>General Settings</h3>
        <div className="field-row">
          <label>Prime Rate:</label>
          <input
            type="number"
            value={settings.primerate || 0}
            onChange={(e) => handleInputChange('settings', 'primerate', e.target.value)}
            step="0.01"
          />
        </div>
        <div className="field-row">
          <label>Social Adjustment:</label>
          <input
            type="number"
            value={settings.socadj || 0}
            onChange={(e) => handleInputChange('settings', 'socadj', e.target.value)}
            step="0.01"
          />
        </div>
        <div className="field-row">
          <label>WM Relation Rate:</label>
          <input
            type="number"
            value={settings.wmrelrate || 0}
            onChange={(e) => handleInputChange('settings', 'wmrelrate', e.target.value)}
          />
        </div>
      </div>

      {/* Military Defaults */}
      <div className="worldmarket-group">
        <h3>Battle Strength Defaults</h3>
        {military.battstrdefault && Object.entries(military.battstrdefault).map(([key, val]) => (
          <div key={key} className="field-row">
            <label>{key}:</label>
            <input
              type="number"
              value={val || 0}
              onChange={(e) => {
                const updated = {
                  ...military.battstrdefault,
                  [key]: Number(e.target.value) || 0
                };
                const updatedWorldMarket = {
                  ...projectData.worldmarket_data,
                  military: {
                    ...projectData.worldmarket_data.military,
                    battstrdefault: updated
                  }
                };
                updateData('worldmarket_data', updatedWorldMarket);
                setWorldMarketData(updatedWorldMarket);
              }}
            />
          </div>
        ))}
      </div>

      {/* Economic Defaults */}
      <div className="worldmarket-group">
        <h3>Social Defaults</h3>
        {economic.socialdefaults && Object.entries(economic.socialdefaults).map(([key, val]) => (
          <div key={key} className="field-row">
            <label>{key}:</label>
            <input
              type="number"
              value={val || 0}
              onChange={(e) => {
                const updated = {
                  ...economic.socialdefaults,
                  [key]: Number(e.target.value) || 0
                };
                const updatedWorldMarket = {
                  ...projectData.worldmarket_data,
                  economic: {
                    ...projectData.worldmarket_data.economic,
                    socialdefaults: updated
                  }
                };
                updateData('worldmarket_data', updatedWorldMarket);
                setWorldMarketData(updatedWorldMarket);
              }}
            />
          </div>
        ))}
      </div>

      <div className="worldmarket-group">
        <h3>Hex Resource Multipliers</h3>
        {economic.hexresmults && Object.entries(economic.hexresmults).map(([key, val]) => (
          <div key={key} className="field-row">
            <label>{key}:</label>
            <input
              type="number"
              value={val || 0}
              onChange={(e) => {
                const updated = {
                  ...economic.hexresmults,
                  [key]: Number(e.target.value) || 0
                };
                const updatedWorldMarket = {
                  ...projectData.worldmarket_data,
                  economic: {
                    ...projectData.worldmarket_data.economic,
                    hexresmults: updated
                  }
                };
                updateData('worldmarket_data', updatedWorldMarket);
                setWorldMarketData(updatedWorldMarket);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorldMarketPage;
