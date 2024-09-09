// src/components/Navbar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import '../assets/styles/Navbar.css';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-brand">Supreme Ruler Enhanced Editor</div>
            <ul className="navbar-links">
                <li><NavLink to="/" exact="true" className={({ isActive }) => isActive ? "active" : undefined}>Scenario</NavLink></li>
                <li><NavLink to="/settings" className={({ isActive }) => isActive ? "active" : undefined}>Settings</NavLink></li>
                <li><NavLink to="/regions" className={({ isActive }) => isActive ? "active" : undefined}>Regions</NavLink></li>
                <li><NavLink to="/theaters" className={({ isActive }) => isActive ? "active" : undefined}>Theaters</NavLink></li>
                <li><NavLink to="/resources" className={({ isActive }) => isActive ? "active" : undefined}>Resources</NavLink></li>
                <li><NavLink to="/worldmarket" className={({ isActive }) => isActive ? "active" : undefined}>World Market</NavLink></li>
                <li><NavLink to="/orbat" className={({ isActive }) => isActive ? "active" : undefined}>Orbat</NavLink></li>
            </ul>
        </nav>
    );
};

export default Navbar;
