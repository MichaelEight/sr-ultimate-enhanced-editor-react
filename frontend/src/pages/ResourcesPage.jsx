// ResourcesPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import '../assets/styles/ResourcesPage.css'; // Ensure this path is correct

const ResourcesPage = ({ activeTab }) => {
  const [selectedResource, setSelectedResource] = useState('agriculture');
  const [resourceData, setResourceData] = useState({});

  // Fetch resources data from backend
  const fetchResourcesData = useCallback(() => {
    fetch('http://localhost:5000/resources')
      .then((response) => response.json())
      .then((data) => {
        if (data && data.resources) {
          setResourceData(data.resources);
          console.log('Fetched latest resources data.');
          console.log(data.resources);
        }
      })
      .catch((error) => {
        console.error('Error fetching resources:', error);
      });
  }, []);

  // Check if resources data needs to be fetched
  const checkAndFetchResources = useCallback(() => {
    fetch('http://localhost:5000/check_seen_since_last_update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tab: 'resources' }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data && data.seenSinceLastUpdate === false) {
          fetchResourcesData();
        } else {
          console.log('Resources data is up to date.');
        }
      })
      .catch((error) => {
        console.error('Error checking seenSinceLastUpdate:', error);
      });
  }, [fetchResourcesData]);

  useEffect(() => {
    if (activeTab === '/resources') {
      checkAndFetchResources();
    }
  }, [activeTab, checkAndFetchResources]);

  // Handle input changes and updates
  const handleInputChange = (fieldGroup, name, value) => {
    // Convert value to number if possible
    const numericValue = value === '' ? '' : Number(value);
    setResourceData((prevData) => {
      const updatedData = { ...prevData };
      if (!updatedData[selectedResource]) {
        updatedData[selectedResource] = {};
      }
      if (!updatedData[selectedResource][fieldGroup]) {
        updatedData[selectedResource][fieldGroup] = {};
      }
      updatedData[selectedResource][fieldGroup][name] = numericValue;
      return updatedData;
    });

    // Send update to backend
    const payload = {
      resourceName: selectedResource,
      fieldGroup,
      name,
      value: numericValue,
    };
    fetch('http://localhost:5000/resources/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        console.log('Resource updated successfully');
      })
      .catch((error) => {
        console.error('Error updating resource:', error);
      });
  };

  const resourcesList = [
    'agriculture',
    'rubber',
    'timber',
    'petroleum',
    'coal',
    'ore',
    'uranium',
    'electricity',
    'consumergoods',
    'militarygoods',
    'industrialgoods',
  ];

  const selectedResourceData = resourceData[selectedResource] || {};

  const { cost = {}, production = {}, producefrom = {} } = selectedResourceData;

  // Map backend keys to frontend labels and names
  const costFields = [
    { label: 'Base Cost', name: 'wmbasecost', min: 0, max: 999999999 },
    { label: 'Full Cost', name: 'wmfullcost', min: 0, max: 999999999 },
    { label: 'Margin', name: 'wmmargin', min: 0, max: 999999999 },
  ];

  const productionFields = [
    { label: 'Node Production', name: 'nodeproduction', min: 0, max: 999999 },
    { label: 'Max Production Per Person', name: 'wmprodperpersonmax', min: 0, max: 999999 },
    { label: 'Min Production Per Person', name: 'wmprodperpersonmin', min: 0, max: 999999 },
    { label: 'Urban Production', name: 'wmurbanproduction', min: 0, max: 999999 },
  ];

  return (
    <div className="resources-page">
      {/* Resource Selection */}
      <div className="resource-group">
        <h3>Resources</h3>
        <div className="resource-selection">
          {resourcesList.map((resource) => (
            <label key={resource} className="resource-label">
              <input
                type="radio"
                value={resource}
                checked={selectedResource === resource}
                onChange={(e) => setSelectedResource(e.target.value)}
              />
              {resource.charAt(0).toUpperCase() + resource.slice(1)}
            </label>
          ))}
        </div>
      </div>

      {/* Cost Group */}
      <div className="cost-group">
        <h3>Cost</h3>
        {costFields.map((field) => (
          <div key={field.name} className="field-row">
            <label className="field-label">{field.label}:</label>
            <input
              type="number"
              name={field.name}
              value={cost[field.name] !== undefined ? cost[field.name] : 0}
              onChange={(e) => handleInputChange('cost', field.name, e.target.value)}
              min={field.min}
              max={field.max}
              className="field-input"
            />
          </div>
        ))}
      </div>

      {/* Production Group */}
      <div className="production-group">
        <h3>Production</h3>
        {productionFields.map((field) => (
          <div key={field.name} className="field-row">
            <label className="field-label">{field.label}:</label>
            <input
              type="number"
              name={field.name}
              value={production[field.name] !== undefined ? production[field.name] : 0}
              onChange={(e) => handleInputChange('production', field.name, e.target.value)}
              min={field.min}
              max={field.max}
              className="field-input"
            />
          </div>
        ))}
      </div>

      {/* Produced From Group */}
      <div className="produced-from-group">
        <h3>Produced From</h3>
        <div className="produced-from-table-wrapper">
          <table className="produced-from-table">
            <thead>
              <tr>
                <th>Resource</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {resourcesList.map((resource) => (
                <tr key={resource}>
                  <td>{resource.charAt(0).toUpperCase() + resource.slice(1)}</td>
                  <td>
                    <input
                      type="number"
                      value={producefrom[resource] !== undefined ? producefrom[resource] : 0}
                      onChange={(e) => handleInputChange('producefrom', resource, e.target.value)}
                      min="0"
                      max="999999999"
                      className="producefrom-input"
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

export default ResourcesPage;
