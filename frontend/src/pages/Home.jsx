// src/pages/Home.jsx
import React, { useState } from 'react';
import useFileUpload from '../hooks/useFileUpload';
import useSocket from '../hooks/useSocket';
import ProgressBar from '../components/Progressbar';

const Home = () => {
    const {
        file,
        validationResults,
        progress,
        setProgress, // Add setProgress here
        handleFileChange,
        handleUpload,
        handleExport,
        handleCheckboxChange
    } = useFileUpload();
    const [progressMessage, setProgressMessage] = useState('');

    useSocket(setProgress, setProgressMessage);

    return (
        <div>
            <h1>Home</h1>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload</button>
            <ProgressBar progress={progress} message={progressMessage} />
            {validationResults && (
                <div>
                    <h2>Validation Results</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Path</th>
                                <th>Required</th>
                                <th>Exists</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(validationResults).map(([key, value]) => (
                                <tr key={key}>
                                    <td>{key}</td>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={value.required}
                                            onChange={() => handleCheckboxChange(key)}
                                        />
                                    </td>
                                    <td>{value.exists ? 'Yes' : 'No'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button onClick={handleExport}>Export</button>
                </div>
            )}
        </div>
    );
};

export default Home;
