// ProjectContext.jsx - Frontend-only project state management using localStorage

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import JSZip from 'jszip';
import {
    DEFAULT_SETTINGS_STRUCTURE,
    DEFAULT_THEATERS_STRUCTURE,
    DEFAULT_REGIONS_STRUCTURE,
    DEFAULT_REGIONINCL_STRUCTURE,
    DEFAULT_ORBAT_STRUCTURE,
    DEFAULT_RESOURCES_STRUCTURE,
    DEFAULT_WORLDMARKET_STRUCTURE,
    DEFAULT_PROJECT_FILE_STRUCTURE,
    SUPPORTED_EXTENSIONS
} from '../utils/config';
import { importScenarioFile } from '../utils/parsers/scenarioParser';
import { extractCvpData } from '../utils/parsers/cvpParser';
import { extractOobData } from '../utils/parsers/oobParser';
import { extractRegioninclData } from '../utils/parsers/regioninclParser';
import { extractWmdata } from '../utils/parsers/wmdataParser';
import {
    exportScenarioFile,
    exportCvp,
    exportOob,
    exportRegionincl,
    exportWmdata
} from '../utils/exporters';

const ProjectContext = createContext();

export const useProject = () => {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error('useProject must be used within a ProjectProvider');
    }
    return context;
};

export const ProjectProvider = ({ children }) => {
    // Project state - start with empty project, no auto-load from localStorage
    const [projectData, setProjectData] = useState(createEmptyProject);
    const [originalZipFiles, setOriginalZipFiles] = useState({});
    const [projectName, setProjectName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasProject, setHasProject] = useState(false); // Track if real project is loaded

    // Save to localStorage only when a real project is loaded
    useEffect(() => {
        if (hasProject) {
            try {
                localStorage.setItem('projectData', JSON.stringify(projectData));
                localStorage.setItem('projectName', projectName);
            } catch (e) {
                console.error('Failed to save project data to localStorage:', e);
            }
        }
    }, [projectData, projectName, hasProject]);

    function createEmptyProject() {
        return {
            scenario_data: JSON.parse(JSON.stringify(DEFAULT_PROJECT_FILE_STRUCTURE)),
            settings_data: JSON.parse(JSON.stringify(DEFAULT_SETTINGS_STRUCTURE)),
            regions_data: JSON.parse(JSON.stringify(DEFAULT_REGIONS_STRUCTURE)),
            theaters_data: JSON.parse(JSON.stringify(DEFAULT_THEATERS_STRUCTURE)),
            regionincl_data: JSON.parse(JSON.stringify(DEFAULT_REGIONINCL_STRUCTURE)),
            orbat_data: JSON.parse(JSON.stringify(DEFAULT_ORBAT_STRUCTURE)),
            resources_data: JSON.parse(JSON.stringify(DEFAULT_RESOURCES_STRUCTURE)),
            worldmarket_data: JSON.parse(JSON.stringify(DEFAULT_WORLDMARKET_STRUCTURE)),
            seen_since_last_update: {
                settings: false,
                regions: false,
                theaters: false,
                regionincl: false,
                orbat: false,
                resources: false,
                worldmarket: false,
                scenario: false
            }
        };
    }

    // Upload and extract ZIP file
    const uploadFile = useCallback(async (file) => {
        setIsLoading(true);
        try {
            const zip = await JSZip.loadAsync(file);
            const files = {};
            const filePromises = [];

            // Extract all files
            zip.forEach((relativePath, zipEntry) => {
                if (!zipEntry.dir) {
                    filePromises.push(
                        zipEntry.async('string').then(content => {
                            files[relativePath] = content;
                        })
                    );
                }
            });

            await Promise.all(filePromises);
            setOriginalZipFiles(files);

            // Find and process the .scenario file
            const scenarioFile = Object.keys(files).find(f => f.toLowerCase().endsWith('.scenario'));
            if (!scenarioFile) {
                throw new Error('No .scenario file found in the ZIP');
            }

            const scenarioFilename = scenarioFile.split('/').pop();
            setProjectName(scenarioFilename.replace(/\.scenario$/i, ''));

            // Parse scenario file
            const scenarioResult = importScenarioFile(files[scenarioFile], scenarioFilename);
            const newProjectData = createEmptyProject();
            newProjectData.scenario_data = scenarioResult.scenario_data;
            newProjectData.settings_data = scenarioResult.settings_data;

            // Process other files based on scenario references
            for (const [fileType, filenames] of Object.entries(scenarioResult.scenario_data)) {
                if (!SUPPORTED_EXTENSIONS.includes(fileType)) continue;

                for (const filename of filenames) {
                    const fullFilename = `${filename}.${fileType.toUpperCase()}`;
                    const fileContent = findFileInZip(files, fullFilename);

                    if (fileContent) {
                        await loadDataFromFile(fileType, fileContent, newProjectData);
                    }
                }
            }

            setProjectData(newProjectData);
            setHasProject(true); // Mark that a real project is now loaded
            console.log('Project loaded successfully');
            return { success: true, projectFileStructure: newProjectData.scenario_data };
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    function findFileInZip(files, filename) {
        const lowerFilename = filename.toLowerCase();
        for (const [path, content] of Object.entries(files)) {
            if (path.toLowerCase().endsWith(lowerFilename) || path.toLowerCase().includes(lowerFilename.toLowerCase())) {
                return content;
            }
        }
        return null;
    }

    async function loadDataFromFile(fileExtension, content, targetData) {
        console.log(`Loading data from ${fileExtension} file`);

        try {
            if (fileExtension === 'cvp') {
                const cvpData = extractCvpData(content);
                targetData.regions_data = cvpData.Regions_Data;
                targetData.theaters_data = cvpData.Theaters_Data;
            } else if (fileExtension === 'oob') {
                const oobData = extractOobData(content);
                targetData.orbat_data = oobData;
            } else if (fileExtension === 'regionincl') {
                const regioninclData = extractRegioninclData(content);
                targetData.regionincl_data = regioninclData;
            } else if (fileExtension === 'wmdata') {
                const wmdataResult = extractWmdata(content);
                targetData.worldmarket_data = wmdataResult.worldmarket;
                targetData.resources_data = wmdataResult.resources;
            }
        } catch (error) {
            console.error(`Error loading ${fileExtension} file:`, error);
        }
    }

    // Export project as ZIP
    const exportProject = useCallback(async () => {
        try {
            const zip = new JSZip();
            const projectFolder = zip.folder(projectName || 'Project');

            // Generate scenario file
            const scenarioContent = exportScenarioFile(projectData.scenario_data, projectData.settings_data);
            projectFolder.file(`${projectName || 'NewScenario'}.SCENARIO`, scenarioContent);

            // Generate CVP file if regions/theaters exist
            if (projectData.regions_data.length > 0 || Object.keys(projectData.theaters_data).length > 0) {
                const cvpContent = exportCvp({
                    Regions_Data: projectData.regions_data,
                    Theaters_Data: projectData.theaters_data
                });
                const cvpFilename = projectData.scenario_data.cvp?.[0] || projectName || 'data';
                projectFolder.file(`Maps/${cvpFilename}.CVP`, cvpContent);
            }

            // Generate OOB file if orbat data exists
            if (projectData.orbat_data.OOB_Data && projectData.orbat_data.OOB_Data.length > 0) {
                const oobContent = exportOob(projectData.orbat_data);
                const oobFilename = projectData.scenario_data.oob?.[0] || projectName || 'data';
                projectFolder.file(`Maps/ORBATS/${oobFilename}.OOB`, oobContent);
            }

            // Generate REGIONINCL file if data exists
            if (projectData.regionincl_data.regions && projectData.regionincl_data.regions.length > 0) {
                const regioninclContent = exportRegionincl(projectData.regionincl_data);
                const regioninclFilename = projectData.scenario_data.regionincl?.[0] || projectName || 'data';
                projectFolder.file(`Maps/${regioninclFilename}.REGIONINCL`, regioninclContent);
            }

            // Generate WMDATA file if resources/worldmarket data exists
            if (Object.keys(projectData.resources_data).length > 0 || Object.keys(projectData.worldmarket_data).length > 0) {
                const wmdataContent = exportWmdata({
                    worldmarket: projectData.worldmarket_data,
                    resources: projectData.resources_data
                });
                const wmdataFilename = projectData.scenario_data.wmdata?.[0] || 'DEFAULT';
                projectFolder.file(`Maps/DATA/${wmdataFilename}.WMDATA`, wmdataContent);
            }

            // Include other original files that weren't modified
            for (const [path, content] of Object.entries(originalZipFiles)) {
                const filename = path.split('/').pop().toLowerCase();
                const ext = filename.split('.').pop();

                // Skip files we've already generated
                if (!SUPPORTED_EXTENSIONS.includes(ext) && !filename.endsWith('.scenario')) {
                    projectFolder.file(path, content);
                }
            }

            // Generate ZIP file
            const blob = await zip.generateAsync({ type: 'blob' });
            return blob;
        } catch (error) {
            console.error('Error exporting project:', error);
            throw error;
        }
    }, [projectData, projectName, originalZipFiles]);

    // Close project
    const closeProject = useCallback(() => {
        setProjectData(createEmptyProject());
        setOriginalZipFiles({});
        setProjectName('');
        setHasProject(false); // Clear project loaded flag
        localStorage.removeItem('projectData');
        localStorage.removeItem('projectName');
        console.log('Project closed');
    }, []);

    // Create empty project
    const createEmptyProjectAction = useCallback(() => {
        setProjectData(createEmptyProject());
        setOriginalZipFiles({});
        setProjectName('NewProject');
        setHasProject(true); // Mark that a project (empty) is now loaded
        console.log('Empty project created');
    }, []);

    // Update data
    const updateData = useCallback((dataType, newData) => {
        setProjectData(prev => ({
            ...prev,
            [dataType]: newData,
            seen_since_last_update: {
                ...prev.seen_since_last_update,
                [dataType.replace('_data', '')]: false
            }
        }));
    }, []);

    // Change specific value (dot-notation support)
    const changeValue = useCallback((label, newValue) => {
        setProjectData(prev => {
            const newData = { ...prev };
            const parts = label.split('.');
            let current = newData;

            for (let i = 0; i < parts.length - 1; i++) {
                const part = parts[i];
                if (part.includes('[') && part.includes(']')) {
                    const [attr, indexStr] = part.split('[');
                    const index = parseInt(indexStr.replace(']', ''), 10);
                    current = current[attr][index];
                } else {
                    current = current[part];
                }
            }

            const lastPart = parts[parts.length - 1];
            if (lastPart.includes('[') && lastPart.includes(']')) {
                const [attr, indexStr] = lastPart.split('[');
                const index = parseInt(indexStr.replace(']', ''), 10);
                current[attr][index] = newValue;
            } else {
                current[lastPart] = newValue;
            }

            return newData;
        });
    }, []);

    const value = {
        projectData,
        projectName,
        isLoading,
        uploadFile,
        exportProject,
        closeProject,
        createEmptyProject: createEmptyProjectAction,
        updateData,
        changeValue,
        getData: () => projectData
    };

    return (
        <ProjectContext.Provider value={value}>
            {children}
        </ProjectContext.Provider>
    );
};

export default ProjectContext;
