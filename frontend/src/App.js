// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScenarioPage from './pages/ScenarioPage';
import SettingsPage from './pages/SettingsPage';
import RegionPage from './pages/RegionPage';
import TheaterPage from './pages/TheaterPage';
import ResourcePage from './pages/ResourcePage';
import MessageBox from './components/MessageBox';
import ProgressBar from './components/Progressbar';
import { MessageProvider } from './contexts/MessageContext';
import './assets/styles/App.css'; // Add a CSS file for global styles

const App = () => {
    const [progress, setProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState('');

    return (
        <MessageProvider>
            <Router>
                <Navbar />
                <main>
                    <Routes>
                        <Route path="/" element={<ScenarioPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/regions" element={<RegionPage />} />
                        <Route path="/theaters" element={<TheaterPage />} />
                        <Route path="/resources" element={<ResourcePage />} />
                    </Routes>
                </main>
                <ProgressBar progress={progress} message={progressMessage} />
                <MessageBox />
                <Footer />
            </Router>
        </MessageProvider>
    );
};

export default App;
