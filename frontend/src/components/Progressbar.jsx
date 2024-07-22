// src/components/ProgressBar.jsx
import React from 'react';

const ProgressBar = ({ progress, message }) => (
    <div>
        <progress value={progress} max="100"></progress>
        <p>{message}</p>
    </div>
);

export default ProgressBar;
