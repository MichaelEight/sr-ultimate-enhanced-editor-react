// ScenarioPage.jsx
import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const ScenarioPage = ({ project }) => {
  const { projectData, updateData } = useProject();
  const [scenarioData, setScenarioData] = useState({});
  const [isCacheNameSameAsScenario, setIsCacheNameSameAsScenario] = useState(false);
  const [isOOFSameAsMapName, setIsOOFSameAsMapName] = useState(false);
  const [expanded, setExpanded] = useState(['general', 'map']);

  // Load scenario data from context
  useEffect(() => {
    if (projectData?.scenario_data) {
      setScenarioData(projectData.scenario_data);
    }
  }, [projectData]);

  // Reset when project is closed
  useEffect(() => {
    if (!project) {
      setIsCacheNameSameAsScenario(false);
      setIsOOFSameAsMapName(false);
    }
  }, [project]);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(prev =>
      isExpanded ? [...prev, panel] : prev.filter(p => p !== panel)
    );
  };

  const getFilename = (ext) => {
    return scenarioData[ext]?.filename || '';
  };

  const updateFilename = (ext, newFileName) => {
    const updatedScenarioData = {
      ...scenarioData,
      [ext]: { ...scenarioData[ext], filename: newFileName },
    };

    if (ext === 'scenario' && isCacheNameSameAsScenario) {
      updatedScenarioData.sav = { ...scenarioData.sav, filename: newFileName };
    }

    if (ext === 'mapx' && isOOFSameAsMapName) {
      updatedScenarioData.oof = { ...scenarioData.oof, filename: newFileName };
    }

    setScenarioData(updatedScenarioData);
    updateData('scenario_data', updatedScenarioData);
  };

  const handleCacheNameSync = (checked) => {
    setIsCacheNameSameAsScenario(checked);
    if (checked) updateFilename('sav', getFilename('scenario'));
  };

  const handleOOFSync = (checked) => {
    setIsOOFSameAsMapName(checked);
    if (checked) updateFilename('oof', getFilename('mapx'));
  };

  if (!project) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Paper sx={{ p: 6, maxWidth: 600, mx: 'auto' }}>
          <FolderOpenIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>No Project Loaded</Typography>
          <Typography variant="body1" color="text.secondary">
            Please create a new project or upload an existing one using the sidebar.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="h5" sx={{ fontWeight: 600, flexGrow: 1 }}>
            Scenario Configuration
          </Typography>
          <Chip label="Project Loaded" color="success" size="small" />
        </Stack>
      </Paper>

      {/* General Information & Map Files */}
      <Accordion expanded={expanded.includes('general')} onChange={handleAccordionChange('general')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>General Information</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Scenario Name"
                value={getFilename('scenario')}
                onChange={(e) => updateFilename('scenario', e.target.value)}
                size="small"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cache Name"
                value={getFilename('sav')}
                onChange={(e) => updateFilename('sav', e.target.value)}
                size="small"
                required
                disabled={isCacheNameSameAsScenario}
              />
              <FormControlLabel
                control={<Checkbox checked={isCacheNameSameAsScenario} onChange={(e) => handleCacheNameSync(e.target.checked)} size="small" />}
                label="Same as Scenario"
                sx={{ mt: 0.5 }}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion expanded={expanded.includes('map')} onChange={handleAccordionChange('map')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Map Files</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Map Name"
                value={getFilename('mapx')}
                onChange={(e) => updateFilename('mapx', e.target.value)}
                size="small"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="OOF"
                value={getFilename('oof')}
                onChange={(e) => updateFilename('oof', e.target.value)}
                size="small"
                required
                disabled={isOOFSameAsMapName}
              />
              <FormControlLabel
                control={<Checkbox checked={isOOFSameAsMapName} onChange={(e) => handleOOFSync(e.target.checked)} size="small" />}
                label="Same as Map Name"
                sx={{ mt: 0.5 }}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Non-Editable Data Files */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Non-Editable Data Files</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4} md={3}>
              <TextField fullWidth label="UNIT" value={getFilename('unit')} onChange={(e) => updateFilename('unit', e.target.value)} size="small" />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <TextField fullWidth label="PPLX" value={getFilename('pplx')} onChange={(e) => updateFilename('pplx', e.target.value)} size="small" />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <TextField fullWidth label="TTRX" value={getFilename('ttrx')} onChange={(e) => updateFilename('ttrx', e.target.value)} size="small" />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <TextField fullWidth label="TERX" value={getFilename('terx')} onChange={(e) => updateFilename('terx', e.target.value)} size="small" />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <TextField fullWidth label="NEWSITEMS" value={getFilename('newsitems')} onChange={(e) => updateFilename('newsitems', e.target.value)} size="small" />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <TextField fullWidth label="PROFILE" value={getFilename('profile')} onChange={(e) => updateFilename('profile', e.target.value)} size="small" />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Editable Data Files */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Editable Data Files</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth label="CVP" value={getFilename('cvp')} onChange={(e) => updateFilename('cvp', e.target.value)} size="small" helperText="Regions/Theaters" />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth label="WMData" value={getFilename('wmdata')} onChange={(e) => updateFilename('wmdata', e.target.value)} size="small" helperText="World Market" />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth label="OOB" value={getFilename('oob')} onChange={(e) => updateFilename('oob', e.target.value)} size="small" helperText="Order of Battle" />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth label="REGIONINCL" value={getFilename('regionincl')} onChange={(e) => updateFilename('regionincl', e.target.value)} size="small" helperText="Region Inclusion" />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Cache Files */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Cache Files</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Pre-Cache" value={getFilename('pre')} onChange={(e) => updateFilename('pre', e.target.value)} size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Post-Cache" value={getFilename('post')} onChange={(e) => updateFilename('post', e.target.value)} size="small" />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Alert severity="info" sx={{ mt: 2 }}>
        Changes are saved automatically. Navigate to other pages to edit scenario data.
      </Alert>
    </Box>
  );
};

export default ScenarioPage;
