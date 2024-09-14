import { useState } from 'react';
import { uploadFile } from '../services/api';
// import { useMessage } from '../contexts/MessageContext';

const useProjectManagement = () => {
    // const { addMessage, setProgress, setProgressMessage } = useMessage(); // Use context safely
    const [file, setFile] = useState(null);
    const [validationResults, setValidationResults] = useState(null);
    const [project, setProject] = useState(null);

    // Handle file change and upload
    const handleFileChangeAndUpload = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;
    
        setFile(selectedFile);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
    
            const data = await uploadFile(formData);
            console.log('Received data:', data);
    
            // Assuming the backend returns data with 'projectFileStructure'
            setProject(data.projectFileStructure);
        } catch (error) {
            console.log('Error during upload:', error.message);
        }
    };
    
    // Handle creating an empty project
    const handleCreateEmptyProject = async () => {
        try {
            const response = await fetch('http://localhost:5000/create_empty_project', {
                method: 'GET',
            });
    
            if (response.ok) {
                const data = await response.json();
                setProject(data.projectFileStructure);
            } else {
                console.error("Failed to create empty project");
            }
        } catch (error) {
            console.error("Error creating empty project:", error);
        }
    };

    // Handle loading a default project
    const handleLoadDefaultProject = async (projectName) => {
        try {
            const response = await fetch(`http://localhost:5000/load_default_project/${projectName}`);
            if (response.ok) {
                const projectData = await response.json();
                setProject(projectData.scenario_data);
            } else {
                console.error("Failed to load project data");
            }
        } catch (error) {
            console.error("Error loading project data:", error);
        }
    };

    // Handle closing a project
    const handleCloseProject = () => {
        setProject(null);
    };

    // Handle exporting the project
    const handleExport = async () => {
        if (!project) return;

        try {
            const response = await fetch('http://localhost:5000/export', {
                method: 'GET',
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${project.scenario[0]}.zip`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                console.error('Export failed');
            }
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

    return {
        file,
        validationResults,
        project,
        setProject,
        handleFileChangeAndUpload,
        handleCreateEmptyProject,
        handleLoadDefaultProject,
        handleCloseProject,
        handleExport,
    };
};

export default useProjectManagement;
