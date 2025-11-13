// TheatersPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useProject } from '../context/ProjectContext';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import AddIcon from '@mui/icons-material/Add';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import UploadIcon from '@mui/icons-material/Upload';
import { DataGrid, GridToolbar, GridActionsCellItem } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';

const TheatersPage = ({ activeTab }) => {
  const { projectData, updateData } = useProject();
  const [excludeTheatres, setExcludeTheatres] = useState(false);
  const [theaters, setTheaters] = useState([]);

  // Load theaters data from ProjectContext
  const loadTheatersData = useCallback(() => {
    if (projectData && projectData.theaters_data) {
      const theatersArray = Object.entries(projectData.theaters_data).map(([id, theater]) => ({
        id: parseInt(id, 10),
        ...theater,
        transfersStr: theater.transfers?.join(', ') || ''
      }));
      setTheaters(theatersArray);
    }
  }, [projectData]);

  useEffect(() => {
    if (activeTab === '/theaters') {
      loadTheatersData();
      if (projectData?.settings_data?.excludeTheatres !== undefined) {
        setExcludeTheatres(projectData.settings_data.excludeTheatres === 1);
      }
    }
  }, [activeTab, loadTheatersData, projectData]);

  // Handle cell edit
  const handleProcessRowUpdate = useCallback((newRow, oldRow) => {
    const updatedTheaters = theaters.map(t =>
      t.id === newRow.id ? newRow : t
    );
    setTheaters(updatedTheaters);

    // Convert array back to object for storage
    const updatedTheatersObj = {};
    updatedTheaters.forEach(theater => {
      const { id, transfersStr, ...theaterData } = theater;
      theaterData.transfers = transfersStr
        ? transfersStr.split(',').map(item => parseInt(item.trim(), 10) || 0)
        : [];
      updatedTheatersObj[id] = theaterData;
    });
    updateData('theaters_data', updatedTheatersObj);

    return newRow;
  }, [theaters, updateData]);

  // Handle excludeTheatres checkbox
  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setExcludeTheatres(checked);

    const updatedSettings = {
      ...projectData.settings_data,
      excludeTheatres: checked ? 1 : 0
    };
    updateData('settings_data', updatedSettings);
  };

  // Generate dummy theaters
  const handleGenerateClick = () => {
    const generatedTheaters = {};
    for (let i = 1; i <= 10; i++) {
      generatedTheaters[i] = {
        theatreName: `Theater ${i}`,
        theatreCode: `TH${i}`,
        culture: 0,
        xLocation: 0,
        yLocation: 0,
        transfers: []
      };
    }
    updateData('theaters_data', generatedTheaters);
  };

  // Import from CVP
  const handleImportClick = () => {
    if (projectData?.theaters_data && Object.keys(projectData.theaters_data).length > 0) {
      loadTheatersData();
    }
  };

  // Add new theater
  const handleAddTheater = () => {
    const newId = Math.max(...theaters.map(t => t.id), 0) + 1;
    const newTheater = {
      id: newId,
      theatreName: `New Theater ${newId}`,
      theatreCode: `TH${newId}`,
      culture: 0,
      xLocation: 0,
      yLocation: 0,
      transfersStr: ''
    };

    const updatedTheaters = [...theaters, newTheater];
    setTheaters(updatedTheaters);

    const updatedTheatersObj = {};
    updatedTheaters.forEach(theater => {
      const { id, transfersStr, ...theaterData } = theater;
      theaterData.transfers = transfersStr
        ? transfersStr.split(',').map(item => parseInt(item.trim(), 10) || 0)
        : [];
      updatedTheatersObj[id] = theaterData;
    });
    updateData('theaters_data', updatedTheatersObj);
  };

  // Delete theater
  const handleDeleteTheater = useCallback((id) => {
    const updatedTheaters = theaters.filter(t => t.id !== id);
    setTheaters(updatedTheaters);

    const updatedTheatersObj = {};
    updatedTheaters.forEach(theater => {
      const { id: theaterId, transfersStr, ...theaterData } = theater;
      theaterData.transfers = transfersStr
        ? transfersStr.split(',').map(item => parseInt(item.trim(), 10) || 0)
        : [];
      updatedTheatersObj[theaterId] = theaterData;
    });
    updateData('theaters_data', updatedTheatersObj);
  }, [theaters, updateData]);

  const columns = useMemo(() => [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      type: 'number',
      editable: false,
    },
    {
      field: 'theatreName',
      headerName: 'Theatre Name',
      width: 200,
      editable: true,
    },
    {
      field: 'theatreCode',
      headerName: 'Theatre Code',
      width: 150,
      editable: true,
    },
    {
      field: 'culture',
      headerName: 'Culture',
      width: 100,
      type: 'number',
      editable: true,
    },
    {
      field: 'xLocation',
      headerName: 'X Location',
      width: 120,
      type: 'number',
      editable: true,
    },
    {
      field: 'yLocation',
      headerName: 'Y Location',
      width: 120,
      type: 'number',
      editable: true,
    },
    {
      field: 'transfersStr',
      headerName: 'Transfers (comma-separated)',
      width: 250,
      editable: true,
      description: 'Enter transfer IDs separated by commas',
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 80,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDeleteTheater(params.id)}
          color="error"
        />,
      ],
    },
  ], [handleDeleteTheater]);

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', width: '100%' }}>
      <Paper sx={{ p: 3, mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, flexGrow: 1 }}>
            Theaters Editor
          </Typography>
          <Chip
            label={`${theaters.length} theaters`}
            color="primary"
            variant="outlined"
          />
        </Stack>

        <FormControlLabel
          control={
            <Checkbox
              checked={excludeTheatres}
              onChange={handleCheckboxChange}
            />
          }
          label="Do Not Include Theatres in Scenario"
          sx={{ mb: 2 }}
        />

        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddTheater}
          >
            Add Theater
          </Button>
          <Button
            variant="outlined"
            startIcon={<AutoFixHighIcon />}
            onClick={handleGenerateClick}
          >
            Generate Dummy Data
          </Button>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={handleImportClick}
            disabled={!projectData?.theaters_data || Object.keys(projectData.theaters_data).length === 0}
          >
            Import from CVP
          </Button>
        </Stack>

        {theaters.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            No theaters loaded. Click "Add Theater" to create one, or "Generate Dummy Data" to create sample theaters.
          </Alert>
        )}

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Click any cell to edit. Changes are saved automatically. Use the toolbar to export and filter theaters.
        </Typography>
      </Paper>

      {theaters.length > 0 && (
        <Paper sx={{ height: 'calc(100% - 240px)' }}>
          <DataGrid
            rows={theaters}
            columns={columns}
            getRowId={(row) => row.id}
            processRowUpdate={handleProcessRowUpdate}
            onProcessRowUpdateError={(error) => console.error('Error updating row:', error)}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
              },
            }}
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
            density="comfortable"
          />
        </Paper>
      )}
    </Box>
  );
};

export default TheatersPage;
