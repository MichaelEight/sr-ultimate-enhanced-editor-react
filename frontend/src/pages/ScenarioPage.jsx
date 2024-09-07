import React, { useState, useEffect, useCallback } from 'react';
import useFileUpload from '../hooks/useFileUpload';
import useSocket from '../hooks/useSocket';
import { useMessage } from '../contexts/MessageContext';
import '../assets/styles/Home.css'; // Import the CSS file for Home styles
import debounce from 'lodash/debounce'; // Import debounce from lodash

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
            sav: [''],
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

        // Make a call to /create_empty_project endpoint
        fetch('http://localhost:5000/create_empty_project')
        .then(response => {
            if (!response.ok) {
                throw new Error('[create_empty_project] Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            // Optionally update the state with data from the response
            // setProject(data.projectFileStructure);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    };

    // useEffect(() => {
    //     console.log("Project state:", project);  // Log the current project state
    // }, [project]);

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

    // Function to handle input changes and send API request to rename the file
    const handleInputChange = useCallback(
        debounce((ext, newFileName) => {
            fetch('http://localhost:5000/rename_file', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ext, newFileName }),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('[rename_file] Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('File renamed successfully:', data);
            })
            .catch(error => {
                console.error('There was a problem with the rename operation:', error);
            });
        }, 500), // Debounce time: 500ms
        [] // Only re-create if any dependencies change (none in this case)
    );

    const handleInputFieldChange = (ext, newFileName) => {
        setProject(prevProject => ({ ...prevProject, [ext]: [newFileName] }));
        handleInputChange(ext, newFileName); // Call the debounced function
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
                            onChange={(e) => handleInputFieldChange('scenario', e.target.value)}
                        />
                        <label>Cache Name*</label>
                        <input
                            type="text"
                            value={project.sav && project.sav[0] ? removeFileExtension(project.sav[0]) : ''} 
                            onChange={(e) => handleInputFieldChange('sav', e.target.value)}
                        />
                        <input type="checkbox" /> Same as Scenario Name

                        <h2>Map Files</h2>
                        <label>Map Name*</label>
                        <input
                            type="text"
                            value={project.mapx && project.mapx[0] ? removeFileExtension(project.mapx[0]) : ''} 
                            onChange={(e) => handleInputFieldChange('mapx', e.target.value)}
                        />
                        <input type="checkbox" /> Create New Map
                        <label>OOF*</label>
                        <input 
                            type="text"
                            value={project.oof && project.oof[0] ? removeFileExtension(project.oof[0]) : ''} 
                            onChange={(e) => handleInputFieldChange('oof', e.target.value)}
                        />
                        <input type="checkbox" /> Same as Map Name

                        <h2>Non-editable Data Files</h2>
                        <input type="checkbox" /> Use Default Files
                        <label>UNIT*</label>
                        <input 
                            type="text"
                            value={project.unit && project.unit[0] ? removeFileExtension(project.unit[0]) : ''} 
                            onChange={(e) => handleInputFieldChange('unit', e.target.value)}
                            />
                        <label>PPLX*</label>
                        <input 
                            type="text"
                            value={project.pplx && project.pplx[0] ? removeFileExtension(project.pplx[0]) : ''} 
                            onChange={(e) => handleInputFieldChange('pplx', e.target.value)}
                            />
                        <label>TTRX*</label>
                        <input 
                            type="text"
                            value={project.ttrx && project.ttrx[0] ? removeFileExtension(project.ttrx[0]) : ''} 
                            onChange={(e) => handleInputFieldChange('ttrx', e.target.value)}
                            />
                        <label>TERX*</label>
                        <input 
                            type="text"
                            value={project.terx && project.terx[0] ? removeFileExtension(project.terx[0]) : ''} 
                            onChange={(e) => handleInputFieldChange('terx', e.target.value)}
                            />
                        <label>NEWSITEMS*</label>
                        <input 
                            type="text"
                            value={project.newsitems && project.newsitems[0] ? removeFileExtension(project.newsitems[0]) : ''} 
                            onChange={(e) => handleInputFieldChange('newsitems', e.target.value)}
                            />
                        <label>PROFILE*</label>
                        <input 
                            type="text"
                            value={project.prf && project.prf[0] ? removeFileExtension(project.prf[0]) : ''} 
                            onChange={(e) => handleInputFieldChange('prf', e.target.value)}
                            />

                        <h2>Editable Data Files</h2>
                        <label>CVP*</label>
                        <input 
                            type="text"
                            value={project.cvp && project.cvp[0] ? removeFileExtension(project.cvp[0]) : ''} 
                            onChange={(e) => handleInputFieldChange('cvp', e.target.value)}
                            />
                        <label>WMData*</label>
                        <input 
                            type="text"
                            value={project.wmdata && project.wmdata[0] ? removeFileExtension(project.wmdata[0]) : ''} 
                            onChange={(e) => handleInputFieldChange('wmdata', e.target.value)}
                            />
                        <label>OOB</label>
                        <input 
                            type="text"
                            value={project.oob && project.oob[0] ? removeFileExtension(project.oob[0]) : ''} 
                            onChange={(e) => handleInputFieldChange('oob', e.target.value)}
                            />
                        <label>Pre-Cache</label>
                        <input 
                            type="text"
                            value={project.preCache && project.preCache[0] ? removeFileExtension(project.preCache[0]) : ''} 
                            onChange={(e) => handleInputFieldChange('preCache', e.target.value)}
                            />
                        <label>Post-Cache</label>
                        <input 
                            type="text"
                            value={project.postCache && project.postCache[0] ? removeFileExtension(project.postCache[0]) : ''} 
                            onChange={(e) => handleInputFieldChange('postCache', e.target.value)}
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
