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

    // Home.jsx
    const handleExport = async () => {
        if (!project) return;

        const userInputs = {
            cvp: project.cvp[0],
            mapx: project.mapx[0],
            oof: project.oof[0],
            regionincl: project.regionincl[0],
            oob: project.oob[0],
            wmdata: project.wmdata[0],
            unit: project.unit[0],
            pplx: project.pplx[0],
            ttrx: project.ttrx[0],
            terx: project.terx[0],
            newsitems: project.newsitems[0],
            prf: project.prf[0],
        };

        try {
            const response = await fetch('http://localhost:5000/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    scenario_name: project.scenario[0],
                    structure: project.structure,
                    user_inputs: userInputs,
                    new_project: project.new_project || false,
                }),
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
