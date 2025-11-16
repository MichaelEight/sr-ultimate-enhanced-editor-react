// src/context/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { createAppTheme } from '../theme';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    // Default to dark theme
    const [mode, setMode] = useState(() => {
        const savedMode = localStorage.getItem('themeMode');
        return savedMode || 'dark';
    });

    useEffect(() => {
        localStorage.setItem('themeMode', mode);

        // Inject CSS variables for dark/light theme
        const root = document.documentElement;
        if (mode === 'dark') {
            root.style.setProperty('--bg-default', '#121212');
            root.style.setProperty('--bg-paper', '#1e1e1e');
            root.style.setProperty('--bg-section', '#2a2a2a');
            root.style.setProperty('--text-primary', '#ffffff');
            root.style.setProperty('--text-secondary', 'rgba(255, 255, 255, 0.7)');
            root.style.setProperty('--text-label', '#e0e0e0');
            root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.12)');
            root.style.setProperty('--input-border', '#555');
            root.style.setProperty('--input-bg', '#2a2a2a');
            root.style.setProperty('--primary-color', '#90caf9');
            root.style.setProperty('--success-color', '#66bb6a');
            root.style.setProperty('--navbar-bg', '#1e1e1e');
        } else {
            root.style.setProperty('--bg-default', '#f5f5f5');
            root.style.setProperty('--bg-paper', '#ffffff');
            root.style.setProperty('--bg-section', '#ffffff');
            root.style.setProperty('--text-primary', 'rgba(0, 0, 0, 0.87)');
            root.style.setProperty('--text-secondary', 'rgba(0, 0, 0, 0.6)');
            root.style.setProperty('--text-label', '#333');
            root.style.setProperty('--border-color', 'rgba(0, 0, 0, 0.12)');
            root.style.setProperty('--input-border', '#ced4da');
            root.style.setProperty('--input-bg', '#ffffff');
            root.style.setProperty('--primary-color', '#1976d2');
            root.style.setProperty('--success-color', '#2e7d32');
            root.style.setProperty('--navbar-bg', '#333');
        }
    }, [mode]);

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    const theme = useMemo(() => createAppTheme(mode), [mode]);

    const value = {
        mode,
        toggleTheme,
    };

    return (
        <ThemeContext.Provider value={value}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};
