// src/components/ProgressBar.jsx
import React from 'react';
import { useMessage } from '../contexts/MessageContext';

const ProgressBar = () => {
    const { progress, progressMessage } = useMessage();

    return (
        <div className="progress-bar">
            <progress value={progress} max="100"></progress>
            <p>{progressMessage}</p>
        </div>
    );
};

export default ProgressBar;
