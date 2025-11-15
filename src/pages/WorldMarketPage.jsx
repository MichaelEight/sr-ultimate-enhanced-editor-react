// WorldMarketPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useProject } from '../context/ProjectContext';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const WorldMarketPage = ({ activeTab }) => {
  const { projectData, updateData } = useProject();
  const [worldMarketData, setWorldMarketData] = useState({});
  const [expanded, setExpanded] = useState(['settings']);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(prev =>
      isExpanded ? [...prev, panel] : prev.filter(p => p !== panel)
    );
  };

  const loadWorldMarketData = useCallback(() => {
    if (projectData?.worldmarket_data) {
      setWorldMarketData(projectData.worldmarket_data);
    }
  }, [projectData]);

  useEffect(() => {
    if (activeTab === '/worldmarket') {
      loadWorldMarketData();
    }
  }, [activeTab, loadWorldMarketData]);

  const handleInputChange = (category, field, value) => {
    const numericValue = value === '' ? '' : Number(value);

    setWorldMarketData((prevData) => ({
      ...prevData,
      [category]: {
        ...prevData[category],
        [field]: numericValue
      }
    }));

    const updatedWorldMarket = {
      ...projectData.worldmarket_data,
      [category]: {
        ...projectData.worldmarket_data[category],
        [field]: numericValue
      }
    };
    updateData('worldmarket_data', updatedWorldMarket);
  };

  const handleNestedChange = (category, parent, field, value) => {
    const numericValue = Number(value) || 0;

    setWorldMarketData((prevData) => ({
      ...prevData,
      [category]: {
        ...prevData[category],
        [parent]: {
          ...prevData[category]?.[parent],
          [field]: numericValue
        }
      }
    }));

    const updatedWorldMarket = {
      ...projectData.worldmarket_data,
      [category]: {
        ...projectData.worldmarket_data[category],
        [parent]: {
          ...projectData.worldmarket_data[category]?.[parent],
          [field]: numericValue
        }
      }
    };
    updateData('worldmarket_data', updatedWorldMarket);
  };

  const settings = worldMarketData.settings || {};
  const military = worldMarketData.military || {};
  const economic = worldMarketData.economic || {};

  const battleStrengthFields = military.battstrdefault ? Object.keys(military.battstrdefault).map(key => ({
    key,
    label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
  })) : [];

  const socialDefaultsFields = economic.socialdefaults ? Object.keys(economic.socialdefaults).map(key => ({
    key,
    label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
  })) : [];

  const hexMultipliersFields = economic.hexresourcemultiplier ? Object.keys(economic.hexresourcemultiplier).map(key => ({
    key,
    label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
  })) : [];

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="h5" sx={{ fontWeight: 600, flexGrow: 1 }}>
            World Market Settings
          </Typography>
          <Chip label="Global Economy" color="primary" size="small" />
        </Stack>
      </Paper>

      <Accordion expanded={expanded.includes('settings')} onChange={handleAccordionChange('settings')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>General Settings</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4}>
              <TextField
                fullWidth
                label="Prime Rate"
                type="number"
                value={settings.primerate ?? ''}
                onChange={(e) => handleInputChange('settings', 'primerate', e.target.value)}
                size="small"
                inputProps={{ step: 0.01 }}
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField
                fullWidth
                label="Social Adjustment"
                type="number"
                value={settings.socadj ?? ''}
                onChange={(e) => handleInputChange('settings', 'socadj', e.target.value)}
                size="small"
                inputProps={{ step: 0.01 }}
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField
                fullWidth
                label="WM Relation Rate"
                type="number"
                value={settings.wmrelrate ?? ''}
                onChange={(e) => handleInputChange('settings', 'wmrelrate', e.target.value)}
                size="small"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Battle Strength Defaults</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {battleStrengthFields.map(({ key, label }) => (
              <Grid item xs={6} sm={4} md={3} key={key}>
                <TextField
                  fullWidth
                  label={label}
                  type="number"
                  value={military.battstrdefault?.[key] ?? ''}
                  onChange={(e) => handleNestedChange('military', 'battstrdefault', key, e.target.value)}
                  size="small"
                />
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Social Defaults</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {socialDefaultsFields.map(({ key, label }) => (
              <Grid item xs={6} sm={4} md={3} key={key}>
                <TextField
                  fullWidth
                  label={label}
                  type="number"
                  value={economic.socialdefaults?.[key] ?? ''}
                  onChange={(e) => handleNestedChange('economic', 'socialdefaults', key, e.target.value)}
                  size="small"
                />
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Hex Resource Multipliers</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {hexMultipliersFields.map(({ key, label }) => (
              <Grid item xs={6} sm={4} md={3} key={key}>
                <TextField
                  fullWidth
                  label={label}
                  type="number"
                  value={economic.hexresourcemultiplier?.[key] ?? ''}
                  onChange={(e) => handleNestedChange('economic', 'hexresourcemultiplier', key, e.target.value)}
                  size="small"
                  inputProps={{ step: 0.01 }}
                />
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default WorldMarketPage;
