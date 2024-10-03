// src/pages/TheatersPage.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import debounce from 'lodash/debounce';
import '../assets/styles/TheatersPage.css';

const TheatersPage = ({ activeTab }) => {
  const [excludeTheatres, setExcludeTheatres] = useState(false);
  const [theaters, setTheaters] = useState([]);

  // Fetch theaters data from backend
  const fetchTheatersData = useCallback(() => {
    fetch('http://localhost:5000/theaters')
      .then((response) => response.json())
      .then((data) => {
        if (data && data.theaters) {
          setTheaters(data.theaters);
          console.log('Fetched latest theaters data.');
        }
      })
      .catch((error) => {
        console.error('Error fetching theaters:', error);
      });
  }, []);

  // Check if theaters data needs to be fetched
  const checkAndFetchTheaters = useCallback(() => {
    fetch('http://localhost:5000/check_seen_since_last_update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tab: 'theaters' }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data && data.seenSinceLastUpdate === false) {
          fetchTheatersData();
        } else {
          console.log('Theaters data is up to date.');
        }
      })
      .catch((error) => {
        console.error('Error checking seenSinceLastUpdate:', error);
      });
  }, [fetchTheatersData]);

  useEffect(() => {
    if (activeTab === '/theaters') {
      checkAndFetchTheaters();
    }
  }, [activeTab, checkAndFetchTheaters]);

  // Debounced function to handle theater updates
  const debouncedHandleTheaterChange = useRef();

  if (!debouncedHandleTheaterChange.current) {
    debouncedHandleTheaterChange.current = debounce((updatedTheater) => {
      fetch('http://localhost:5000/theaters/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTheater),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((data) => {
          console.log('Theater updated successfully');
        })
        .catch((error) => {
          console.error('Error updating theater:', error);
        });
    }, 500);
  }

  // Handle changes in theater data
  const handleTheaterChange = (theaterIndex, field, value) => {
    const updatedTheaters = [...theaters];
    if (field === 'transfers') {
      updatedTheaters[theaterIndex][field] = value.split(',').map((item) => item.trim());
    } else {
      updatedTheaters[theaterIndex][field] = value;
    }
    setTheaters(updatedTheaters);

    // Send update to backend
    debouncedHandleTheaterChange.current(updatedTheaters[theaterIndex]);
  };

  // Handle excludeTheatres checkbox change
  const handleCheckboxChange = (e) => {
    setExcludeTheatres(e.target.checked);
    // If necessary, send this state to the backend
    // Similar to how other tabs handle settings updates
    fetch('http://localhost:5000/updateSetting', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key: 'excludeTheatres', value: e.target.checked ? 1 : 0 }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Exclude theatres setting updated:', data);
      })
      .catch((error) => {
        console.error('Error updating exclude theatres setting:', error);
      });
  };

  // Handle Generate button click
  const handleGenerateClick = () => {
    fetch('http://localhost:5000/theaters/generate', {
      method: 'POST',
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Theaters generated:', data.message);
        fetchTheatersData(); // Refresh theaters data
      })
      .catch((error) => {
        console.error('Error generating theaters:', error);
      });
  };

  // Handle Import from CVP button click
  const handleImportClick = () => {
    fetch('http://localhost:5000/theaters/import_from_cvp', {
      method: 'POST',
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Theaters imported from CVP:', data.message);
        fetchTheatersData(); // Refresh theaters data
      })
      .catch((error) => {
        console.error('Error importing theaters from CVP:', error);
      });
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
                      value={theater.id}
                      onChange={(e) =>
                        handleTheaterChange(index, 'id', parseInt(e.target.value, 10))
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={theater.theatreName}
                      onChange={(e) =>
                        handleTheaterChange(index, 'theatreName', e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={theater.theatreCode}
                      onChange={(e) =>
                        handleTheaterChange(index, 'theatreCode', e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={theater.culture}
                      onChange={(e) =>
                        handleTheaterChange(index, 'culture', parseInt(e.target.value, 10))
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={theater.xLocation}
                      onChange={(e) =>
                        handleTheaterChange(index, 'xLocation', parseInt(e.target.value, 10))
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={theater.yLocation}
                      onChange={(e) =>
                        handleTheaterChange(index, 'yLocation', parseInt(e.target.value, 10))
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={theater.transfers.join(', ')}
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
