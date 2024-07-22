// src/pages/Home.jsx
import React, { useState } from 'react';

const Home = () => {
    const [file, setFile] = useState(null);
    const [extractedText, setExtractedText] = useState('');
    const [downloadUrl, setDownloadUrl] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            console.log('No file selected');
            return;
        }

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
            } else {
                console.error('Upload error:', data.error);
            }
        } catch (error) {
            console.error('Error during upload:', error);
        }
    };

    const handleProcessFile = async () => {
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
        </div>
    );
};

export default Home;
