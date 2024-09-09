import React, { useState } from 'react';
import '../assets/styles/TheatersPage.css'; // Assuming you have a CSS file for this page

const TheatersPage = () => {
    const [excludeTheatres, setExcludeTheatres] = useState(false);
    const [theaters, setTheaters] = useState([
        { id: '001', name: 'Theatre Alpha', code: 'A001', culture: 'european', transfer: 'Yes', xLocation: '120', yLocation: '240' },
        { id: '002', name: 'Theatre Beta', code: 'B002', culture: 'asian', transfer: 'No', xLocation: '340', yLocation: '560' },
        { id: '003', name: 'Theatre Gamma', code: 'C003', culture: 'european', transfer: 'Yes', xLocation: '670', yLocation: '890' }
    ]);

    const handleCheckboxChange = (e) => {
        setExcludeTheatres(e.target.checked);
    };

    const handleGenerateClick = () => {
        // Logic to generate theatres
        console.log('Generate button clicked');
    };

    const handleImportClick = () => {
        // Logic to import from CVP file
        console.log('Import from CVP button clicked');
    };

    const handleCultureChange = (index, newCulture) => {
        const updatedTheaters = [...theaters];
        updatedTheaters[index].culture = newCulture;
        setTheaters(updatedTheaters);
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
                            <th>Theatre Transfer</th>
                            <th>X Location</th>
                            <th>Y Location</th>
                        </tr>
                    </thead>
                    <tbody>
                        {theaters.length > 0 ? (
                            theaters.map((theatre, index) => (
                                <tr key={index}>
                                    <td>{theatre.id}</td>
                                    <td>{theatre.name}</td>
                                    <td>{theatre.code}</td>
                                    <td>
                                        <select 
                                            value={theatre.culture} 
                                            onChange={(e) => handleCultureChange(index, e.target.value)}
                                        >
                                            <option value="european">European</option>
                                            <option value="asian">Asian</option>
                                            {/* Add more predefined values as needed */}
                                        </select>
                                    </td>
                                    <td>{theatre.transfer}</td>
                                    <td>{theatre.xLocation}</td>
                                    <td>{theatre.yLocation}</td>
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
