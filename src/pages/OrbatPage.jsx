// OrbatPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useProject } from '../context/ProjectContext';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import AddIcon from '@mui/icons-material/Add';
import { DataGrid, GridToolbar, GridActionsCellItem } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';

const OrbatPage = ({ activeTab }) => {
  const { projectData, updateData } = useProject();
  const [regions, setRegions] = useState([]);
  const [selectedRegionId, setSelectedRegionId] = useState(null);
  const [orbatData, setOrbatData] = useState([]);
  const [units, setUnits] = useState([]);

  // Load regions from ProjectContext
  useEffect(() => {
    if (projectData?.regions_data) {
      setRegions(projectData.regions_data);
      if (projectData.regions_data.length > 0 && !selectedRegionId) {
        setSelectedRegionId(projectData.regions_data[0].ID);
      }
    }
  }, [projectData, selectedRegionId]);

  // Load ORBAT data
  useEffect(() => {
    if (projectData?.orbat_data?.OOB_Data) {
      setOrbatData(projectData.orbat_data.OOB_Data);
    }
  }, [projectData]);

  // Load units for selected region
  useEffect(() => {
    if (selectedRegionId !== null) {
      const regionOrbat = orbatData.find(r => r.regionId === selectedRegionId);
      const unitsWithIds = (regionOrbat?.units || []).map((unit, index) => ({
        ...unit,
        id: unit.unitId || `unit-${index}`
      }));
      setUnits(unitsWithIds);
    }
  }, [selectedRegionId, orbatData]);

  // Handle region change
  const handleRegionChange = (event) => {
    setSelectedRegionId(event.target.value);
  };

  // Handle cell edit
  const handleProcessRowUpdate = useCallback((newRow, oldRow) => {
    const updatedUnits = units.map(u =>
      u.id === newRow.id ? newRow : u
    );
    setUnits(updatedUnits);

    // Update in ProjectContext
    const updatedOrbat = orbatData.map(r =>
      r.regionId === selectedRegionId
        ? { ...r, units: updatedUnits.map(({ id, ...unit }) => unit) }
        : r
    );

    // If region doesn't exist in ORBAT, add it
    if (!orbatData.find(r => r.regionId === selectedRegionId)) {
      updatedOrbat.push({
        regionId: selectedRegionId,
        units: updatedUnits.map(({ id, ...unit }) => unit)
      });
    }

    updateData('orbat_data', { OOB_Data: updatedOrbat });
    return newRow;
  }, [units, orbatData, selectedRegionId, updateData]);

  // Add new unit
  const handleAddUnit = () => {
    const newUnitId = Math.max(...units.map(u => u.unitId || 0), 0) + 1;
    const newUnit = {
      id: `unit-${Date.now()}`,
      unitId: newUnitId,
      X: 0,
      Y: 0,
      LocName: '',
      Quantity: 0,
      Status: '',
      BattNum: 0,
      BattName: '',
      Entrench: 0,
      Eff: 100,
      Exp: 0,
      Special: '',
      Str: 0,
      MaxStr: 0,
      DaysLeft: 0,
      Facing: '',
      GroupId: 0,
      TargetRole: '',
      StatustoBattC: '',
      StatustoBattN: ''
    };

    const updatedUnits = [...units, newUnit];
    setUnits(updatedUnits);

    // Update in ProjectContext
    const existingRegionIndex = orbatData.findIndex(r => r.regionId === selectedRegionId);
    let updatedOrbat;

    if (existingRegionIndex >= 0) {
      updatedOrbat = orbatData.map(r =>
        r.regionId === selectedRegionId
          ? { ...r, units: updatedUnits.map(({ id, ...unit }) => unit) }
          : r
      );
    } else {
      updatedOrbat = [
        ...orbatData,
        {
          regionId: selectedRegionId,
          units: updatedUnits.map(({ id, ...unit }) => unit)
        }
      ];
    }

    updateData('orbat_data', { OOB_Data: updatedOrbat });
  };

  // Delete unit
  const handleDeleteUnit = useCallback((id) => {
    const updatedUnits = units.filter(u => u.id !== id);
    setUnits(updatedUnits);

    const updatedOrbat = orbatData.map(r =>
      r.regionId === selectedRegionId
        ? { ...r, units: updatedUnits.map(({ id, ...unit }) => unit) }
        : r
    );

    updateData('orbat_data', { OOB_Data: updatedOrbat });
  }, [units, orbatData, selectedRegionId, updateData]);

  const columns = useMemo(() => [
    {
      field: 'unitId',
      headerName: 'Unit ID',
      width: 90,
      type: 'number',
      editable: true,
    },
    {
      field: 'X',
      headerName: 'X',
      width: 80,
      type: 'number',
      editable: true,
    },
    {
      field: 'Y',
      headerName: 'Y',
      width: 80,
      type: 'number',
      editable: true,
    },
    {
      field: 'LocName',
      headerName: 'Location Name',
      width: 180,
      editable: true,
    },
    {
      field: 'Quantity',
      headerName: 'Quantity',
      width: 100,
      type: 'number',
      editable: true,
    },
    {
      field: 'Status',
      headerName: 'Status',
      width: 120,
      editable: true,
    },
    {
      field: 'BattNum',
      headerName: 'Batt #',
      width: 90,
      type: 'number',
      editable: true,
    },
    {
      field: 'BattName',
      headerName: 'Battalion Name',
      width: 180,
      editable: true,
    },
    {
      field: 'Entrench',
      headerName: 'Entrench',
      width: 100,
      type: 'number',
      editable: true,
    },
    {
      field: 'Eff',
      headerName: 'Efficiency',
      width: 110,
      type: 'number',
      editable: true,
    },
    {
      field: 'Exp',
      headerName: 'Experience',
      width: 120,
      type: 'number',
      editable: true,
    },
    {
      field: 'Str',
      headerName: 'Strength',
      width: 100,
      type: 'number',
      editable: true,
    },
    {
      field: 'MaxStr',
      headerName: 'Max Strength',
      width: 130,
      type: 'number',
      editable: true,
    },
    {
      field: 'Special',
      headerName: 'Special',
      width: 150,
      editable: true,
    },
    {
      field: 'DaysLeft',
      headerName: 'Days Left',
      width: 110,
      type: 'number',
      editable: true,
    },
    {
      field: 'Facing',
      headerName: 'Facing',
      width: 100,
      editable: true,
    },
    {
      field: 'GroupId',
      headerName: 'Group ID',
      width: 100,
      type: 'number',
      editable: true,
    },
    {
      field: 'TargetRole',
      headerName: 'Target Role',
      width: 130,
      editable: true,
    },
    {
      field: 'StatustoBattC',
      headerName: 'Status to Batt C',
      width: 150,
      editable: true,
    },
    {
      field: 'StatustoBattN',
      headerName: 'Status to Batt N',
      width: 150,
      editable: true,
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
          onClick={() => handleDeleteUnit(params.id)}
          color="error"
        />,
      ],
    },
  ], [handleDeleteUnit]);

  const selectedRegionName = useMemo(() => {
    const region = regions.find(r => r.ID === selectedRegionId);
    return region?.Properties?.regionname || `Region ${selectedRegionId}`;
  }, [regions, selectedRegionId]);

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', width: '100%' }}>
      <Paper sx={{ p: 3, mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, flexGrow: 1 }}>
            Order of Battle (ORBAT) Editor
          </Typography>
          <Chip
            label={`${units.length} units`}
            color="primary"
            variant="outlined"
          />
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <FormControl sx={{ minWidth: 300 }}>
            <InputLabel>Select Region</InputLabel>
            <Select
              value={selectedRegionId || ''}
              label="Select Region"
              onChange={handleRegionChange}
            >
              {regions.map((region) => (
                <MenuItem key={region.ID} value={region.ID}>
                  {region.Properties?.regionname || `Region ${region.ID}`} (ID: {region.ID})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddUnit}
            disabled={!selectedRegionId}
          >
            Add Unit
          </Button>
        </Stack>

        {selectedRegionId && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Editing units for: <strong>{selectedRegionName}</strong>
          </Alert>
        )}

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          Click any cell to edit. Changes are saved automatically. Use the toolbar to export and filter units.
        </Typography>
      </Paper>

      {selectedRegionId && (
        <Paper sx={{ height: 'calc(100% - 220px)' }}>
          <DataGrid
            rows={units}
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
            pageSizeOptions={[10, 25, 50, 100]}
            disableRowSelectionOnClick
            density="compact"
            initialState={{
              pagination: {
                paginationModel: { pageSize: 25 },
              },
            }}
          />
        </Paper>
      )}

      {!selectedRegionId && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Please select a region to view and edit its military units
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default OrbatPage;
