import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav>
            <ul>
                <li>
                    <NavLink to="/" exact="true" className={({ isActive }) => isActive ? "active" : undefined}>Home</NavLink>
                </li>
                <li>
                    <NavLink to="/scenario" className={({ isActive }) => isActive ? "active" : undefined}>Scenario</NavLink>
                </li>
                <li>
                    <NavLink to="/settings" className={({ isActive }) => isActive ? "active" : undefined}>Settings</NavLink>
                </li>
                <li>
                    <NavLink to="/regions" className={({ isActive }) => isActive ? "active" : undefined}>Regions</NavLink>
                </li>
                <li>
                    <NavLink to="/theaters" className={({ isActive }) => isActive ? "active" : undefined}>Theaters</NavLink>
                </li>
                <li>
                    <NavLink to="/resources" className={({ isActive }) => isActive ? "active" : undefined}>Resources</NavLink>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
