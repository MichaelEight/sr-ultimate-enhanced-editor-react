import { useState } from 'react';
import { uploadFile, exportFile } from '../services/api';
import { useMessage } from '../contexts/MessageContext';

const useFileUpload = () => {
    const [file, setFile] = useState(null);
    const [validationResults, setValidationResults] = useState(null);
    const [progress, setProgress] = useState(0);
    const [project, setProject] = useState(null);
    const { addMessage } = useMessage();

    const handleFileChangeAndUpload = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setProgress(0);  // Reset progress
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const data = await uploadFile(formData);  // Pass the FormData object
            console.log('Received data:', data);  // Log the received data
            setValidationResults(data.structure);
            setProject(data.scenario_data);  // Set project data from scenario_data
            setProgress(100);  // Ensure progress bar reaches 100%
        } catch (error) {
            addMessage(`!! Error during upload: ${error.message}`);
        }
    };

    const handleExport = async () => {
        if (!validationResults) {
            addMessage('!! No validation results to export');
            return;
        }

        setProgress(0);  // Reset progress

        try {
            const blob = await exportFile(file.name.split('.')[0], validationResults);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${file.name.split('.')[0]}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setProgress(100);  // Ensure progress bar reaches 100%
        } catch (error) {
            addMessage(`!! Error during export: ${error.message}`);
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
        progress,
        setProgress,
        setProgressMessage: addMessage,
        project,
        setProject,
        handleFileChangeAndUpload,
        handleExport,
        handleCheckboxChange
    };
};

export default useFileUpload;
