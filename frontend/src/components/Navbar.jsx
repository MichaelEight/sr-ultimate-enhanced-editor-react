// src/components/Navbar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav>
            <ul>
                <li><NavLink exact to="/" activeClassName="active">Home</NavLink></li>
                <li><NavLink to="/scenario" activeClassName="active">Scenario</NavLink></li>
                <li><NavLink to="/settings" activeClassName="active">Settings</NavLink></li>
                <li><NavLink to="/regions" activeClassName="active">Regions</NavLink></li>
                <li><NavLink to="/theaters" activeClassName="active">Theaters</NavLink></li>
                <li><NavLink to="/resources" activeClassName="active">Resources</NavLink></li>
            </ul>
        </nav>
    );
};

export default Navbar;
