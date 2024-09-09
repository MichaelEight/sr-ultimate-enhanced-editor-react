import React, { useState } from 'react';
import '../assets/styles/RegionsPage.css'; // Assuming you have a CSS file for styling

const RegionPage = () => {
    // Initial regions with placeholder data
    const [regions, setRegions] = useState([
        { cvp: '001', name: 'Region Alpha' },
        { cvp: '002', name: 'Region Beta' },
        { cvp: '003', name: 'Region Gamma' }
    ]);

    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleCreateNewRegion = () => {
        // Logic for creating a new region
        console.log('Create new region clicked');
    };

    const handleMergeFromCVP = () => {
        // Logic for merging from CVP
        console.log('Merge from CVP clicked');
    };

    return (
        <div className="region-page">
            <div className="button-group">
                <button onClick={handleCreateNewRegion}>Create New Region</button>
                <button onClick={handleMergeFromCVP}>Merge from CVP</button>
            </div>

            <div className="search-box">
                <label htmlFor="regionSearch">Search for Region:</label>
                <input 
                    id="regionSearch"
                    type="text" 
                    value={searchTerm} 
                    onChange={handleSearchChange} 
                    placeholder="Type region name..." 
                />
            </div>

            <div className="region-table-wrapper">
                <table className="region-table">
                    <thead>
                        <tr>
                            <th>&&CVP</th>
                            <th>Region Name</th>
                            {/* Add more columns as needed */}
                        </tr>
                    </thead>
                    <tbody>
                        {regions.length > 0 ? (
                            regions.map((region, index) => (
                                <tr key={index}>
                                    <td>{region.cvp}</td>
                                    <td>{region.name}</td>
                                    {/* Add more columns for each row */}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="2">No regions available</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RegionPage;
