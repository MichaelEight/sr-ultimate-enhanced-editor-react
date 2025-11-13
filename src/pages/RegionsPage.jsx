// RegionsPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useProject } from '../context/ProjectContext';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

const RegionsPage = ({ activeTab, project }) => {
  const { projectData, updateData } = useProject();
  const [regions, setRegions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({});

  // Load regions data from ProjectContext
  const loadRegionsData = useCallback(() => {
    if (projectData && projectData.regions_data) {
      const regionsWithStatus = projectData.regions_data.map(region => {
        const regionInclEntry = projectData.regionincl_data?.regions?.find(
          r => r.regionId === region.ID
        );
        return {
          ...region,
          isActive: regionInclEntry?.isActive ?? true,
          ...region.Properties
        };
      });
      setRegions(regionsWithStatus);
    }
  }, [projectData]);

  useEffect(() => {
    if (activeTab === '/regions' && project) {
      loadRegionsData();
    } else if (!project) {
      setRegions([]);
    }
  }, [activeTab, project, loadRegionsData]);

  // Handle cell edit
  const handleProcessRowUpdate = useCallback((newRow, oldRow) => {
    const regionIndex = regions.findIndex(r => r.ID === newRow.ID);
    if (regionIndex === -1) return oldRow;

    const updatedRegions = [...regions];
    updatedRegions[regionIndex] = newRow;
    setRegions(updatedRegions);

    // Update in projectData
    const properties = { ...newRow };
    delete properties.ID;
    delete properties.isActive;

    const newRegionsData = projectData.regions_data.map(r =>
      r.ID === newRow.ID ? { ...r, Properties: properties } : r
    );
    updateData('regions_data', newRegionsData);

    // Update isActive in regionincl_data if changed
    if (newRow.isActive !== oldRow.isActive) {
      const regioninclData = projectData.regionincl_data || { regions: [] };
      const existingEntry = regioninclData.regions?.find(r => r.regionId === newRow.ID);

      if (existingEntry) {
        const newRegionincl = {
          ...regioninclData,
          regions: regioninclData.regions.map(r =>
            r.regionId === newRow.ID ? { ...r, isActive: newRow.isActive } : r
          )
        };
        updateData('regionincl_data', newRegionincl);
      } else {
        const newRegionincl = {
          ...regioninclData,
          regions: [
            ...(regioninclData.regions || []),
            { regionId: newRow.ID, isActive: newRow.isActive, comment: null }
          ]
        };
        updateData('regionincl_data', newRegionincl);
      }
    }

    return newRow;
  }, [regions, projectData, updateData]);

  // Define columns with categories
  const columns = useMemo(() => [
    {
      field: 'ID',
      headerName: 'ID',
      width: 80,
      type: 'number',
      pinned: 'left',
      editable: false,
    },
    {
      field: 'isActive',
      headerName: 'Active',
      width: 80,
      type: 'boolean',
      editable: true,
      pinned: 'left',
    },
    {
      field: 'regionname',
      headerName: 'Region Name',
      width: 180,
      editable: true,
      pinned: 'left',
    },
    // Basic Info
    { field: 'nonplayable', headerName: 'Non-Playable', width: 120, type: 'boolean', editable: true, description: 'Basic Info' },
    { field: 'flagnum', headerName: 'Flag #', width: 100, type: 'number', editable: true },
    { field: 'prefixname', headerName: 'Prefix Name', width: 150, editable: true },
    { field: 'altregionname', headerName: 'Alt Region Name', width: 180, editable: true },
    { field: 'blocknum', headerName: 'Block #', width: 100, type: 'number', editable: true },
    { field: 'altblocknum', headerName: 'Alt Block #', width: 120, type: 'number', editable: true },
    { field: 'continentnum', headerName: 'Continent #', width: 120, type: 'number', editable: true },
    { field: 'musictrack', headerName: 'Music Track', width: 150, editable: true },
    { field: 'regioncolor', headerName: 'Region Color', width: 150, editable: true },

    // Government & Politics
    { field: 'politic', headerName: 'Politics', width: 120, editable: true },
    { field: 'govtype', headerName: 'Gov Type', width: 120, editable: true },
    { field: 'loyalty', headerName: 'Loyalty', width: 100, type: 'number', editable: true },
    { field: 'playeragenda', headerName: 'Player Agenda', width: 150, editable: true },
    { field: 'playeraistance', headerName: 'Player AI Stance', width: 150, editable: true },

    // Demographics
    { field: 'refpopulation', headerName: 'Population', width: 130, type: 'number', editable: true },
    { field: 'poptotalarmy', headerName: 'Total Army Pop', width: 140, type: 'number', editable: true },
    { field: 'popminreserve', headerName: 'Min Reserve Pop', width: 150, type: 'number', editable: true },
    { field: 'literacy', headerName: 'Literacy', width: 100, type: 'number', editable: true },
    { field: 'lifeexp', headerName: 'Life Expectancy', width: 140, type: 'number', editable: true },
    { field: 'avgchildren', headerName: 'Avg Children', width: 130, type: 'number', editable: true },
    { field: 'crimerate', headerName: 'Crime Rate', width: 120, type: 'number', editable: true },

    // Economy
    { field: 'treasury', headerName: 'Treasury', width: 130, type: 'number', editable: true },
    { field: 'nationaldebtgdp', headerName: 'National Debt GDP', width: 170, type: 'number', editable: true },
    { field: 'unemployment', headerName: 'Unemployment', width: 140, type: 'number', editable: true },
    { field: 'gdpc', headerName: 'GDP per Capita', width: 150, type: 'number', editable: true },
    { field: 'inflation', headerName: 'Inflation', width: 110, type: 'number', editable: true },
    { field: 'buyingpower', headerName: 'Buying Power', width: 130, type: 'number', editable: true },
    { field: 'prodefficiency', headerName: 'Prod Efficiency', width: 140, type: 'number', editable: true },

    // Ratings & Approvals
    { field: 'civapproval', headerName: 'Civ Approval', width: 130, type: 'number', editable: true },
    { field: 'milapproval', headerName: 'Mil Approval', width: 130, type: 'number', editable: true },
    { field: 'creditrating', headerName: 'Credit Rating', width: 130, type: 'number', editable: true },
    { field: 'tourismrating', headerName: 'Tourism Rating', width: 140, type: 'number', editable: true },
    { field: 'envrating', headerName: 'Env Rating', width: 120, type: 'number', editable: true },

    // Military
    { field: 'defcon', headerName: 'DEFCON', width: 110, type: 'number', editable: true },
    { field: 'fanaticism', headerName: 'Fanaticism', width: 120, type: 'number', editable: true },
    { field: 'techlevel', headerName: 'Tech Level', width: 120, type: 'number', editable: true },
    { field: 'alertlevel', headerName: 'Alert Level', width: 120, type: 'number', editable: true },
    { field: 'bconscript', headerName: 'Conscript', width: 110, type: 'number', editable: true },
    { field: 'forcesplan', headerName: 'Forces Plan', width: 130, type: 'number', editable: true },
    { field: 'milspendsalary', headerName: 'Mil Spend Salary', width: 150, type: 'number', editable: true },
    { field: 'milspendmaint', headerName: 'Mil Spend Maint', width: 150, type: 'number', editable: true },
    { field: 'milspendintel', headerName: 'Mil Spend Intel', width: 150, type: 'number', editable: true },
    { field: 'milspendresearch', headerName: 'Mil Spend Research', width: 170, type: 'number', editable: true },
    { field: 'milsubsidyrating', headerName: 'Mil Subsidy Rating', width: 170, type: 'number', editable: true },

    // International Relations
    { field: 'worldavail', headerName: 'World Avail', width: 130, type: 'number', editable: true },
    { field: 'armsavail', headerName: 'Arms Avail', width: 130, type: 'number', editable: true },
    { field: 'worldintegrity', headerName: 'World Integrity', width: 150, type: 'number', editable: true },
    { field: 'treatyintegrity', headerName: 'Treaty Integrity', width: 150, type: 'number', editable: true },
    { field: 'domsubsidyrating', headerName: 'Dom Subsidy Rating', width: 170, type: 'number', editable: true },
    { field: 'bwmmember', headerName: 'BWM Member', width: 130, type: 'boolean', editable: true },

    // Regional Control
    { field: 'masterdata', headerName: 'Master Data', width: 130, type: 'number', editable: true },
    { field: 'influence', headerName: 'Influence', width: 120, editable: true },
    { field: 'influenceval', headerName: 'Influence Val', width: 140, editable: true },
    { field: 'couppossibility', headerName: 'Coup Possibility', width: 150, type: 'number', editable: true },
    { field: 'revoltpossibility', headerName: 'Revolt Possibility', width: 160, type: 'number', editable: true },
    { field: 'independencedesire', headerName: 'Independence Desire', width: 180, type: 'number', editable: true },
    { field: 'parentloyalty', headerName: 'Parent Loyalty', width: 140, type: 'number', editable: true },
    { field: 'independencetarget', headerName: 'Independence Target', width: 180, type: 'number', editable: true },
    { field: 'sphere', headerName: 'Sphere', width: 100, type: 'number', editable: true },
    { field: 'civiliansphere', headerName: 'Civilian Sphere', width: 150, type: 'number', editable: true },
    { field: 'keepregion', headerName: 'Keep Region', width: 130, type: 'boolean', editable: true },
    { field: 'parentregion', headerName: 'Parent Region', width: 140, type: 'number', editable: true },

    // Location & Other
    { field: 'capitalx', headerName: 'Capital X', width: 110, type: 'number', editable: true },
    { field: 'capitaly', headerName: 'Capital Y', width: 110, type: 'number', editable: true },
    { field: 'theatrehome', headerName: 'Theatre Home', width: 140, type: 'number', editable: true },
    { field: 'religionstate', headerName: 'Religion State', width: 140, type: 'number', editable: true },
    { field: 'RacePrimary', headerName: 'Race Primary', width: 130, type: 'number', editable: true },
    { field: 'RaceSecondary', headerName: 'Race Secondary', width: 150, type: 'number', editable: true },
    { field: 'electiondate', headerName: 'Election Date', width: 150, editable: true },
  ], []);

  // Filter regions based on search term
  const filteredRegions = useMemo(() => {
    if (!searchTerm) return regions;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return regions.filter(region =>
      region.regionname?.toLowerCase().includes(lowerSearchTerm) ||
      region.ID?.toString().includes(lowerSearchTerm)
    );
  }, [regions, searchTerm]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  if (!project) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Please load a project to edit regions
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', width: '100%' }}>
      <Paper sx={{ p: 3, mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, flexGrow: 1 }}>
            Regions Editor
          </Typography>
          <Chip
            label={`${filteredRegions.length} regions`}
            color="primary"
            variant="outlined"
          />
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by region name or ID..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              endAdornment: searchTerm && (
                <IconButton size="small" onClick={handleClearSearch}>
                  <ClearIcon />
                </IconButton>
              ),
            }}
          />
          <Tooltip title="Use the column menu to filter, sort, and hide columns">
            <IconButton color="primary">
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Click any cell to edit. Changes are saved automatically. Use the toolbar to export, filter, and manage columns.
        </Typography>
      </Paper>

      <Paper sx={{ height: 'calc(100% - 160px)' }}>
        <DataGrid
          rows={filteredRegions}
          columns={columns}
          getRowId={(row) => row.ID}
          processRowUpdate={handleProcessRowUpdate}
          onProcessRowUpdateError={(error) => console.error('Error updating row:', error)}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={setColumnVisibilityModel}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25 },
            },
            columns: {
              columnVisibilityModel: {
                // Hide less commonly used fields by default
                altregionname: false,
                altblocknum: false,
                musictrack: false,
                regioncolor: false,
                playeragenda: false,
                playeraistance: false,
                poptotalarmy: false,
                popminreserve: false,
                avgchildren: false,
                nationaldebtgdp: false,
                domsubsidyrating: false,
                milsubsidyrating: false,
                milspendsalary: false,
                milspendmaint: false,
                milspendintel: false,
                milspendresearch: false,
                influence: false,
                influenceval: false,
                couppossibility: false,
                revoltpossibility: false,
                independencedesire: false,
                parentloyalty: false,
                independencetarget: false,
                civiliansphere: false,
                keepregion: false,
                parentregion: false,
                religionstate: false,
                RacePrimary: false,
                RaceSecondary: false,
                electiondate: false,
              },
            },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
          density="compact"
          sx={{
            '& .MuiDataGrid-cell': {
              py: 1,
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        />
      </Paper>
    </Box>
  );
};

export default RegionsPage;
