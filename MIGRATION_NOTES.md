# Backend to Frontend Migration Notes

## Overview
This project has been migrated from a backend-frontend architecture to a frontend-only architecture using localStorage and browser-based file handling.

## Completed Changes

### 1. Dependencies
- ✅ Installed `jszip` for ZIP file handling in the browser

### 2. Core Infrastructure
- ✅ Created `/frontend/src/utils/config.js` - Configuration and default data structures
- ✅ Created `/frontend/src/utils/parsers/` directory with all file parsers:
  - `scenarioParser.js` - Parse .SCENARIO files
  - `cvpParser.js` - Parse .CVP files (regions and theaters)
  - `oobParser.js` - Parse .OOB files (military units)
  - `regioninclParser.js` - Parse .REGIONINCL files
  - `wmdataParser.js` - Parse .WMDATA files (resources and world market)

### 3. Exporters
- ✅ Created `/frontend/src/utils/exporters/index.js` with all exporters:
  - Scenario file exporter
  - CVP file exporter
  - OOB file exporter
  - REGIONINCL file exporter
  - WMDATA file exporter

### 4. State Management
- ✅ Created `/frontend/src/context/ProjectContext.jsx`:
  - Manages all project data using React Context
  - Uses localStorage for persistence
  - Handles file upload and ZIP extraction
  - Handles project export as ZIP
  - Provides CRUD operations for project data

### 5. Application Updates
- ✅ Updated `/frontend/src/App.js` to wrap with `ProjectProvider`
- ✅ Updated `/frontend/src/hooks/useProjectManagement.js` to use ProjectContext instead of backend APIs

## Data Flow

### Before (Backend-Dependent)
```
User → Frontend → Fetch API → Backend (Flask) → Python Parsers → In-Memory State
```

### After (Frontend-Only)
```
User → Frontend → ProjectContext → JS Parsers → localStorage
```

## What Still Needs Work

### Page Components
The individual page components (SettingsPage, RegionsPage, TheatersPage, etc.) still contain direct `fetch()` calls to the backend. These need to be updated to use the `useProject()` hook from ProjectContext.

**Example pattern to follow:**
```javascript
// OLD (Backend-dependent)
fetch('http://localhost:5000/updateSetting', {
    method: 'POST',
    body: JSON.stringify({ key, value })
});

// NEW (Frontend-only)
const { updateData, projectData } = useProject();
updateData('settings_data', { ...projectData.settings_data, [key]: value });
```

### Pages that need updating:
- [ ] `/frontend/src/pages/SettingsPage.jsx`
- [ ] `/frontend/src/pages/RegionsPage.jsx`
- [ ] `/frontend/src/pages/TheatersPage.jsx`
- [ ] `/frontend/src/pages/ResourcesPage.jsx`
- [ ] `/frontend/src/pages/WorldMarketPage.jsx`
- [ ] `/frontend/src/pages/OrbatPage.jsx`

### API Service Layer
- [ ] Delete `/frontend/src/services/api.js` (no longer needed)

### Backend
- [ ] The entire `/backend` directory can be deleted
- [ ] Remove `startBackend.bat` and related backend scripts
- [ ] Update `start.bat` to only start the frontend

## Testing Checklist

Before considering this migration complete, test:
- [ ] Upload a ZIP file containing a scenario
- [ ] View and edit settings
- [ ] View and edit regions
- [ ] View and edit theaters
- [ ] View and edit resources
- [ ] View and edit world market
- [ ] View and edit ORBAT
- [ ] Export the project as a ZIP
- [ ] Reload the page and verify data persists (localStorage)
- [ ] Close project and verify data is cleared

## Benefits of Frontend-Only Architecture

1. **No Backend Required**: Entire application runs in the browser
2. **Offline Capable**: Works without an internet connection
3. **Simplified Deployment**: Just serve static files
4. **Data Persistence**: Uses localStorage for automatic save
5. **Faster Development**: No need to manage backend server during development

## Technical Notes

### LocalStorage Limits
- Most browsers support ~5-10MB of localStorage
- Large scenarios may exceed this limit
- Consider implementing IndexedDB for larger projects if needed

### File Handling
- All file parsing happens in JavaScript
- JSZip handles ZIP extraction and creation in the browser
- No file system access required

### State Management
- React Context provides global state
- localStorage provides persistence across sessions
- Changes automatically save to localStorage

## Next Steps

1. Update all page components to use ProjectContext
2. Remove backend API calls from all components
3. Test all functionality end-to-end
4. Remove backend directory
5. Update documentation and README
