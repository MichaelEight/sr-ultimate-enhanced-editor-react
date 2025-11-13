# Page Component Update Guide

This guide shows how to update each page component from backend API calls to ProjectContext.

## Pattern to Follow

### Old Pattern (Backend-dependent)
```javascript
import React, { useState, useEffect } from 'react';

const SomePage = ({ activeTab, project }) => {
    const [data, setData] = useState([]);

    // Fetch data from backend
    useEffect(() => {
        fetch('http://localhost:5000/some_endpoint')
            .then(res => res.json())
            .then(data => setData(data));
    }, []);

    // Update data on backend
    const handleUpdate = (newData) => {
        fetch('http://localhost:5000/update_endpoint', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newData)
        });
    };

    return <div>...</div>;
};
```

### New Pattern (Frontend-only with ProjectContext)
```javascript
import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';

const SomePage = ({ activeTab, project }) => {
    const { projectData, updateData } = useProject();
    const [data, setData] = useState([]);

    // Load data from ProjectContext
    useEffect(() => {
        if (activeTab === '/somepage' && project && projectData.some_data) {
            setData(projectData.some_data);
        } else if (!project) {
            setData([]);
        }
    }, [activeTab, project, projectData]);

    // Update data in ProjectContext (automatically saves to localStorage)
    const handleUpdate = (newData) => {
        updateData('some_data', newData);
    };

    return <div>...</div>;
};
```

## Data Type Mapping

| Page | Backend Endpoint | ProjectContext Key |
|------|-----------------|-------------------|
| SettingsPage | `/get_data` → `settings_data` | `projectData.settings_data` |
| RegionsPage | `/get_regions` → `regions` | `projectData.regions_data` |
| TheatersPage | `/theaters` → `theaters_data` | `projectData.theaters_data` |
| ResourcesPage | `/resources` → `resources_data` | `projectData.resources_data` |
| WorldMarketPage | `/worldmarket` → `worldmarket_data` | `projectData.worldmarket_data` |
| OrbatPage | `/orbat` → `OOB_Data` | `projectData.orbat_data.OOB_Data` |

## Key Changes for Each Page

### RegionsPage
- **Remove**: `fetch('http://localhost:5000/get_regions')`
- **Remove**: `fetch('http://localhost:5000/check_seen_since_last_update')`
- **Remove**: `fetch('http://localhost:5000/regions/update')`
- **Replace with**:
  ```javascript
  const { projectData, updateData } = useProject();

  // Load regions
  useEffect(() => {
      if (projectData.regions_data) {
          // Combine regions_data with regionincl_data to get isActive status
          const regionsWithStatus = projectData.regions_data.map(region => {
              const regionInclEntry = projectData.regionincl_data.regions?.find(
                  r => r.regionId === region.ID
              );
              return {
                  ...region,
                  isActive: regionInclEntry?.isActive ?? true
              };
          });
          setRegions(regionsWithStatus);
      }
  }, [projectData]);

  // Update region
  const handleRegionChange = (updatedRegion) => {
      const updatedRegions = projectData.regions_data.map(r =>
          r.ID === updatedRegion.ID ? updatedRegion : r
      );
      updateData('regions_data', updatedRegions);

      // Also update regionincl if isActive changed
      if ('isActive' in updatedRegion) {
          const updatedRegionincl = {
              ...projectData.regionincl_data,
              regions: projectData.regionincl_data.regions.map(r =>
                  r.regionId === updatedRegion.ID
                      ? { ...r, isActive: updatedRegion.isActive }
                      : r
              )
          };
          updateData('regionincl_data', updatedRegionincl);
      }
  };
  ```

### TheatersPage
- **Remove**: `fetch('http://localhost:5000/theaters')`
- **Remove**: `fetch('http://localhost:5000/theaters/update')`
- **Remove**: `fetch('http://localhost:5000/theaters/generate')`
- **Replace with**:
  ```javascript
  const { projectData, updateData } = useProject();

  // Load theaters
  useEffect(() => {
      if (projectData.theaters_data) {
          setTheaters(Object.values(projectData.theaters_data));
      }
  }, [projectData]);

  // Update theater
  const handleTheaterUpdate = (theaterId, updatedTheater) => {
      const updatedTheaters = {
          ...projectData.theaters_data,
          [theaterId]: updatedTheater
      };
      updateData('theaters_data', updatedTheaters);
  };
  ```

### ResourcesPage
- **Remove**: `fetch('http://localhost:5000/resources')`
- **Remove**: `fetch('http://localhost:5000/resources/update')`
- **Replace with**:
  ```javascript
  const { projectData, updateData } = useProject();

  // Load resources
  useEffect(() => {
      if (projectData.resources_data) {
          setResources(projectData.resources_data);
      }
  }, [projectData]);

  // Update resource
  const handleResourceUpdate = (resourceName, updatedResource) => {
      const updatedResources = {
          ...projectData.resources_data,
          [resourceName]: updatedResource
      };
      updateData('resources_data', updatedResources);
  };
  ```

### WorldMarketPage
- **Remove**: `fetch('http://localhost:5000/worldmarket')`
- **Remove**: `fetch('http://localhost:5000/worldmarket/update')`
- **Replace with**: Same pattern as ResourcesPage

### OrbatPage
- **Remove**: `fetch('http://localhost:5000/orbat')`
- **Remove**: `fetch('http://localhost:5000/orbat/add_unit')`
- **Remove**: `fetch('http://localhost:5000/orbat/update_unit')`
- **Replace with**:
  ```javascript
  const { projectData, updateData } = useProject();

  // Load ORBAT
  useEffect(() => {
      if (projectData.orbat_data?.OOB_Data) {
          setOrbatData(projectData.orbat_data.OOB_Data);
      }
  }, [projectData]);

  // Add/Update unit
  const handleUnitUpdate = (regionId, unit) => {
      const updatedOrbat = { ...projectData.orbat_data };
      const regionIndex = updatedOrbat.OOB_Data.findIndex(
          r => r.regionId === regionId
      );

      if (regionIndex >= 0) {
          const unitIndex = updatedOrbat.OOB_Data[regionIndex].units.findIndex(
              u => u.unitId === unit.unitId
          );

          if (unitIndex >= 0) {
              // Update existing unit
              updatedOrbat.OOB_Data[regionIndex].units[unitIndex] = unit;
          } else {
              // Add new unit
              updatedOrbat.OOB_Data[regionIndex].units.push(unit);
          }
      } else {
          // Add new region with unit
          updatedOrbat.OOB_Data.push({
              regionId,
              units: [unit]
          });
      }

      updateData('orbat_data', updatedOrbat);
  };
  ```

## Important Notes

1. **Remove all `check_seen_since_last_update` calls** - Data changes are tracked automatically by ProjectContext

2. **Remove debounced API calls** - ProjectContext updates are already efficient with localStorage

3. **Remove loading states for network calls** - Data is available immediately from context

4. **Update useEffect dependencies** - Watch `projectData` instead of making API calls

5. **Automatic persistence** - All changes via `updateData()` automatically save to localStorage

## Testing Checklist

After updating each page:
- [ ] Page loads data from ProjectContext correctly
- [ ] Changes save to ProjectContext (check localStorage in DevTools)
- [ ] Page resets when project is closed
- [ ] No console errors related to fetch or undefined data
- [ ] Data persists across page refreshes
