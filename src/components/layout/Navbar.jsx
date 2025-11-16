// src/components/Navbar.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Box from '@mui/material/Box';
import { useTheme } from '../../context/ThemeContext';

const Navbar = ({ project, drawerOpen, toggleDrawer, drawerWidth }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { mode, toggleTheme } = useTheme();

    const navItems = [
        { label: 'Scenario', path: '/', alwaysVisible: true },
        { label: 'Settings', path: '/settings', alwaysVisible: false },
        { label: 'Regions', path: '/regions', alwaysVisible: false },
        { label: 'Theaters', path: '/theaters', alwaysVisible: false },
        { label: 'Resources', path: '/resources', alwaysVisible: false },
        { label: 'World Market', path: '/worldmarket', alwaysVisible: false },
        { label: 'Orbat', path: '/orbat', alwaysVisible: false },
    ];

    const visibleItems = navItems.filter(item => item.alwaysVisible || project);
    const currentTabIndex = visibleItems.findIndex(item => item.path === location.pathname);

    const handleTabChange = (event, newValue) => {
        navigate(visibleItems[newValue].path);
    };

    return (
        <AppBar
            position="fixed"
            sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1,
                transition: theme => theme.transitions.create(['width', 'margin'], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
            }}
        >
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="toggle drawer"
                    onClick={toggleDrawer}
                    edge="start"
                    sx={{ mr: 2 }}
                >
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6" noWrap component="div" sx={{ mr: 4 }}>
                    Supreme Ruler Enhanced Editor
                </Typography>
                <Box sx={{ flexGrow: 1 }}>
                    <Tabs
                        value={currentTabIndex >= 0 ? currentTabIndex : 0}
                        onChange={handleTabChange}
                        textColor="inherit"
                        indicatorColor="secondary"
                        sx={{
                            '& .MuiTab-root': {
                                color: 'rgba(255, 255, 255, 0.7)',
                                '&.Mui-selected': {
                                    color: 'white',
                                },
                            },
                        }}
                    >
                        {visibleItems.map((item, index) => (
                            <Tab key={index} label={item.label} />
                        ))}
                    </Tabs>
                </Box>
                <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
                    <IconButton
                        color="inherit"
                        onClick={toggleTheme}
                        sx={{ ml: 2 }}
                    >
                        {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                    </IconButton>
                </Tooltip>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
