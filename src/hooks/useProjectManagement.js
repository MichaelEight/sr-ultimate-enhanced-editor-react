import { useState } from 'react';
import { useProject } from '../context/ProjectContext';

const useProjectManagement = () => {
    const {
        projectData,
        projectName,
        isLoading,
        uploadFile,
        exportProject,
        closeProject,
        createEmptyProject
    } = useProject();

    const [file, setFile] = useState(null);
    const [validationResults, setValidationResults] = useState(null);
    const [progress, setProgress] = useState(0);

    // Map projectData to the legacy 'project' format for compatibility
    // Only return project if projectName exists (indicating a real project is loaded)
    const project = projectName ? projectData.scenario_data : null;

    // Handle file change and upload
    const handleFileChangeAndUpload = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setProgress(0);
        try {
            setProgress(30);
            const result = await uploadFile(selectedFile);
            setProgress(100);
            console.log('Project loaded successfully:', result);
        } catch (error) {
            console.error('Error during upload:', error.message);
            setProgress(0);
        }
    };

    // Handle creating an empty project
    const handleCreateEmptyProject = async () => {
        try {
            createEmptyProject();
            console.log('Empty project created');
        } catch (error) {
            console.error("Error creating empty project:", error);
        }
    };

    // Handle loading a default project (not implemented in frontend-only version)
    const handleLoadDefaultProject = async (projectName) => {
        console.warn('Loading default projects is not implemented in frontend-only version');
        // This would require the default projects to be bundled with the frontend
        // or fetched from a static resource
    };

    // Handle closing a project
    const handleCloseProject = async () => {
        try {
            closeProject();
            setFile(null);
            setValidationResults(null);
            setProgress(0);
            console.log('Project closed successfully.');
        } catch (error) {
            console.error('Error closing project:', error);
        }
    };

    // Handle exporting the project
    const handleExport = async () => {
        if (!project) return;

        try {
            const blob = await exportProject();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${projectName || 'ExportedProject'}.zip`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            console.log('Project exported successfully');
        } catch (error) {
            console.error('Error during export:', error);
        }
    };

    const handleCheckboxChange = (path) => {
        setValidationResults(prevState => ({
            ...prevState,
            [path]: {
                ...prevState[path],
                required: !prevState[path].required
            }
        }));
    };

    // Provide a setProject function for compatibility
    const setProject = (newProject) => {
        console.warn('setProject called - this is a no-op in frontend-only version');
        // In frontend-only version, project state is managed by ProjectContext
    };

    return {
        file,
        validationResults,
        project,
        setProject,
        progress,
        setProgress,
        handleFileChangeAndUpload,
        handleCreateEmptyProject,
        handleLoadDefaultProject,
        handleCloseProject,
        handleExport,
        isLoading
    };
};

export default useProjectManagement;
