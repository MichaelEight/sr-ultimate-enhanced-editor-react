// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ScenarioPage from './pages/ScenarioPage';
import SettingsPage from './pages/SettingsPage';
import RegionPage from './pages/RegionPage';
import TheaterPage from './pages/TheaterPage';
import ResourcePage from './pages/ResourcePage';
import MessageBox from './components/MessageBox';
import { MessageProvider } from './contexts/MessageContext';

const App = () => {
    return (
        <MessageProvider>
            <Router>
                <Header />
                <Navbar />
                <main>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/scenario" element={<ScenarioPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/regions" element={<RegionPage />} />
                        <Route path="/theaters" element={<TheaterPage />} />
                        <Route path="/resources" element={<ResourcePage />} />
                    </Routes>
                </main>
                <MessageBox />
                <Footer />
            </Router>
        </MessageProvider>
    );
};

export default App;
