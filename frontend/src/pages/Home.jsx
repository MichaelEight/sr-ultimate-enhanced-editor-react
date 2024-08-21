import React, { useState, useEffect } from 'react';
import useFileUpload from '../hooks/useFileUpload';
import useSocket from '../hooks/useSocket';
import { useMessage } from '../contexts/MessageContext';
import '../assets/styles/Home.css'; // Import the CSS file for Home styles

const Home = () => {
    const {
        handleFileChangeAndUpload,
        handleExport,
        progress,
        setProgress,
        setProgressMessage,
        project,
        setProject
    } = useFileUpload();
    const [defaultProjects] = useState(["Project1", "Project2", "Project3"]); // Example default projects

    useSocket(setProgress, setProgressMessage);

    const handleCreateEmptyProject = () => {
        setProject({
            scenario: [''],
            cacheName: [''],
            map: [''],
            oof: [''],
            regionincl: [''],
            unit: ['default'],
            pplx: ['default'],
            ttrx: ['default'],
            terx: ['default'],
            newsitems: ['default'],
            prf: ['default'],
            cvp: [''],
            wmdata: [''],
            oob: [''],
            preCache: [''],
            postCache: [''],
            new_project: true  // Indicate that this is a new project
        });
    };

    useEffect(() => {
        console.log("Project state:", project);  // Log the current project state
    }, [project]);

    const handleLoadDefaultProject = async (projectName) => {
        try {
            const response = await fetch(`http://localhost:5000/load_default_project/${projectName}`);
            if (response.ok) {
                const projectData = await response.json();
                console.log('Loaded default project data:', projectData);  // Log the loaded project data
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

    const removeFileExtension = (filename) => {
        return typeof filename === 'string' ? filename.replace(/\.\w+$/, '') : '';
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
                        <input
                            type="text"
                            value={project.scenario && project.scenario[0] ? removeFileExtension(project.scenario[0]) : ''} 
                            onChange={(e) => setProject({ ...project, scenario: [e.target.value] })}
                        />
                        <label>Cache Name*</label>
                        <input
                            type="text"
                            value={project.cacheName && project.cacheName[0] ? removeFileExtension(project.cacheName[0]) : ''} 
                            onChange={(e) => setProject({ ...project, cacheName: [e.target.value] })}
                        />
                        <input type="checkbox" /> Same as Scenario Name

                        <h2>Map Files</h2>
                        <label>Map Name*</label>
                        <input
                            type="text"
                            value={project.mapx && project.mapx[0] ? removeFileExtension(project.mapx[0]) : ''} 
                            onChange={(e) => setProject({ ...project, mapx: [e.target.value] })}
                        />
                        <input type="checkbox" /> Create New Map
                        <label>OOF*</label>
                        <input 
                            type="text"
                            value={project.oof && project.oof[0] ? removeFileExtension(project.oof[0]) : ''} 
                            onChange={(e) => setProject({ ...project, oof: [e.target.value] })}
                            />
                        <input type="checkbox" /> Same as Map Name

                        <h2>Non-editable Data Files</h2>
                        <input type="checkbox" /> Use Default Files
                        <label>UNIT*</label>
                        <input 
                            type="text"
                            value={project.unit && project.unit[0] ? removeFileExtension(project.unit[0]) : ''} 
                            onChange={(e) => setProject({ ...project, unit: [e.target.value] })}
                            />
                        <label>PPLX*</label>
                        <input 
                            type="text"
                            value={project.pplx && project.pplx[0] ? removeFileExtension(project.pplx[0]) : ''} 
                            onChange={(e) => setProject({ ...project, pplx: [e.target.value] })}
                            />
                        <label>TTRX*</label>
                        <input 
                            type="text"
                            value={project.ttrx && project.ttrx[0] ? removeFileExtension(project.ttrx[0]) : ''} 
                            onChange={(e) => setProject({ ...project, ttrx: [e.target.value] })}
                            />
                        <label>TERX*</label>
                        <input 
                            type="text"
                            value={project.terx && project.terx[0] ? removeFileExtension(project.terx[0]) : ''} 
                            onChange={(e) => setProject({ ...project, terx: [e.target.value] })}
                            />
                        <label>NEWSITEMS*</label>
                        <input 
                            type="text"
                            value={project.newsitems && project.newsitems[0] ? removeFileExtension(project.newsitems[0]) : ''} 
                            onChange={(e) => setProject({ ...project, newsitems: [e.target.value] })}
                            />
                        <label>PROFILE*</label>
                        <input 
                            type="text"
                            value={project.prf && project.prf[0] ? removeFileExtension(project.prf[0]) : ''} 
                            onChange={(e) => setProject({ ...project, prf: [e.target.value] })}
                            />

                        <h2>Editable Data Files</h2>
                        <label>CVP*</label>
                        <input 
                            type="text"
                            value={project.cvp && project.cvp[0] ? removeFileExtension(project.cvp[0]) : ''} 
                            onChange={(e) => setProject({ ...project, cvp: [e.target.value] })}
                            />
                        <label>WMData*</label>
                        <input 
                            type="text"
                            value={project.wmdata && project.wmdata[0] ? removeFileExtension(project.wmdata[0]) : ''} 
                            onChange={(e) => setProject({ ...project, wmdata: [e.target.value] })}
                            />
                        <label>OOB</label>
                        <input 
                            type="text"
                            value={project.oob && project.oob[0] ? removeFileExtension(project.oob[0]) : ''} 
                            onChange={(e) => setProject({ ...project, oob: [e.target.value] })}
                            />
                        <label>Pre-Cache</label>
                        <input 
                            type="text"
                            value={project.preCache && project.preCache[0] ? removeFileExtension(project.preCache[0]) : ''} 
                            onChange={(e) => setProject({ ...project, preCache: [e.target.value] })}
                            />
                        <label>Post-Cache</label>
                        <input 
                            type="text"
                            value={project.postCache && project.postCache[0] ? removeFileExtension(project.postCache[0]) : ''} 
                            onChange={(e) => setProject({ ...project, postCache: [e.target.value] })}
                            />
                    </div>
                ) : (
                    <div className="empty-content">
                        <p>No project loaded. Please create or load a project.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
