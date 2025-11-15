// SettingsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useProject } from '../context/ProjectContext';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const SettingsPage = ({ activeTab, project }) => {
  const { projectData, updateData } = useProject();
  const [settings, setSettings] = useState({});
  const [expanded, setExpanded] = useState(['general']);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(prev =>
      isExpanded ? [...prev, panel] : prev.filter(p => p !== panel)
    );
  };

  const loadSettings = useCallback(() => {
    if (projectData?.settings_data) {
      const s = projectData.settings_data;
      const formatDate = (dateArray) => {
        if (!dateArray || dateArray.length !== 3) return '';
        const [year, month, day] = dateArray;
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      };

      setSettings({
        startingDate: s.startymd ? formatDate(s.startymd) : new Date().toISOString().substr(0, 10),
        scenarioId: s.scenarioid ?? '',
        fastForwardDays: s.fastfwddays ?? '',
        defaultRegion: s.defaultregion ?? '',
        militaryDifficulty: s.difficulty?.[0] ?? 2,
        economicDifficulty: s.difficulty?.[1] ?? 2,
        diplomaticDifficulty: s.difficulty?.[2] ?? 2,
        gameLength: s.gamelength ?? 0,
        victory: s.svictorycond ?? 0,
        victoryHexX: s.victoryhex?.[0] ?? '',
        victoryHexY: s.victoryhex?.[1] ?? '',
        victoryTech: s.victorytech ?? '',
        resourcesLevel: s.resources ?? 2,
        initialFunds: s.initialfunds ?? 2,
        globalAIStance: s.aistance ?? 0,
        nukeEffect: s.wmduse ?? 2,
        approvalEffect: s.approvaleff ?? 0,
        guiLevel: s.mapgui ?? 0,
        mapSplash: s.mapsplash ?? '',
        mapMusic: s.mapmusic ?? '',
        startingYear: s.startingyear ?? '',
        techTreeDefault: s.techtreedefault ?? '',
        regionAllies: s.regionalallies ?? '',
        regionAxis: s.regionalaxis ?? '',
        sphereNN: s.spherenn ?? '',
        fixedCapitals: s.fixedcapitals === 1,
        criticalUN: s.criticalun === 1,
        allowNukes: s.allownukes === 1,
        alliedVictory: s.alliedvictory === 1,
        noStartingDebt: s.debtfree === 1,
        limitDarEffect: s.limitdareffect === 1,
        limitRegionsInScenario: s.limitregionsinscenario === 1,
        restrictTechTrade: s.restricttechtrade === 1,
        regionEquip: s.regionequip === 1,
        fastBuild: s.fastbuild === 1,
        noLoyaltyPenalty: s.noloypenalty === 1,
        missileLimit: s.missilenolimit === 1,
        reserveLimit: s.reservelimit === 1,
        groupLoyaltyMerge: s.grouployaltymerge === 1,
        groupResearchMerge: s.groupresearchmerge === 1,
        limitMarEffect: s.limitmareffect === 1,
        noSphere: s.nosphere === 1,
        campaignGame: s.campaigngame === 1,
        govChoice: s.govchoice === 1,
        thirdPartyRelationsEffect: s.thirdpartyrelationseffect === 1,
      });
    }
  }, [projectData]);

  useEffect(() => {
    if (activeTab === '/settings' && project) {
      loadSettings();
    } else if (!project) {
      setSettings({});
    }
  }, [activeTab, project, loadSettings]);

  const handleChange = (name, value, type) => {
    setSettings(prev => ({ ...prev, [name]: value }));

    const updatedSettings = { ...projectData.settings_data };

    if (name === 'startingDate') {
      updatedSettings.startymd = value ? value.split('-').map(Number) : [];
    } else if (['militaryDifficulty', 'economicDifficulty', 'diplomaticDifficulty'].includes(name)) {
      const idx = { militaryDifficulty: 0, economicDifficulty: 1, diplomaticDifficulty: 2 }[name];
      updatedSettings.difficulty = [...(updatedSettings.difficulty || [2, 2, 2])];
      updatedSettings.difficulty[idx] = type === 'number' ? Number(value) : value;
    } else if (['victoryHexX', 'victoryHexY'].includes(name)) {
      const idx = name === 'victoryHexX' ? 0 : 1;
      updatedSettings.victoryhex = [...(updatedSettings.victoryhex || [0, 0])];
      updatedSettings.victoryhex[idx] = Number(value) || 0;
    } else {
      const keyMap = {
        scenarioId: 'scenarioid', fastForwardDays: 'fastfwddays', defaultRegion: 'defaultregion',
        gameLength: 'gamelength', victory: 'svictorycond', victoryTech: 'victorytech',
        resourcesLevel: 'resources', initialFunds: 'initialfunds', globalAIStance: 'aistance',
        nukeEffect: 'wmduse', approvalEffect: 'approvaleff', guiLevel: 'mapgui',
        mapSplash: 'mapsplash', mapMusic: 'mapmusic', startingYear: 'startingyear',
        techTreeDefault: 'techtreedefault', regionAllies: 'regionalallies', regionAxis: 'regionalaxis',
        sphereNN: 'spherenn', fixedCapitals: 'fixedcapitals', criticalUN: 'criticalun',
        allowNukes: 'allownukes', alliedVictory: 'alliedvictory', noStartingDebt: 'debtfree',
        limitDarEffect: 'limitdareffect', limitRegionsInScenario: 'limitregionsinscenario',
        restrictTechTrade: 'restricttechtrade', regionEquip: 'regionequip', fastBuild: 'fastbuild',
        noLoyaltyPenalty: 'noloypenalty', missileLimit: 'missilenolimit', reserveLimit: 'reservelimit',
        groupLoyaltyMerge: 'grouployaltymerge', groupResearchMerge: 'groupresearchmerge',
        limitMarEffect: 'limitmareffect', noSphere: 'nosphere', campaignGame: 'campaigngame',
        govChoice: 'govchoice', thirdPartyRelationsEffect: 'thirdpartyrelationseffect'
      };
      const backendKey = keyMap[name] || name;
      updatedSettings[backendKey] = type === 'checkbox' ? (value ? 1 : 0) : (type === 'number' ? Number(value) : value);
    }

    updateData('settings_data', updatedSettings);
  };

  const difficultyOptions = ['Very Easy', 'Easy', 'Normal', 'Hard', 'Very Hard'];
  const resourcesOptions = ['Depleted', 'Dwindling', 'Standard', 'Abundant'];
  const fundsOptions = ['No New Bonds', 'Low', 'Default', 'High'];
  const gameLengthOptions = ['None', '120 months', '108 months', '96 months', '84 months', '72 months', '60 months', '48 months', '36 months', '24 months', '18 months', '12 months', '6 months'];
  const victoryOptions = ['Complete', 'Capital', 'Capture', 'Unification', 'Total Score', 'Diplomatic Score', 'Economic Score', 'Technology Score', 'Approval Score', 'Military Score', 'Sphere', 'Victory Points'];
  const aiStanceOptions = ['Normal', 'Passive', 'Defensive', 'Aggressive', 'Unpredictable', 'None'];
  const nukeEffectOptions = ['Low', 'Medium', 'High'];
  const approvalOptions = ['Low', 'Medium', 'High'];
  const guiLevelOptions = ['Skin 0 - 1936', 'Skin 1 - 1954', 'Skin 2 - 2020', 'Skin 3 - 1914'];

  if (!project) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Please load a project to edit settings
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="h5" sx={{ fontWeight: 600, flexGrow: 1 }}>
            Scenario Settings
          </Typography>
          <Chip label="45+ Settings" color="primary" size="small" />
        </Stack>
      </Paper>

      {/* General Info */}
      <Accordion expanded={expanded.includes('general')} onChange={handleAccordionChange('general')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>General Info</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="Starting Date" type="date" value={settings.startingDate || ''} onChange={(e) => handleChange('startingDate', e.target.value, 'date')} size="small" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="Scenario ID" type="number" value={settings.scenarioId || ''} onChange={(e) => handleChange('scenarioId', e.target.value, 'number')} size="small" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="Fast Forward Days" type="number" value={settings.fastForwardDays || ''} onChange={(e) => handleChange('fastForwardDays', e.target.value, 'number')} size="small" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="Default Region" type="number" value={settings.defaultRegion || ''} onChange={(e) => handleChange('defaultRegion', e.target.value, 'number')} size="small" />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Difficulties */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Difficulties</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel shrink>Military</InputLabel>
                <Select value={settings.militaryDifficulty ?? 2} onChange={(e) => handleChange('militaryDifficulty', e.target.value, 'number')} notched>
                  {difficultyOptions.map((opt, idx) => <MenuItem key={idx} value={idx}>{opt}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel shrink>Economic</InputLabel>
                <Select value={settings.economicDifficulty ?? 2} onChange={(e) => handleChange('economicDifficulty', e.target.value, 'number')} notched>
                  {difficultyOptions.map((opt, idx) => <MenuItem key={idx} value={idx}>{opt}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel shrink>Diplomatic</InputLabel>
                <Select value={settings.diplomaticDifficulty ?? 2} onChange={(e) => handleChange('diplomaticDifficulty', e.target.value, 'number')} notched>
                  {difficultyOptions.map((opt, idx) => <MenuItem key={idx} value={idx}>{opt}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Victory Conditions */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Victory Conditions</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel shrink>Game Length</InputLabel>
                <Select value={settings.gameLength ?? 0} onChange={(e) => handleChange('gameLength', e.target.value, 'number')} notched>
                  {gameLengthOptions.map((opt, idx) => <MenuItem key={idx} value={idx}>{opt}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel shrink>Victory Type</InputLabel>
                <Select value={settings.victory ?? 0} onChange={(e) => handleChange('victory', e.target.value, 'number')} notched>
                  {victoryOptions.map((opt, idx) => <MenuItem key={idx} value={idx}>{opt}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <TextField fullWidth label="Victory Hex X" type="number" value={settings.victoryHexX || ''} onChange={(e) => handleChange('victoryHexX', e.target.value, 'number')} size="small" />
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <TextField fullWidth label="Victory Hex Y" type="number" value={settings.victoryHexY || ''} onChange={(e) => handleChange('victoryHexY', e.target.value, 'number')} size="small" />
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <TextField fullWidth label="Victory Tech" type="number" value={settings.victoryTech || ''} onChange={(e) => handleChange('victoryTech', e.target.value, 'number')} size="small" />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Starting Conditions */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Starting Conditions</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel shrink>Resources Level</InputLabel>
                <Select value={settings.resourcesLevel ?? 2} onChange={(e) => handleChange('resourcesLevel', e.target.value, 'number')} notched>
                  {resourcesOptions.map((opt, idx) => <MenuItem key={idx} value={idx}>{opt}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel shrink>Initial Funds</InputLabel>
                <Select value={settings.initialFunds ?? 2} onChange={(e) => handleChange('initialFunds', e.target.value, 'number')} notched>
                  {fundsOptions.map((opt, idx) => <MenuItem key={idx} value={idx}>{opt}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* AI Settings */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>AI Settings</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel shrink>Global AI Stance</InputLabel>
                <Select value={settings.globalAIStance ?? 0} onChange={(e) => handleChange('globalAIStance', e.target.value, 'number')} notched>
                  {aiStanceOptions.map((opt, idx) => <MenuItem key={idx} value={idx}>{opt}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel shrink>Nuke Effect</InputLabel>
                <Select value={settings.nukeEffect ?? 2} onChange={(e) => handleChange('nukeEffect', e.target.value, 'number')} notched>
                  {nukeEffectOptions.map((opt, idx) => <MenuItem key={idx} value={idx}>{opt}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel shrink>Approval Effect</InputLabel>
                <Select value={settings.approvalEffect ?? 0} onChange={(e) => handleChange('approvalEffect', e.target.value, 'number')} notched>
                  {approvalOptions.map((opt, idx) => <MenuItem key={idx} value={idx}>{opt}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Graphics Options */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Graphics Options</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel shrink>GUI Level</InputLabel>
                <Select value={settings.guiLevel ?? 0} onChange={(e) => handleChange('guiLevel', e.target.value, 'number')} notched>
                  {guiLevelOptions.map((opt, idx) => <MenuItem key={idx} value={idx}>{opt}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Map Splash" value={settings.mapSplash || ''} onChange={(e) => handleChange('mapSplash', e.target.value, 'text')} size="small" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Map Music" value={settings.mapMusic || ''} onChange={(e) => handleChange('mapMusic', e.target.value, 'text')} size="small" />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Miscellaneous */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Miscellaneous</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="Starting Year" type="number" value={settings.startingYear || ''} onChange={(e) => handleChange('startingYear', e.target.value, 'number')} size="small" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="Tech Tree Default" value={settings.techTreeDefault || ''} onChange={(e) => handleChange('techTreeDefault', e.target.value, 'text')} size="small" />
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <TextField fullWidth label="Region Allies" value={settings.regionAllies || ''} onChange={(e) => handleChange('regionAllies', e.target.value, 'text')} size="small" />
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <TextField fullWidth label="Region Axis" value={settings.regionAxis || ''} onChange={(e) => handleChange('regionAxis', e.target.value, 'text')} size="small" />
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <TextField fullWidth label="Sphere NN" value={settings.sphereNN || ''} onChange={(e) => handleChange('sphereNN', e.target.value, 'text')} size="small" />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Scenario Options */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Scenario Options</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={1}>
            {[
              { key: 'fixedCapitals', label: 'Fixed Capitals' },
              { key: 'criticalUN', label: 'Critical UN' },
              { key: 'allowNukes', label: 'Allow Nukes' },
              { key: 'alliedVictory', label: 'Allied Victory' },
              { key: 'noStartingDebt', label: 'No Starting Debt' },
              { key: 'limitDarEffect', label: 'Limit DAR Effect' },
              { key: 'limitRegionsInScenario', label: 'Limit Regions' },
              { key: 'restrictTechTrade', label: 'Restrict Tech Trade' },
              { key: 'regionEquip', label: 'Region Equip' },
              { key: 'fastBuild', label: 'Fast Build' },
              { key: 'noLoyaltyPenalty', label: 'No Loyalty Penalty' },
              { key: 'missileLimit', label: 'Missile Limit' },
              { key: 'reserveLimit', label: 'Reserve Limit' },
              { key: 'groupLoyaltyMerge', label: 'Group Loyalty Merge' },
              { key: 'groupResearchMerge', label: 'Group Research Merge' },
              { key: 'limitMarEffect', label: 'Limit MAR Effect' },
              { key: 'noSphere', label: 'No Sphere' },
              { key: 'campaignGame', label: 'Campaign Game' },
              { key: 'govChoice', label: 'Gov Choice' },
              { key: 'thirdPartyRelationsEffect', label: '3rd Party Relations' },
            ].map(({ key, label }) => (
              <Grid item xs={6} sm={4} md={3} key={key}>
                <FormControlLabel
                  control={<Checkbox checked={settings[key] || false} onChange={(e) => handleChange(key, e.target.checked, 'checkbox')} size="small" />}
                  label={label}
                />
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default SettingsPage;
