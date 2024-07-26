// src/components/ProgressBar.jsx
import React from 'react';
import '../assets/styles/ProgressBar.css';

const ProgressBar = ({ progress, message }) => {
    return (
        <div className="progress-bar-container">
            <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }}>
                    <span className="progress-bar-text">{`${progress}%`}</span>
                </div>
            </div>
            <div className="progress-bar-message">{message}</div>
        </div>
    );
};

export default ProgressBar;
