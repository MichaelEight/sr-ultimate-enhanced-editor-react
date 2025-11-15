// ResourcesPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useProject } from '../context/ProjectContext';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const ResourcesPage = ({ activeTab }) => {
  const { projectData, updateData } = useProject();
  const [selectedResource, setSelectedResource] = useState('agriculture');
  const [resourceData, setResourceData] = useState({});
  const [expanded, setExpanded] = useState(['cost', 'production']);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(prev =>
      isExpanded ? [...prev, panel] : prev.filter(p => p !== panel)
    );
  };

  const loadResourcesData = useCallback(() => {
    if (projectData?.resources_data) {
      const processedData = { ...projectData.resources_data };
      Object.keys(processedData).forEach((resourceName) => {
        const resource = processedData[resourceName];
        ['cost', 'production', 'producefrom'].forEach((group) => {
          if (resource[group]) {
            Object.keys(resource[group]).forEach((field) => {
              if (resource[group][field] === null || resource[group][field] === undefined) {
                processedData[resourceName][group][field] = 0;
              }
            });
          }
        });
      });
      setResourceData(processedData);
    }
  }, [projectData]);

  useEffect(() => {
    if (activeTab === '/resources') {
      loadResourcesData();
    }
  }, [activeTab, loadResourcesData]);

  const handleInputChange = (fieldGroup, name, value) => {
    const numericValue = value === '' ? '' : Number(value);

    setResourceData((prevData) => {
      const updatedData = { ...prevData };
      if (!updatedData[selectedResource]) updatedData[selectedResource] = {};
      if (!updatedData[selectedResource][fieldGroup]) updatedData[selectedResource][fieldGroup] = {};
      updatedData[selectedResource][fieldGroup][name] = numericValue;
      return updatedData;
    });

    const updatedResources = {
      ...projectData.resources_data,
      [selectedResource]: {
        ...projectData.resources_data[selectedResource],
        [fieldGroup]: {
          ...projectData.resources_data[selectedResource]?.[fieldGroup],
          [name]: numericValue
        }
      }
    };
    updateData('resources_data', updatedResources);
  };

  const resourcesList = [
    { key: 'agriculture', label: 'Agriculture' },
    { key: 'rubber', label: 'Rubber' },
    { key: 'timber', label: 'Timber' },
    { key: 'petroleum', label: 'Petroleum' },
    { key: 'coal', label: 'Coal' },
    { key: 'ore', label: 'Ore' },
    { key: 'uranium', label: 'Uranium' },
    { key: 'electricity', label: 'Electricity' },
    { key: 'consumergoods', label: 'Consumer Goods' },
    { key: 'militarygoods', label: 'Military Goods' },
    { key: 'industrialgoods', label: 'Industrial Goods' },
  ];

  const selectedResourceData = resourceData[selectedResource] || {};
  const { cost = {}, production = {}, producefrom = {} } = selectedResourceData;

  const costFields = [
    { label: 'Base Cost', name: 'wmbasecost' },
    { label: 'Full Cost', name: 'wmfullcost' },
    { label: 'Margin', name: 'wmmargin' },
  ];

  const productionFields = [
    { label: 'Node Production', name: 'nodeproduction' },
    { label: 'Max Prod/Person', name: 'wmprodperpersonmax' },
    { label: 'Min Prod/Person', name: 'wmprodperpersonmin' },
    { label: 'Urban Production', name: 'wmurbanproduction' },
  ];

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, flexGrow: 1 }}>
            Resources Editor
          </Typography>
          <Chip label="11 Resources" color="primary" size="small" />
        </Stack>

        <ToggleButtonGroup
          value={selectedResource}
          exclusive
          onChange={(e, newValue) => newValue && setSelectedResource(newValue)}
          size="small"
          sx={{ flexWrap: 'wrap', gap: 0.5 }}
        >
          {resourcesList.map(({ key, label }) => (
            <ToggleButton key={key} value={key}>
              {label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Paper>

      <Accordion expanded={expanded.includes('cost')} onChange={handleAccordionChange('cost')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Cost</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {costFields.map(({ label, name }) => (
              <Grid item xs={6} sm={4} key={name}>
                <TextField
                  fullWidth
                  label={label}
                  type="number"
                  value={cost[name] ?? ''}
                  onChange={(e) => handleInputChange('cost', name, e.target.value)}
                  size="small"
                />
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion expanded={expanded.includes('production')} onChange={handleAccordionChange('production')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Production</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {productionFields.map(({ label, name }) => (
              <Grid item xs={6} sm={3} key={name}>
                <TextField
                  fullWidth
                  label={label}
                  type="number"
                  value={production[name] ?? ''}
                  onChange={(e) => handleInputChange('production', name, e.target.value)}
                  size="small"
                />
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Produced From (Resource Dependencies)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Specify how much of each resource is needed to produce this resource
          </Typography>
          <Grid container spacing={2}>
            {resourcesList.map(({ key, label }) => (
              <Grid item xs={6} sm={4} md={3} key={key}>
                <TextField
                  fullWidth
                  label={label}
                  type="number"
                  value={producefrom[key] ?? ''}
                  onChange={(e) => handleInputChange('producefrom', key, e.target.value)}
                  size="small"
                />
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default ResourcesPage;
