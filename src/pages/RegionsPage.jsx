// RegionsPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useProject } from '../context/ProjectContext';
import '../assets/styles/RegionsPage.css';

const RegionsPage = ({ activeTab, project }) => {
  const { projectData, updateData } = useProject();
  const [regions, setRegions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

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
  };

  // Load regions data from ProjectContext
  const loadRegionsData = useCallback(() => {
    if (projectData && projectData.regions_data) {
      // Combine regions_data with regionincl_data to get isActive status
      const regionsWithStatus = projectData.regions_data.map(region => {
        const regionInclEntry = projectData.regionincl_data?.regions?.find(
          r => r.regionId === region.ID
        );
        return {
          ...region,
          isActive: regionInclEntry?.isActive ?? true
        };
      });
      setRegions(regionsWithStatus);
      console.log('Loaded regions data from context');
    }
  }, [projectData]);

  useEffect(() => {
    if (activeTab === '/regions' && project) {
      loadRegionsData();
    } else if (!project) {
      setRegions([]);
    }
  }, [activeTab, project, loadRegionsData]);

  // Handle changes in region data
  const handleRegionChange = (regionIndex, field, value) => {
    const updatedRegions = [...regions];
    const region = { ...updatedRegions[regionIndex] };

    if (field === 'ID') {
      // Update region ID
      const oldID = region.ID;
      region.ID = parseInt(value, 10) || 0;
      updatedRegions[regionIndex] = region;
      setRegions(updatedRegions);

      // Update in projectData.regions_data
      const newRegionsData = projectData.regions_data.map(r =>
        r.ID === oldID ? { ...r, ID: region.ID } : r
      );
      updateData('regions_data', newRegionsData);

      // Also update regionincl_data if it exists
      if (projectData.regionincl_data?.regions) {
        const newRegionincl = {
          ...projectData.regionincl_data,
          regions: projectData.regionincl_data.regions.map(r =>
            r.regionId === oldID ? { ...r, regionId: region.ID } : r
          )
        };
        updateData('regionincl_data', newRegionincl);
      }
    } else if (field === 'isActive') {
      // Update isActive status
      region.isActive = value;
      updatedRegions[regionIndex] = region;
      setRegions(updatedRegions);

      // Update in regionincl_data
      const regioninclData = projectData.regionincl_data || { regions: [] };
      const existingEntry = regioninclData.regions?.find(r => r.regionId === region.ID);

      if (existingEntry) {
        // Update existing entry
        const newRegionincl = {
          ...regioninclData,
          regions: regioninclData.regions.map(r =>
            r.regionId === region.ID ? { ...r, isActive: value } : r
          )
        };
        updateData('regionincl_data', newRegionincl);
      } else {
        // Add new entry
        const newRegionincl = {
          ...regioninclData,
          regions: [
            ...(regioninclData.regions || []),
            { regionId: region.ID, isActive: value, comment: null }
          ]
        };
        updateData('regionincl_data', newRegionincl);
      }
    } else {
      // Update property
      if (!region.Properties) {
        region.Properties = {};
      }
      region.Properties[field] = value;
      updatedRegions[regionIndex] = region;
      setRegions(updatedRegions);

      // Update in projectData.regions_data
      const newRegionsData = projectData.regions_data.map(r =>
        r.ID === region.ID ? { ...r, Properties: region.Properties } : r
      );
      updateData('regions_data', newRegionsData);
    }
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
      </div>
    </div>
  );
};

export default RegionsPage;
