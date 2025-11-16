// src/components/common/ProgressBar.jsx
import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ progress }) => {
    return (
        <div className="progress-bar-container">
            <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }}>
                    <span className="progress-bar-text">{`${progress}%`}</span>
                </div>
            </div>
        </div>
    );
};

export default ProgressBar;
