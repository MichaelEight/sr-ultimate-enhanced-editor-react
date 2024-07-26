import React, { useState } from 'react';
import useFileUpload from '../hooks/useFileUpload';
import useSocket from '../hooks/useSocket';
import { useMessage } from '../contexts/MessageContext';
import '../assets/styles/Home.css'; // Import the CSS file for Home styles

const Home = () => {
    const {
        validationResults,
        handleFileChangeAndUpload,
        handleExport,
        handleCheckboxChange,
        progress,
        setProgress,
        setProgressMessage
    } = useFileUpload();
    const [project, setProject] = useState(null);
    const [defaultProjects] = useState(["Project1", "Project2", "Project3"]); // Example default projects

    useSocket(setProgress, setProgressMessage);

    const handleCreateEmptyProject = () => {
        setProject({
            scenarioName: '',
            cacheName: '',
            mapName: '',
            oof: '',
            unit: '',
            pplx: '',
            ttrx: '',
            terx: '',
            newsitems: '',
            profile: '',
            cvp: '',
            wmdata: '',
            oob: '',
            preCache: '',
            postCache: ''
        });
    };

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

    const handleCloseProject = () => {
        setProject(null);
    };

    return (
        <div className="home-container">
            <div className="sidebar">
                <button onClick={handleCreateEmptyProject}>Create Empty Project</button>
                <input type="file" onChange={handleFileChangeAndUpload} style={{ display: 'none' }} id="fileInput"/>
                <button onClick={() => document.getElementById('fileInput').click()}>Upload Project</button>
                <div className="default-projects">
                    <h3>Load Default Project</h3>
                    {defaultProjects.map((project, index) => (
                        <button key={index} onClick={() => handleLoadDefaultProject(project)}>{project}</button>
                    ))}
                </div>
                <button disabled>Load Last Project</button>
                <button onClick={handleCloseProject} disabled={!project}>Close Current Project</button>
                <button onClick={handleExport} disabled={!project}>Export</button>
            </div>
            <div className="content">
                {project ? (
                    <div className="project-content">
                        <h2>General Information</h2>
                        <label>Scenario Name*</label>
                        <input type="text" value={project.scenarioName} onChange={(e) => setProject({ ...project, scenarioName: e.target.value })} />
                        <label>Cache Name*</label>
                        <input type="text" value={project.cacheName} onChange={(e) => setProject({ ...project, cacheName: e.target.value })} />
                        <input type="checkbox" /> Same as Scenario Name

                        <h2>Map Files</h2>
                        <label>Map Name*</label>
                        <input type="text" value={project.mapName} onChange={(e) => setProject({ ...project, mapName: e.target.value })} />
                        <input type="checkbox" /> Create New Map
                        <label>OOF*</label>
                        <input type="text" value={project.oof} onChange={(e) => setProject({ ...project, oof: e.target.value })} />
                        <input type="checkbox" /> Same as Map Name

                        <h2>Non-editable Data Files</h2>
                        <input type="checkbox" /> Use Default Files
                        <label>UNIT*</label>
                        <input type="text" value={project.unit} onChange={(e) => setProject({ ...project, unit: e.target.value })} />
                        <label>PPLX*</label>
                        <input type="text" value={project.pplx} onChange={(e) => setProject({ ...project, pplx: e.target.value })} />
                        <label>TTRX*</label>
                        <input type="text" value={project.ttrx} onChange={(e) => setProject({ ...project, ttrx: e.target.value })} />
                        <label>TERX*</label>
                        <input type="text" value={project.terx} onChange={(e) => setProject({ ...project, terx: e.target.value })} />
                        <label>NEWSITEMS*</label>
                        <input type="text" value={project.newsitems} onChange={(e) => setProject({ ...project, newsitems: e.target.value })} />
                        <label>PROFILE*</label>
                        <input type="text" value={project.profile} onChange={(e) => setProject({ ...project, profile: e.target.value })} />

                        <h2>Editable Data Files</h2>
                        <label>CVP*</label>
                        <input type="text" value={project.cvp} onChange={(e) => setProject({ ...project, cvp: e.target.value })} />
                        <label>WMData*</label>
                        <input type="text" value={project.wmdata} onChange={(e) => setProject({ ...project, wmdata: e.target.value })} />
                        <label>OOB</label>
                        <input type="text" value={project.oob} onChange={(e) => setProject({ ...project, oob: e.target.value })} />
                        <label>Pre-Cache</label>
                        <input type="text" value={project.preCache} onChange={(e) => setProject({ ...project, preCache: e.target.value })} />
                        <label>Post-Cache</label>
                        <input type="text" value={project.postCache} onChange={(e) => setProject({ ...project, postCache: e.target.value })} />
                    </div>
                ) : (
                    <div className="empty-content">
                        <p>No project loaded. Please create or load a project.</p>
                    </div>
                )}
                {validationResults && (
                    <div>
                        <h2>Validation Results</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Path</th>
                                    <th>Required</th>
                                    <th>Exists</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(validationResults).map(([key, value]) => (
                                    <tr key={key}>
                                        <td>{key}</td>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={value.required}
                                                onChange={() => handleCheckboxChange(key)}
                                            />
                                        </td>
                                        <td>{value.exists ? 'Yes' : 'No'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
