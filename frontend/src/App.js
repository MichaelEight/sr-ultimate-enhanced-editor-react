// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
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
import useProjectManagement from './hooks/useProjectManagement';
import './assets/styles/App.css';

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
    } = useProjectManagement();

    const defaultProjects = ["Project1", "Project2", "Project3"];

    return (
        <MessageProvider>
            <Router>
                <AppContent
                    defaultProjects={defaultProjects}
                    project={project}
                    setProject={setProject}
                    handleLoadDefaultProject={handleLoadDefaultProject}
                    handleCloseProject={handleCloseProject}
                    handleExport={handleExport}
                    handleCreateEmptyProject={handleCreateEmptyProject}
                    handleFileChangeAndUpload={handleFileChangeAndUpload}
                    progress={progress}
                    progressMessage={progressMessage}
                />
            </Router>
        </MessageProvider>
    );
};

const AppContent = ({
    defaultProjects,
    project,
    setProject,
    handleLoadDefaultProject,
    handleCloseProject,
    handleExport,
    handleCreateEmptyProject,
    handleFileChangeAndUpload,
    progress,
    progressMessage,
}) => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.pathname);

    useEffect(() => {
        setActiveTab(location.pathname);
    }, [location]);

    return (
        <>
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
                    <Route path="/" element={<ScenarioPage activeTab={activeTab} project={project} setProject={setProject} />} />
                    <Route path="/settings" element={<SettingsPage activeTab={activeTab} />} />
                    <Route path="/regions" element={<RegionsPage activeTab={activeTab} />} />
                    <Route path="/theaters" element={<TheatersPage activeTab={activeTab} />} />
                    <Route path="/resources" element={<ResourcesPage activeTab={activeTab} />} />
                    <Route path="/worldmarket" element={<WorldMarketPage activeTab={activeTab} />} />
                    <Route path="/orbat" element={<OrbatPage activeTab={activeTab} />} />
                </Routes>
            </main>
            <ProgressBar progress={progress} message={progressMessage} />
            <MessageBox />
            <Footer />
        </>
    );
};

export default App;
