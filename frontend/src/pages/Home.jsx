// src/pages/Home.jsx
import React, { useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import { MessageContext } from '../contexts/MessageContext';

const socket = io('http://localhost:5000');

const Home = () => {
    const [file, setFile] = useState(null);
    const [validationResults, setValidationResults] = useState(null);
    const [progress, setProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState('');
    const { addMessage } = useContext(MessageContext);

    useEffect(() => {
        socket.on('progress', (data) => {
            setProgress(data.progress);
            setProgressMessage(data.message);
        });

        socket.on('message', (data) => {
            addMessage(data.message);
        });

        return () => {
            socket.off('progress');
            socket.off('message');
        };
    }, [addMessage]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            addMessage('!! No file selected');
            return;
        }

        setProgress(0);  // Reset progress
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:5000/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (response.ok) {
                setValidationResults(data);
                setProgress(100);  // Ensure progress bar reaches 100%
            } else {
                addMessage(`!! Upload error: ${data.error}`);
            }
        } catch (error) {
            addMessage(`!! Error during upload: ${error.message}`);
        }
    };

    const handleExport = async () => {
        if (!validationResults) {
            addMessage('!! No validation results to export');
            return;
        }

        setProgress(0);  // Reset progress

        try {
            const response = await fetch('http://localhost:5000/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    scenario_name: file.name.split('.')[0],
                    structure: validationResults,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                addMessage(`!! Export error: ${data.error}`);
                return;
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${file.name.split('.')[0]}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setProgress(100);  // Ensure progress bar reaches 100%
        } catch (error) {
            addMessage(`!! Error during export: ${error.message}`);
        }
    };

    const handleCheckboxChange = (path) => {
        setValidationResults(prevState => ({
            ...prevState,
            [path]: {
                ...prevState[path],
                required: !prevState[path].required
            }
        }));
    };

    return (
        <div>
            <h1>Home</h1>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload</button>
            <div>
                <progress value={progress} max="100"></progress>
                <p>{progressMessage}</p>
            </div>
            {validationResults && (
                <div>
                    <h2>Validation Results</h2>
                    <textarea
                        rows="10"
                        cols="50"
                        value={Object.entries(validationResults).map(([key, value]) =>
                            `${key}: required=${value.required}, exists=${value.exists}`
                        ).join('\n')}
                        readOnly
                    />
                    <h3>Set Required Files</h3>
                    <ul>
                        {Object.entries(validationResults).map(([key, value]) => (
                            <li key={key}>
                                <input
                                    type="checkbox"
                                    checked={value.required}
                                    onChange={() => handleCheckboxChange(key)}
                                />
                                {key}
                            </li>
                        ))}
                    </ul>
                    <button onClick={handleExport}>Export</button>
                </div>
            )}
        </div>
    );
};

export default Home;
