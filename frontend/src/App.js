// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import ScenarioPage from './pages/ScenarioPage';
import SettingsPage from './pages/SettingsPage';
import RegionsPage from './pages/RegionsPage';
import TheatersPage from './pages/TheatersPage';
import ResourcesPage from './pages/ResourcesPage';
import WorldMarketPage from './pages/WorldMarketPage';
import OrbatPage from './pages/OrbatPage';
import MessageBox from './components/MessageBox';
import ProgressBar from './components/Progressbar';
import { MessageProvider } from './contexts/MessageContext';
import useProjectManagement from './hooks/useProjectManagement'; // Updated import
import './assets/styles/App.css'; // Add a CSS file for global styles

const App = () => {
    const {
        project,
        setProject,
        progress,
        setProgress,
        progressMessage,
        setProgressMessage,
        handleCreateEmptyProject,
        handleFileChangeAndUpload,
        handleLoadDefaultProject,
        handleCloseProject,
        handleExport
    } = useProjectManagement(); // Use the consolidated hook

    const defaultProjects = ["Project1", "Project2", "Project3"];  // Ensure it's defined

    return (
        <MessageProvider>
            <Router>
                <Navbar />
                <Sidebar 
                    defaultProjects={defaultProjects}
                    project={project}
                    handleLoadDefaultProject={handleLoadDefaultProject}
                    handleCloseProject={handleCloseProject}
                    handleExport={handleExport}
                    handleCreateEmptyProject={handleCreateEmptyProject}
                    handleFileChangeAndUpload={handleFileChangeAndUpload}
                />
                <main>
                    <Routes>
                        <Route path="/" element={<ScenarioPage project={project} setProject={setProject} />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/regions" element={<RegionsPage />} />
                        <Route path="/theaters" element={<TheatersPage />} />
                        <Route path="/resources" element={<ResourcesPage />} />
                        <Route path="/worldmarket" element={<WorldMarketPage />} />
                        <Route path="/orbat" element={<OrbatPage />} />
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
