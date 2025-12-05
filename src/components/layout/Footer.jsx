// src/components/layout/Footer.jsx
import React from 'react';
import { Typography, Box } from '@mui/material';
import packageJson from '../../../package.json';

const Footer = () => {
    return (
        <Box
            sx={{
                position: 'fixed',
                bottom: 8,
                left: 8,
                zIndex: 1000,
            }}
        >
            <Typography
                variant="caption"
                sx={{ color: 'text.secondary', opacity: 0.7 }}
            >
                v{packageJson.version}
            </Typography>
        </Box>
    );
};

export default Footer;