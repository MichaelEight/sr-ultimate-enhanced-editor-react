// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const Home = () => {
    const [file, setFile] = useState(null);
    const [extractedText, setExtractedText] = useState('');
    const [downloadUrl, setDownloadUrl] = useState(null);
    const [progress, setProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState('');

    useEffect(() => {
        socket.on('progress', (data) => {
            setProgress(data.progress);
            setProgressMessage(data.message);
        });

        return () => {
            socket.off('progress');
        };
    }, []);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            console.log('No file selected');
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
                setExtractedText(data.first_line);
                setProgress(100);  // Ensure progress bar reaches 100%
            } else {
                console.error('Upload error:', data.error);
            }
        } catch (error) {
            console.error('Error during upload:', error);
        }
    };

    const handleProcessFile = async () => {
        setProgress(0);  // Reset progress

        try {
            const response = await fetch('http://localhost:5000/process', {
                method: 'POST',
            });

            if (!response.ok) {
                const data = await response.json();
                console.error('Process error:', data.error);
                return;
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            setDownloadUrl(url);
            setProgress(100);  // Ensure progress bar reaches 100%
        } catch (error) {
            console.error('Error during file processing:', error);
        }
    };

    return (
        <div>
            <h1>Home</h1>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload</button>
            <div>
                <label>Sample Text Box:</label>
                <input type="text" value={extractedText} readOnly />
            </div>
            <button onClick={handleProcessFile}>Sample Button</button>
            {downloadUrl && (
                <a href={downloadUrl} download="processed_file.zip">Download Processed File</a>
            )}
            <div>
                <progress value={progress} max="100"></progress>
                <p>{progressMessage}</p>
            </div>
        </div>
    );
};

export default Home;
