// TheatersPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useProject } from '../context/ProjectContext';
import '../assets/styles/TheatersPage.css';

const TheatersPage = ({ activeTab }) => {
  const { projectData, updateData } = useProject();
  const [excludeTheatres, setExcludeTheatres] = useState(false);
  const [theaters, setTheaters] = useState([]);

  // Load theaters data from ProjectContext
  const loadTheatersData = useCallback(() => {
    if (projectData && projectData.theaters_data) {
      // Convert theaters object to array for display
      const theatersArray = Object.entries(projectData.theaters_data).map(([id, theater]) => ({
        id: parseInt(id, 10),
        ...theater
      }));
      setTheaters(theatersArray);
      console.log('Loaded theaters data from context');
    }
  }, [projectData]);

  useEffect(() => {
    if (activeTab === '/theaters') {
      loadTheatersData();
      // Load excludeTheatres setting if it exists
      if (projectData.settings_data?.excludeTheatres !== undefined) {
        setExcludeTheatres(projectData.settings_data.excludeTheatres === 1);
      }
    }
  }, [activeTab, loadTheatersData, projectData]);

  // Handle changes in theater data
  const handleTheaterChange = (theaterIndex, field, value) => {
    const updatedTheaters = [...theaters];

    if (field === 'transfers') {
      updatedTheaters[theaterIndex][field] = value.split(',').map((item) => item.trim()).map(Number);
    } else if (field === 'id') {
      updatedTheaters[theaterIndex][field] = value;
    } else {
      updatedTheaters[theaterIndex][field] = value;
    }

    setTheaters(updatedTheaters);

    // Update in ProjectContext - convert array back to object
    const updatedTheatersObj = {};
    updatedTheaters.forEach(theater => {
      const { id, ...theaterData } = theater;
      updatedTheatersObj[id] = theaterData;
    });
    updateData('theaters_data', updatedTheatersObj);
  };

  // Handle excludeTheatres checkbox change
  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setExcludeTheatres(checked);

    // Update in settings_data
    const updatedSettings = {
      ...projectData.settings_data,
      excludeTheatres: checked ? 1 : 0
    };
    updateData('settings_data', updatedSettings);
  };

  // Handle Generate button click - creates dummy theater data
  const handleGenerateClick = () => {
    const generatedTheaters = {};
    for (let i = 1; i <= 10; i++) {
      generatedTheaters[i] = {
        theatreName: `Theater ${i}`,
        theatreCode: `TH${i}`,
        culture: 0,
        xLocation: 0,
        yLocation: 0,
        transfers: []
      };
    }
    updateData('theaters_data', generatedTheaters);
    console.log('Generated dummy theaters');
  };

  // Handle Import from CVP button click
  const handleImportClick = () => {
    // Import theaters from CVP data (already in projectData.theaters_data from CVP parser)
    if (projectData.theaters_data && Object.keys(projectData.theaters_data).length > 0) {
      console.log('Theaters already imported from CVP file');
      loadTheatersData(); // Just reload to refresh the view
    } else {
      console.warn('No CVP data available to import theaters from');
    }
  };

  return (
    <div className="theaters-page">
      <div className="options">
        <label>
          <input
            type="checkbox"
            checked={excludeTheatres}
            onChange={handleCheckboxChange}
          />
          Do Not Include Theatres
        </label>
      </div>

      <div className="button-group">
        <button onClick={handleGenerateClick}>Generate</button>
        <button onClick={handleImportClick}>Import from CVP File</button>
      </div>

      <div className="theater-table-wrapper">
        <table className="theater-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Theatre Name</th>
              <th>Theatre Code</th>
              <th>Culture</th>
              <th>X Location</th>
              <th>Y Location</th>
              <th>Transfers</th>
            </tr>
          </thead>
          <tbody>
            {theaters.length > 0 ? (
              theaters.map((theater, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="number"
                      value={theater.id || ''}
                      onChange={(e) =>
                        handleTheaterChange(index, 'id', parseInt(e.target.value, 10) || 0)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={theater.theatreName || ''}
                      onChange={(e) =>
                        handleTheaterChange(index, 'theatreName', e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={theater.theatreCode || ''}
                      onChange={(e) =>
                        handleTheaterChange(index, 'theatreCode', e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={theater.culture || 0}
                      onChange={(e) =>
                        handleTheaterChange(index, 'culture', parseInt(e.target.value, 10) || 0)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={theater.xLocation || 0}
                      onChange={(e) =>
                        handleTheaterChange(index, 'xLocation', parseInt(e.target.value, 10) || 0)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={theater.yLocation || 0}
                      onChange={(e) =>
                        handleTheaterChange(index, 'yLocation', parseInt(e.target.value, 10) || 0)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={theater.transfers ? theater.transfers.join(', ') : ''}
                      onChange={(e) =>
                        handleTheaterChange(index, 'transfers', e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">No theaters available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TheatersPage;
