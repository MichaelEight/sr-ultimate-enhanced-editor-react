// src/pages/Home.jsx
import React, { useState } from 'react';
import useFileUpload from '../hooks/useFileUpload';
import useSocket from '../hooks/useSocket';
import ProgressBar from '../components/ProgressBar';
import ProjectContent from '../components/ProjectContent';

// Mock function for loading default project data
const loadDefaultProjectData = (project) => {
    // Mock data structure, replace with actual logic
    return {
        scenarioName: 'DefaultScenario',
        cacheName: 'DefaultCache',
        mapName: 'DefaultMap',
        oof: 'DefaultOOF',
        unit: 'DefaultUNIT',
        pplx: 'DefaultPPLX',
        ttrx: 'DefaultTTRX',
        terx: 'DefaultTERX',
        newsitems: 'DefaultNEWSITEMS',
        profile: 'DefaultPROFILE',
        cvp: 'DefaultCVP',
        wmdata: 'DefaultWMData',
        oob: 'DefaultOOB',
        precache: 'DefaultPreCache',
        postcache: 'DefaultPostCache',
        sameAsScenarioName: true,
        createNewMap: false,
        useDefaultFiles: true,
    };
};

const Home = () => {
    const {
        file,
        handleFileChange,
        handleUpload
    } = useFileUpload();
    const [activeSection, setActiveSection] = useState(null);
    const [projectData, setProjectData] = useState(null);
    const [validationResults, setValidationResults] = useState(null);
    const { setProgress, setProgressMessage, addMessage } = useSocket();

    const handleCreateProject = () => {
        setProjectData({});
        setActiveSection('project');
    };

    const handleLoadDefaultProject = (project) => {
        const data = loadDefaultProjectData(project);
        setProjectData(data);
        setActiveSection('project');
    };

    const handleUploadFile = async () => {
        const response = await handleUpload();
        if (response) {
            const data = await response.json();
            setValidationResults(data.structure);
            setProjectData(data.scenario_data);
            setActiveSection('project');
        }
    };

    return (
        <div className="home">
            <div className="buttons">
                <button onClick={handleCreateProject}>Create Empty Project</button>
                <input
                    type="file"
                    onChange={(e) => {
                        handleFileChange(e);
                        handleUploadFile();
                    }}
                    style={{ display: 'none' }}
                    id="upload-input"
                />
                <button onClick={() => document.getElementById('upload-input').click()}>Upload Project</button>
                <button onClick={() => handleLoadDefaultProject('defaultProject')}>Load Default Project</button>
                <button disabled>Load Last Project</button>
                <button disabled={!projectData} onClick={() => setActiveSection(null)}>Close Current Project</button>
            </div>
            {activeSection === 'project' && (
                <ProjectContent projectData={projectData} setProjectData={setProjectData} />
            )}
            <ProgressBar />
        </div>
    );
};

export default Home;
