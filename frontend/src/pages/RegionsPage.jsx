// RegionsPage.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import debounce from 'lodash/debounce';
import '../assets/styles/RegionsPage.css';

const RegionsPage = ({ activeTab, project, setProject }) => {
  const [regions, setRegions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Ref to keep track of whether the component is mounted
  const isMounted = useRef(false);

  // Define the order of properties to display in the table
  const propertyOrder = [
    'ID',
    'isActive',
    'regionname',
    'nonplayable',
    'flagnum',
    'prefixname',
    'altregionname',
    'blocknum',
    'altblocknum',
    'continentnum',
    'musictrack',
    'regioncolor',
    'politic',
    'govtype',
    'refpopulation',
    'poptotalarmy',
    'popminreserve',
    'treasury',
    'nationaldebtgdp',
    'techlevel',
    'civapproval',
    'milapproval',
    'fanaticism',
    'defcon',
    'loyalty',
    'playeragenda',
    'playeraistance',
    'worldavail',
    'armsavail',
    'worldintegrity',
    'treatyintegrity',
    'envrating',
    'milsubsidyrating',
    'domsubsidyrating',
    'creditrating',
    'tourismrating',
    'literacy',
    'lifeexp',
    'avgchildren',
    'crimerate',
    'unemployment',
    'gdpc',
    'inflation',
    'buyingpower',
    'prodefficiency',
    'alertlevel',
    'bwmmember',
    'religionstate',
    'bconscript',
    'forcesplan',
    'milspendsalary',
    'milspendmaint',
    'milspendintel',
    'milspendresearch',
    'RacePrimary',
    'RaceSecondary',
    'capitalx',
    'capitaly',
    'masterdata',
    'influence',
    'influenceval',
    'couppossibility',
    'revoltpossibility',
    'independencedesire',
    'parentloyalty',
    'independencetarget',
    'sphere',
    'civiliansphere',
    'keepregion',
    'parentregion',
    'theatrehome',
    'electiondate',
    // Add any other properties as needed
  ];

  // Map of property names to expected data types
  const propertyTypes = {
    'ID': 'number',
    'isActive': 'boolean',
    'regionname': 'string',
    'nonplayable': 'boolean',
    'flagnum': 'number',
    'blocknum': 'number',
    'altblocknum': 'number',
    'continentnum': 'number',
    'musictrack': 'string',
    'regioncolor': 'string',
    'politic': 'string',
    'govtype': 'string',
    'refpopulation': 'number',
    'poptotalarmy': 'number',
    'poptotalarmy': 'number',
    'popminreserve': 'number',
    'treasury': 'number',
    'nationaldebtgdp': 'number',
    'techlevel': 'number',
    'civapproval': 'number',
    'milapproval': 'number',
    'fanaticism': 'number',
    'defcon': 'number',
    'loyalty': 'number',
    'playeragenda': 'string',
    'playeraistance': 'string',
    'worldavail': 'number',
    'armsavail': 'number',
    'worldintegrity': 'number',
    'treatyintegrity': 'number',
    'envrating': 'number',
    'milsubsidyrating': 'number',
    'domsubsidyrating': 'number',
    'creditrating': 'number',
    'tourismrating': 'number',
    'literacy': 'number',
    'lifeexp': 'number',
    'avgchildren': 'number',
    'crimerate': 'number',
    'unemployment': 'number',
    'gdpc': 'number',
    'inflation': 'number',
    'buyingpower': 'number',
    'prodefficiency': 'number',
    'alertlevel': 'number',
    'bwmmember': 'boolean',
    'religionstate': 'number',
    'bconscript': 'number',
    'forcesplan': 'number',
    'milspendsalary': 'number',
    'milspendmaint': 'number',
    'milspendintel': 'number',
    'milspendresearch': 'number',
    'RacePrimary': 'number',
    'RaceSecondary': 'number',
    'capitalx': 'number',
    'capitaly': 'number',
    'masterdata': 'number',
    'influence': 'string',
    'influenceval': 'string',
    'couppossibility': 'number',
    'revoltpossibility': 'number',
    'independencedesire': 'number',
    'parentloyalty': 'number',
    'independencetarget': 'number',
    'sphere': 'number',
    'civiliansphere': 'number',
    'keepregion': 'boolean',
    'parentregion': 'number',
    'theatrehome': 'number',
    'electiondate': 'string',
    // Add types for other properties...
  };

  // Fetch regions data from backend
  const fetchRegionsData = useCallback(() => {
    setLoading(true);
    fetch('http://localhost:5000/regions')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch regions');
        }
        return response.json();
      })
      .then((data) => {
        if (data && data.regions) {
          const backendRegions = data.regions;
          if (isMounted.current) {
            setRegions(backendRegions);
            setLoading(false);
            console.log('Fetched latest regions data.');
          }
        } else {
          setRegions([]);
          setLoading(false);
        }
      })
      .catch((error) => {
        if (isMounted.current) {
          setLoading(false);
          console.error('Error fetching regions:', error);
        }
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
          console.log('Regions data has changed. Fetching new data.');
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
    isMounted.current = true;
    if (activeTab === '/regions' && project) {
      fetchRegionsData();
    } else if (!project) {
      // Reset state when project is closed
      setRegions([]);
    }
    return () => {
      isMounted.current = false;
    };
  }, [activeTab, fetchRegionsData, project]);

  // Debounced function to handle region updates
  const debouncedHandleRegionChange = useRef();

  if (!debouncedHandleRegionChange.current) {
    debouncedHandleRegionChange.current = debounce((updatedRegion, originalID) => {
      // Include originalID in the payload
      const payload = { ...updatedRegion, originalID };
      fetch('http://localhost:5000/regions/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
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
    const region = { ...updatedRegions[regionIndex] };

    if (field === 'ID' || field === 'isActive') {
      if (field === 'ID') {
        // Store original ID for backend reference
        const originalID = region.ID;
        region['ID'] = parseInt(value, 10) || 0;
        updatedRegions[regionIndex] = region;
        setRegions(updatedRegions);

        // Send update to backend with originalID
        debouncedHandleRegionChange.current(region, originalID);
        return;
      } else if (field === 'isActive') {
        region[field] = value;
      }
    } else {
      if (!region.Properties) {
        region.Properties = {};
      }
      region.Properties[field] = value;
    }

    updatedRegions[regionIndex] = region;
    setRegions(updatedRegions);

    // Send update to backend
    debouncedHandleRegionChange.current(region);
  };

  // Filter regions based on search term
  const filteredRegions = regions.filter((region) => {
    const regionName = region.Properties && region.Properties.regionname ? region.Properties.regionname : '';
    return regionName.toLowerCase().includes(searchTerm.toLowerCase());
  });

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
        {loading ? (
          <p>Loading data...</p>
        ) : (
          <table className="region-table">
            <thead>
              <tr>
                {propertyOrder.map((key, index) => (
                  <th key={index}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRegions.length > 0 ? (
                filteredRegions.map((region, index) => (
                  <tr key={index}>
                    {propertyOrder.map((key) => {
                      let value;
                      if (key === 'ID' || key === 'isActive') {
                        value = region[key];
                      } else {
                        value = region.Properties ? region.Properties[key] : '';
                      }

                      // Determine the input type based on propertyTypes
                      const propType = propertyTypes[key];
                      let inputType = 'text';

                      if (propType === 'number') {
                        inputType = 'number';
                      } else if (propType === 'boolean') {
                        inputType = 'checkbox';
                      } else {
                        inputType = 'text';
                      }

                      // Handle boolean (checkbox) inputs
                      if (inputType === 'checkbox') {
                        return (
                          <td key={key}>
                            <input
                              type="checkbox"
                              checked={!!value}
                              onChange={(e) =>
                                handleRegionChange(index, key, e.target.checked)
                              }
                            />
                          </td>
                        );
                      } else {
                        return (
                          <td key={key}>
                            <input
                              type={inputType}
                              value={value !== undefined && value !== null ? value : ''}
                              onChange={(e) =>
                                handleRegionChange(index, key, e.target.value)
                              }
                            />
                          </td>
                        );
                      }
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={propertyOrder.length}>No regions available</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RegionsPage;
