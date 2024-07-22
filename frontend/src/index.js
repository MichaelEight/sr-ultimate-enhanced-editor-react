// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import './assets/styles/main.css';  // Ensure you have a main CSS file to style your app
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root')
);
