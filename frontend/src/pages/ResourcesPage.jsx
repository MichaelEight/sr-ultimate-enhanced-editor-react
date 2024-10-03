// ResourcesPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import '../assets/styles/ResourcesPage.css'; // Adjust the path as needed

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
    setResourceData((prevData) => {
      const updatedData = { ...prevData };
      if (!updatedData[selectedResource]) {
        updatedData[selectedResource] = {};
      }
      if (!updatedData[selectedResource][fieldGroup]) {
        updatedData[selectedResource][fieldGroup] = {};
      }
      updatedData[selectedResource][fieldGroup][name] = value;
      return updatedData;
    });

    // Send update to backend
    const payload = {
      resourceName: selectedResource,
      fieldGroup,
      name,
      value,
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

  return (
    <div className="resources-page">
      {/* Resource Selection */}
      <div className="resource-group">
        <h3>Resources</h3>
        <div className="resource-selection">
          {resourcesList.map((resource) => (
            <label key={resource}>
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
        <label>Base Cost:</label>
        <input
          type="number"
          name="basecost"
          value={cost.basecost || ''}
          onChange={(e) => handleInputChange('cost', 'basecost', e.target.value)}
          min="0"
          max="999999999"
        />
        <label>Full Cost:</label>
        <input
          type="number"
          name="fullcost"
          value={cost.fullcost || ''}
          onChange={(e) => handleInputChange('cost', 'fullcost', e.target.value)}
          min="0"
          max="999999999"
        />
        <label>Margin:</label>
        <input
          type="number"
          name="margin"
          value={cost.margin || ''}
          onChange={(e) => handleInputChange('cost', 'margin', e.target.value)}
          min="0"
          max="999999999"
        />
      </div>

      {/* Production Group */}
      <div className="production-group">
        <h3>Production</h3>
        <label>Node Production:</label>
        <input
          type="number"
          name="nodeproduction"
          value={production.nodeproduction || ''}
          onChange={(e) => handleInputChange('production', 'nodeproduction', e.target.value)}
          min="0"
          max="999999"
        />
        <label>Max Production Per Person:</label>
        <input
          type="number"
          name="maxprodperperson"
          value={production.maxprodperperson || ''}
          onChange={(e) => handleInputChange('production', 'maxprodperperson', e.target.value)}
          min="0"
          max="999999"
        />
        <label>Min Production Per Person:</label>
        <input
          type="number"
          name="minprodperperson"
          value={production.minprodperperson || ''}
          onChange={(e) => handleInputChange('production', 'minprodperperson', e.target.value)}
          min="0"
          max="999999"
        />
        <label>City Production:</label>
        <input
          type="number"
          name="cityproduction"
          value={production.cityproduction || ''}
          onChange={(e) => handleInputChange('production', 'cityproduction', e.target.value)}
          min="0"
          max="999999"
        />
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
                      value={producefrom[resource] || ''}
                      onChange={(e) => handleInputChange('producefrom', resource, e.target.value)}
                      min="0"
                      max="999999999"
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
