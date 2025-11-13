// ScenarioPage.jsx
import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

const ScenarioPage = ({ project }) => {
  const { projectData, updateData } = useProject();
  const [scenarioData, setScenarioData] = useState({});
  const [isCacheNameSameAsScenario, setIsCacheNameSameAsScenario] = useState(false);
  const [isOOFSameAsMapName, setIsOOFSameAsMapName] = useState(false);

  // Load scenario data from context
  useEffect(() => {
    if (projectData?.scenario_data) {
      setScenarioData(projectData.scenario_data);
    }
  }, [projectData]);

  // Reset checkboxes when project is closed
  useEffect(() => {
    if (!project) {
      setIsCacheNameSameAsScenario(false);
      setIsOOFSameAsMapName(false);
    }
  }, [project]);

  // Helper to get filename
  const getFilename = (ext) => {
    return scenarioData[ext]?.filename || '';
  };

  // Update filename in context
  const updateFilename = (ext, newFileName) => {
    const updatedScenarioData = {
      ...scenarioData,
      [ext]: {
        ...scenarioData[ext],
        filename: newFileName,
      },
    };

    // Handle synchronization
    if (ext === 'scenario' && isCacheNameSameAsScenario) {
      updatedScenarioData.sav = {
        ...scenarioData.sav,
        filename: newFileName,
      };
    }

    if (ext === 'mapx' && isOOFSameAsMapName) {
      updatedScenarioData.oof = {
        ...scenarioData.oof,
        filename: newFileName,
      };
    }

    setScenarioData(updatedScenarioData);
    updateData('scenario_data', updatedScenarioData);
  };

  // Handle checkbox changes
  const handleCacheNameSync = (checked) => {
    setIsCacheNameSameAsScenario(checked);
    if (checked) {
      updateFilename('sav', getFilename('scenario'));
    }
  };

  const handleOOFSync = (checked) => {
    setIsOOFSameAsMapName(checked);
    if (checked) {
      updateFilename('oof', getFilename('mapx'));
    }
  };

  if (!project) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Paper sx={{ p: 6, maxWidth: 600, mx: 'auto' }}>
          <FolderOpenIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No Project Loaded
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Please create a new project or upload an existing one using the sidebar to get started.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="h5" sx={{ fontWeight: 600, flexGrow: 1 }}>
            Scenario Configuration
          </Typography>
          <Chip label="Project Loaded" color="success" variant="outlined" />
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Configure file references and project settings for your scenario.
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {/* General Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                General Information
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <TextField
                fullWidth
                label="Scenario Name"
                value={getFilename('scenario')}
                onChange={(e) => updateFilename('scenario', e.target.value)}
                margin="normal"
                required
                helperText="Main scenario file name"
              />

              <TextField
                fullWidth
                label="Cache Name"
                value={getFilename('sav')}
                onChange={(e) => updateFilename('sav', e.target.value)}
                margin="normal"
                required
                disabled={isCacheNameSameAsScenario}
                helperText="Save cache file name"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={isCacheNameSameAsScenario}
                    onChange={(e) => handleCacheNameSync(e.target.checked)}
                  />
                }
                label="Same as Scenario Name"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Map Files */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Map Files
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <TextField
                fullWidth
                label="Map Name"
                value={getFilename('mapx')}
                onChange={(e) => updateFilename('mapx', e.target.value)}
                margin="normal"
                required
                helperText="Map file name (.MAPX)"
              />

              <TextField
                fullWidth
                label="OOF"
                value={getFilename('oof')}
                onChange={(e) => updateFilename('oof', e.target.value)}
                margin="normal"
                required
                disabled={isOOFSameAsMapName}
                helperText="OOF file name"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={isOOFSameAsMapName}
                    onChange={(e) => handleOOFSync(e.target.checked)}
                  />
                }
                label="Same as Map Name"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Non-Editable Data Files */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Non-Editable Data Files
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="UNIT"
                    value={getFilename('unit')}
                    onChange={(e) => updateFilename('unit', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="PPLX"
                    value={getFilename('pplx')}
                    onChange={(e) => updateFilename('pplx', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="TTRX"
                    value={getFilename('ttrx')}
                    onChange={(e) => updateFilename('ttrx', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="TERX"
                    value={getFilename('terx')}
                    onChange={(e) => updateFilename('terx', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="NEWSITEMS"
                    value={getFilename('newsitems')}
                    onChange={(e) => updateFilename('newsitems', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="PROFILE"
                    value={getFilename('profile')}
                    onChange={(e) => updateFilename('profile', e.target.value)}
                    size="small"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Editable Data Files */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Editable Data Files
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="CVP"
                    value={getFilename('cvp')}
                    onChange={(e) => updateFilename('cvp', e.target.value)}
                    size="small"
                    helperText="Regions & Theaters"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="WMData"
                    value={getFilename('wmdata')}
                    onChange={(e) => updateFilename('wmdata', e.target.value)}
                    size="small"
                    helperText="World Market"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="OOB"
                    value={getFilename('oob')}
                    onChange={(e) => updateFilename('oob', e.target.value)}
                    size="small"
                    helperText="Order of Battle"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="REGIONINCL"
                    value={getFilename('regionincl')}
                    onChange={(e) => updateFilename('regionincl', e.target.value)}
                    size="small"
                    helperText="Region Inclusion"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cache Files */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Cache Files
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Pre-Cache"
                    value={getFilename('pre')}
                    onChange={(e) => updateFilename('pre', e.target.value)}
                    size="small"
                    helperText="Pre-cache file"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Post-Cache"
                    value={getFilename('post')}
                    onChange={(e) => updateFilename('post', e.target.value)}
                    size="small"
                    helperText="Post-cache file"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Alert severity="info" sx={{ mt: 3 }}>
        Changes are saved automatically. Navigate to other pages to edit scenario data (Settings, Regions, Theaters, etc.)
      </Alert>
    </Box>
  );
};

export default ScenarioPage;
