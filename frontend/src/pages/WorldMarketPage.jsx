// WorldMarketPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import '../assets/styles/WorldMarketPage.css'; // Adjust the path as needed

const WorldMarketPage = ({ activeTab }) => {
  const [worldMarketData, setWorldMarketData] = useState({});

  // Fetch world market data from backend
  const fetchWorldMarketData = useCallback(() => {
    fetch('http://localhost:5000/worldmarket')
      .then((response) => response.json())
      .then((data) => {
        if (data && data.worldmarket) {
          setWorldMarketData(data.worldmarket);
          console.log('Fetched latest world market data.');
          console.log(data.worldmarket);
          
        }
      })
      .catch((error) => {
        console.error('Error fetching world market data:', error);
      });
  }, []);

  // Check if world market data needs to be fetched
  const checkAndFetchWorldMarket = useCallback(() => {
    fetch('http://localhost:5000/check_seen_since_last_update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tab: 'worldmarket' }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data && data.seenSinceLastUpdate === false) {
          fetchWorldMarketData();
        } else {
          console.log('World market data is up to date.');
        }
      })
      .catch((error) => {
        console.error('Error checking seenSinceLastUpdate:', error);
      });
  }, [fetchWorldMarketData]);

  useEffect(() => {
    if (activeTab === '/worldmarket') {
      checkAndFetchWorldMarket();
    }
  }, [activeTab, checkAndFetchWorldMarket]);

  const handleInputChange = (fieldGroup, name, value) => {
    setWorldMarketData((prevData) => {
      const updatedData = { ...prevData };
      if (!updatedData[fieldGroup]) {
        updatedData[fieldGroup] = {};
      }
      updatedData[fieldGroup][name] = value;
      return updatedData;
    });

    // Send update to backend
    const payload = {
      fieldGroup,
      name,
      value,
    };
    fetch('http://localhost:5000/worldmarket/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        console.log('World market data updated successfully');
      })
      .catch((error) => {
        console.error('Error updating world market data:', error);
      });
  };

  const {
    settings = {},
    military = {},
    economic = {},
    weather = {},
  } = worldMarketData;

  // Define labels for garrison progression and battalion sizes
  const garrisonLabels = ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6'];
  const battalionTypes = [
    'Infantry',
    'Recon',
    'Artillery',
    'Armor',
    'Airborne',
    'Engineer',
  ];

  const resourceMultipliersLabels = [
    'agriculture',
    'rubber',
    'timber',
    'petroleum',
    'coal',
    'ore',
    'uranium',
    'electricity',
  ];

  const socialSpendingLabels = [
    'healthcare',
    'education',
    'familysubsidy',
    'lawenforcement',
    'infrastructure',
    'socialassistance',
    'culturalsubsidy',
    'environment',
  ];

  return (
    <div className="world-market-page">
      <h2>World Market</h2>

      {/* Settings Group */}
      <div className="settings-group">
        <h3>Settings</h3>
        <label>Level:</label>
        <input
          type="number"
          value={settings.wmlevel || ''}
          onChange={(e) => handleInputChange('settings', 'wmlevel', e.target.value)}
          min="0"
          max="9999999999"
        />
        <label>Duration:</label>
        <input
          type="number"
          value={settings.wmduration || ''}
          onChange={(e) => handleInputChange('settings', 'wmduration', e.target.value)}
          min="0"
          max="9999999999"
        />
        <label>Base GDPC:</label>
        <input
          type="number"
          value={settings.basegdpc || ''}
          onChange={(e) => handleInputChange('settings', 'basegdpc', e.target.value)}
          min="0"
          max="9999999999"
        />
      </div>

      {/* Military Group */}
      <div className="military-group">
        <h3>Military</h3>
        {/* Garrison Progression */}
        <label>Garrison Progression:</label>
        <div className="table-wrapper">
          <table className="garrison-progression-table">
            <tbody>
              {garrisonLabels.map((label, index) => (
                <tr key={index}>
                  <td>{label}</td>
                  <td>
                    <input
                      type="number"
                      value={
                        military.garrisonprogression
                          ? military.garrisonprogression[index] || ''
                          : ''
                      }
                      onChange={(e) =>
                        handleInputChange(
                          'military',
                          `garrisonprogression[${index}]`,
                          e.target.value
                        )
                      }
                      min="0"
                      max="9999999999"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Battalion Size */}
        <label>Battalion Size:</label>
        <div className="table-wrapper">
          <table className="battalion-size-table">
            <tbody>
              {battalionTypes.map((type, index) => (
                <tr key={type}>
                  <td>{type}</td>
                  <td>
                    <input
                      type="number"
                      value={
                        military.battstrdefault
                          ? military.battstrdefault[type.toLowerCase()] || ''
                          : ''
                      }
                      onChange={(e) =>
                        handleInputChange(
                          'military',
                          `battstrdefault.${type.toLowerCase()}`,
                          e.target.value
                        )
                      }
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

      {/* Economic Group */}
      <div className="economic-group">
        <h3>Economic</h3>
        {/* On Hex Resource Multipliers */}
        <label>On Hex Resource Multipliers:</label>
        <div className="table-wrapper">
          <table className="resource-multipliers-table">
            <tbody>
              {resourceMultipliersLabels.map((resource) => (
                <tr key={resource}>
                  <td>{resource.charAt(0).toUpperCase() + resource.slice(1)}</td>
                  <td>
                    <input
                      type="number"
                      value={
                        economic.hexresmults
                          ? economic.hexresmults[resource] || ''
                          : ''
                      }
                      onChange={(e) =>
                        handleInputChange(
                          'economic',
                          `hexresmults.${resource}`,
                          e.target.value
                        )
                      }
                      min="0"
                      max="9999999999"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Social Spending Defaults */}
        <label>Social Spending Defaults:</label>
        <div className="table-wrapper">
          <table className="social-spending-table">
            <tbody>
              {socialSpendingLabels.map((category) => (
                <tr key={category}>
                  <td>{category.charAt(0).toUpperCase() + category.slice(1)}</td>
                  <td>
                    <input
                      type="number"
                      value={
                        economic.socialdefaults
                          ? economic.socialdefaults[category] || ''
                          : ''
                      }
                      onChange={(e) =>
                        handleInputChange(
                          'economic',
                          `socialdefaults.${category}`,
                          e.target.value
                        )
                      }
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

      {/* Weather Group */}
      <div className="weather-group">
        <h3>Weather</h3>
        <label>Days:</label>
        <input
          type="number"
          value={weather.days || ''}
          onChange={(e) => handleInputChange('weather', 'days', e.target.value)}
          min="0"
          max="9999999999"
        />

        {/* Weather Offset */}
        <label>Weather Offset:</label>
        <div className="table-wrapper">
          <table className="weather-offset-table">
            <tbody>
              {[...Array(8)].map((_, index) => (
                <tr key={index}>
                  <td>Offset {index + 1}</td>
                  <td>
                    <input
                      type="number"
                      value={
                        weather.weatheroffset
                          ? weather.weatheroffset[index] || ''
                          : ''
                      }
                      onChange={(e) =>
                        handleInputChange(
                          'weather',
                          `weatheroffset[${index}]`,
                          e.target.value
                        )
                      }
                      min="0"
                      max="9999999999"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Weather Speed */}
        <label>Weather Speed:</label>
        <div className="table-wrapper">
          <table className="weather-speed-table">
            <tbody>
              {[...Array(8)].map((_, index) => (
                <tr key={index}>
                  <td>Speed {index + 1}</td>
                  <td>
                    <input
                      type="number"
                      value={
                        weather.weatherspeed
                          ? weather.weatherspeed[index] || ''
                          : ''
                      }
                      onChange={(e) =>
                        handleInputChange(
                          'weather',
                          `weatherspeed[${index}]`,
                          e.target.value
                        )
                      }
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

export default WorldMarketPage;
