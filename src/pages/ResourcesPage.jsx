// ResourcesPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useProject } from '../context/ProjectContext';
import '../assets/styles/ResourcesPage.css';

const ResourcesPage = ({ activeTab }) => {
  const { projectData, updateData } = useProject();
  const [selectedResource, setSelectedResource] = useState('agriculture');
  const [resourceData, setResourceData] = useState({});

  // Load resources data from ProjectContext
  const loadResourcesData = useCallback(() => {
    if (projectData && projectData.resources_data) {
      const processedData = { ...projectData.resources_data };

      // Ensure all fields have default values of 0
      Object.keys(processedData).forEach((resourceName) => {
        const resource = processedData[resourceName];
        ['cost', 'production', 'producefrom'].forEach((group) => {
          if (resource[group]) {
            Object.keys(resource[group]).forEach((field) => {
              if (resource[group][field] === null || resource[group][field] === undefined) {
                processedData[resourceName][group][field] = 0;
              }
            });
          }
        });
      });

      setResourceData(processedData);
      console.log('Loaded resources data from context');
    }
  }, [projectData]);

  useEffect(() => {
    if (activeTab === '/resources') {
      loadResourcesData();
    }
  }, [activeTab, loadResourcesData]);

  // Handle input changes
  const handleInputChange = (fieldGroup, name, value) => {
    const numericValue = value === '' ? '' : Number(value);

    // Update local state
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

    // Update in ProjectContext
    const updatedResources = {
      ...projectData.resources_data,
      [selectedResource]: {
        ...projectData.resources_data[selectedResource],
        [fieldGroup]: {
          ...projectData.resources_data[selectedResource]?.[fieldGroup],
          [name]: numericValue
        }
      }
    };
    updateData('resources_data', updatedResources);
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
