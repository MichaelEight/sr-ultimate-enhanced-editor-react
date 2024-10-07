// src/components/WorldMarketPage.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import debounce from 'lodash/debounce';
import '../assets/styles/WorldMarketPage.css'; // Ensure the path is correct

const WorldMarketPage = ({ activeTab }) => {
  const [worldMarketData, setWorldMarketData] = useState({});
  const [loading, setLoading] = useState(false);

  const isMounted = useRef(false);

  // Fetch world market data from backend
  const fetchWorldMarketData = useCallback(() => {
    setLoading(true);
    fetch('http://localhost:5000/worldmarket')
      .then((response) => response.json())
      .then((data) => {
        if (data && data.worldmarket) {
          setWorldMarketData(data.worldmarket);
          // Cache the data in localStorage
          localStorage.setItem('worldMarketData', JSON.stringify(data.worldmarket));
          console.log('Fetched and cached latest world market data.');
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching world market data:', error);
        setLoading(false);
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
          // Load from cache
          const cachedData = localStorage.getItem('worldMarketData');
          if (cachedData) {
            setWorldMarketData(JSON.parse(cachedData));
            console.log('Loaded world market data from cache.');
          }
        }
      })
      .catch((error) => {
        console.error('Error checking seenSinceLastUpdate:', error);
      });
  }, [fetchWorldMarketData]);

  useEffect(() => {
    isMounted.current = true;
    if (activeTab === '/worldmarket') {
      checkAndFetchWorldMarket();
    }
    return () => {
      isMounted.current = false;
    };
  }, [activeTab, checkAndFetchWorldMarket]);

  // Debounced function to handle world market updates
  const debouncedHandleUpdate = useRef(
    debounce((payload) => {
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
    }, 500)
  ).current;

  // Handle input changes in world market data
  const handleInputChange = (fieldGroup, name, value) => {
    // Convert value to integer if applicable
    const intValue = !isNaN(parseInt(value, 10)) ? parseInt(value, 10) : value;

    // Update local state
    setWorldMarketData((prevData) => {
      const updatedData = { ...prevData };
      if (!updatedData[fieldGroup]) {
        updatedData[fieldGroup] = {};
      }

      // Handle nested fields and arrays
      if (name.includes('.')) {
        const keys = name.split('.');
        let temp = updatedData[fieldGroup];
        for (let i = 0; i < keys.length - 1; i++) {
          if (!temp[keys[i]]) {
            temp[keys[i]] = {};
          }
          temp = temp[keys[i]];
        }
        temp[keys[keys.length - 1]] = intValue;
      } else if (name.match(/\[\d+\]$/)) {
        const arrayMatch = name.match(/^(\w+)\[(\d+)\]$/);
        if (arrayMatch) {
          const arrayName = arrayMatch[1];
          const index = parseInt(arrayMatch[2], 10);
          if (!Array.isArray(updatedData[fieldGroup][arrayName])) {
            updatedData[fieldGroup][arrayName] = [];
          }
          updatedData[fieldGroup][arrayName][index] = intValue;
        }
      } else {
        updatedData[fieldGroup][name] = intValue;
      }

      // Update localStorage
      localStorage.setItem('worldMarketData', JSON.stringify(updatedData));

      return updatedData;
    });

    // Send update to backend
    const payload = {
      fieldGroup,
      name,
      value: intValue,
    };
    debouncedHandleUpdate(payload);
  };

  // Destructure data with defaults
  const {
    settings = {},
    military = {},
    economic = {},
    weather = {},
  } = worldMarketData;

  // Define labels
  const garrisonLabels = ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6'];
  const battalionTypes = ['Infantry', 'Recon', 'Artillery', 'Armor', 'Airborne', 'Engineer'];
  const resourceMultipliersLabels = ['agriculture', 'rubber', 'timber', 'petroleum', 'coal', 'ore', 'uranium', 'electricity'];
  const socialSpendingLabels = ['healthcare', 'education', 'familysubsidy', 'lawenforcement', 'infrastructure', 'socialassistance', 'culturalsubsidy', 'environment'];

  return (
    <div className="world-market-page">
      <h2>World Market</h2>

      {/* Settings Group */}
      <div className="settings-group">
        <h3>Settings</h3>
        <div className="input-container">
          <label htmlFor="wmlevel">Level (obsolete):</label>
          <input
            type="number"
            id="wmlevel"
            name="wmlevel"
            value={settings.wmlevel !== undefined && settings.wmlevel !== null ? settings.wmlevel : ''}
            onChange={(e) => handleInputChange('settings', 'wmlevel', e.target.value)}
            min="0"
            max="9999999999"
          />
        </div>

        <div className="input-container">
          <label htmlFor="dayswmlevel">Duration:</label>
          <input
            type="number"
            id="dayswmlevel"
            name="dayswmlevel"
            value={settings.dayswmlevel !== undefined && settings.dayswmlevel !== null ? settings.dayswmlevel : ''}
            onChange={(e) => handleInputChange('settings', 'dayswmlevel', e.target.value)}
            min="0"
            max="9999999999"
          />
        </div>

        <div className="input-container">
          <label htmlFor="gdpcbase">Base GDPC:</label>
          <input
            type="number"
            id="gdpcbase"
            name="gdpcbase"
            value={settings.gdpcbase !== undefined && settings.gdpcbase !== null ? settings.gdpcbase : ''}
            onChange={(e) => handleInputChange('settings', 'gdpcbase', e.target.value)}
            min="0"
            max="9999999999"
          />
        </div>
      </div>

      {/* Military Group */}
      <div className="military-group">
        <h3>Military</h3>
        {/* Garrison Progression */}
        <div className="input-container">
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
                          military.garrisonprogression && military.garrisonprogression[index] !== undefined
                            ? military.garrisonprogression[index]
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
        </div>

        {/* Battalion Size */}
        <div className="input-container">
          <label>Battalion Size:</label>
          <div className="table-wrapper">
            <table className="battalion-size-table">
              <tbody>
                {battalionTypes.map((type) => (
                  <tr key={type}>
                    <td>{type}</td>
                    <td>
                      <input
                        type="number"
                        value={
                          military.battstrdefault && military.battstrdefault[type.toLowerCase()] !== undefined
                            ? military.battstrdefault[type.toLowerCase()]
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
      </div>

      {/* Economic Group */}
      <div className="economic-group">
        <h3>Economic</h3>
        {/* On Hex Resource Multipliers */}
        <div className="input-container">
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
                          economic.hexresmults && economic.hexresmults[resource] !== undefined
                            ? economic.hexresmults[resource]
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
        </div>

        {/* Social Spending Defaults */}
        <div className="input-container">
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
                          economic.socialdefaults && economic.socialdefaults[category] !== undefined
                            ? economic.socialdefaults[category]
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
      </div>

      {/* Weather Group */}
      <div className="weather-group">
        <h3>Weather</h3>
        <div className="input-container">
          <label htmlFor="days">Days:</label>
          <input
            type="number"
            id="days"
            name="days"
            value={weather.days !== undefined && weather.days !== null ? weather.days : ''}
            onChange={(e) => handleInputChange('weather', 'days', e.target.value)}
            min="0"
            max="9999999999"
          />
        </div>

        {/* Weather Offset */}
        <div className="input-container">
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
                          weather.weatheroffset && weather.weatheroffset[index] !== undefined
                            ? weather.weatheroffset[index]
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
        </div>

        {/* Weather Speed */}
        <div className="input-container">
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
                          weather.weatherspeed && weather.weatherspeed[index] !== undefined
                            ? weather.weatherspeed[index]
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
    </div>
  );
};

export default WorldMarketPage;
