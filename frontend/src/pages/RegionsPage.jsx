// RegionsPage.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import debounce from 'lodash/debounce';
import '../assets/styles/RegionsPage.css';

const RegionsPage = ({ activeTab }) => {
  const [regions, setRegions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch regions data from backend
  const fetchRegionsData = useCallback(() => {
    fetch('http://localhost:5000/regions')
      .then((response) => response.json())
      .then((data) => {
        if (data && data.regions) {
          const backendRegions = data.regions;
          setRegions(backendRegions);
          console.log('Fetched latest regions data.');
        }
      })
      .catch((error) => {
        console.error('Error fetching regions:', error);
      });
  }, []);

  // Check if regions data needs to be fetched
  const checkAndFetchRegions = useCallback(() => {
    fetch('http://localhost:5000/check_seen_since_last_update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tab: 'regions' }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data && data.seenSinceLastUpdate === false) {
          fetchRegionsData();
        } else {
          console.log('Regions data is up to date.');
        }
      })
      .catch((error) => {
        console.error('Error checking seenSinceLastUpdate:', error);
      });
  }, [fetchRegionsData]);

  useEffect(() => {
    if (activeTab === '/regions') {
      checkAndFetchRegions();
    }
  }, [activeTab, checkAndFetchRegions]);

  // Debounced function to handle region updates
  const debouncedHandleRegionChange = useRef();

  if (!debouncedHandleRegionChange.current) {
    debouncedHandleRegionChange.current = debounce((updatedRegion) => {
      fetch('http://localhost:5000/regions/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedRegion),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((data) => {
          console.log('Region updated successfully');
        })
        .catch((error) => {
          console.error('Error updating region:', error);
        });
    }, 500);
  }

  // Handle changes in region data
  const handleRegionChange = (regionIndex, field, value) => {
    const updatedRegions = [...regions];
    if (field === 'isActive') {
      updatedRegions[regionIndex][field] = value;
    } else {
      updatedRegions[regionIndex]['Properties'][field] = value;
    }
    setRegions(updatedRegions);

    // Send update to backend
    debouncedHandleRegionChange.current(updatedRegions[regionIndex]);
  };

  // Filter regions based on search term
  const filteredRegions = regions.filter((region) => {
    const regionName = region.Properties.regionname || '';
    return regionName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Handle button - add new region
  // Handle button - merge from CVP

  return (
    <div className="region-page">
      <div className="search-box">
        <label htmlFor="regionSearch">Search for Region:</label>
        <input
          id="regionSearch"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Type region name..."
        />
      </div>

      <div className="region-table-wrapper">
        <table className="region-table">
          <thead>
            <tr>
              <th>&&CVP</th>
              <th>isActive</th>
              {regions.length > 0 &&
                Object.keys(regions[0].Properties).map((key, index) => (
                  <th key={index}>{key}</th>
                ))}
            </tr>
          </thead>
          <tbody>
            {filteredRegions.length > 0 ? (
              filteredRegions.map((region, index) => (
                <tr key={region.ID}>
                  <td>{region.ID}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={region.isActive}
                      onChange={(e) =>
                        handleRegionChange(index, 'isActive', e.target.checked)
                      }
                    />
                  </td>
                  {Object.keys(region.Properties).map((key) => (
                    <td key={key}>
                      <input
                        type="text"
                        value={
                          Array.isArray(region.Properties[key])
                            ? region.Properties[key].join(', ')
                            : region.Properties[key] || ''
                        }
                        onChange={(e) =>
                          handleRegionChange(index, key, e.target.value)
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No regions available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegionsPage;
