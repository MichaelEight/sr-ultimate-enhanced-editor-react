import React, { useState, useEffect, useCallback } from 'react';
import useFileUpload from '../hooks/useProjectManagement';
import useSocket from '../hooks/useSocket';
import { useMessage } from '../contexts/MessageContext';
import '../assets/styles/ScenarioPage.css';
import debounce from 'lodash/debounce'; // Import debounce from lodash

const ScenarioPage = ({ project, setProject }) => {
    const {
        handleFileChangeAndUpload,
        handleExport,
        progress,
        setProgress,
        setProgressMessage
    } = useFileUpload(); // Do not destructure project and setProject here
    
    const [defaultProjects] = useState(["Project1", "Project2", "Project3"]); // Example default projects

    useSocket(setProgress, setProgressMessage);

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

    const removeFileExtension = (filename) => {
        return typeof filename === 'string' ? filename.replace(/\.\w+$/, '') : '';
    };

    return (
        <div className="ScenarioPage-container">
            <div className="content">
                {project ? (
                    <div className="project-content">
                        <h2>General Information</h2>
                        <div className="form-section">
                            <div className="input-group">
                                <label>Scenario Name*</label>
                                <input
                                    type="text"
                                    value={project.scenario && project.scenario[0] ? removeFileExtension(project.scenario[0]) : ''} 
                                    onChange={(e) => handleInputFieldChange('scenario', e.target.value)}
                                />
                            </div>

                            <div className="input-group">
                                <label>Cache Name*</label>
                                <input
                                    type="text"
                                    value={project.sav && project.sav[0] ? removeFileExtension(project.sav[0]) : ''} 
                                    onChange={(e) => handleInputFieldChange('sav', e.target.value)}
                                />
                                <div className="checkbox-under-input">
                                    <input type="checkbox" id="same-as-scenario" />
                                    <label htmlFor="same-as-scenario">Same as Scenario Name</label>
                                </div>
                            </div>
                        </div>

                        <h2>Map Files</h2>
                        <div className="form-section">
                            <div className="input-group">
                                <label>Map Name*</label>
                                <input
                                    type="text"
                                    value={project.mapx && project.mapx[0] ? removeFileExtension(project.mapx[0]) : ''}
                                    onChange={(e) => handleInputFieldChange('mapx', e.target.value)}
                                />
                            </div>

                            <div className="input-group">
                                <label>OOF*</label>
                                <input 
                                    type="text"
                                    value={project.oof && project.oof[0] ? removeFileExtension(project.oof[0]) : ''}
                                    onChange={(e) => handleInputFieldChange('oof', e.target.value)}
                                />
                                <div className="checkbox-under-input">
                                    <input type="checkbox" id="same-as-map" />
                                    <label htmlFor="same-as-map">Same as Map Name</label>
                                </div>
                            </div>
                        </div>

                        <h2>Non-editable Data Files</h2>
                        <div className="checkbox-group">
                            <input type="checkbox" id="use-default-files" />
                            <label htmlFor="use-default-files">Use Default Files</label>
                        </div>

                        <div className="form-section">
                            <div className="input-group">
                                <label>UNIT*</label>
                                <input 
                                    type="text"
                                    value={project.unit && project.unit[0] ? removeFileExtension(project.unit[0]) : ''}
                                    onChange={(e) => handleInputFieldChange('unit', e.target.value)}
                                />
                            </div>
                            <div className="input-group">
                                <label>PPLX*</label>
                                <input 
                                    type="text"
                                    value={project.pplx && project.pplx[0] ? removeFileExtension(project.pplx[0]) : ''}
                                    onChange={(e) => handleInputFieldChange('pplx', e.target.value)}
                                />
                            </div>
                            <div className="input-group">
                                <label>TTRX*</label>
                                <input 
                                    type="text"
                                    value={project.ttrx && project.ttrx[0] ? removeFileExtension(project.ttrx[0]) : ''}
                                    onChange={(e) => handleInputFieldChange('ttrx', e.target.value)}
                                />
                            </div>
                            <div className="input-group">
                                <label>TERX*</label>
                                <input 
                                    type="text"
                                    value={project.terx && project.terx[0] ? removeFileExtension(project.terx[0]) : ''}
                                    onChange={(e) => handleInputFieldChange('terx', e.target.value)}
                                />
                            </div>
                            <div className="input-group">
                                <label>NEWSITEMS*</label>
                                <input 
                                    type="text"
                                    value={project.newsitems && project.newsitems[0] ? removeFileExtension(project.newsitems[0]) : ''}
                                    onChange={(e) => handleInputFieldChange('newsitems', e.target.value)}
                                />
                            </div>
                            <div className="input-group">
                                <label>PROFILE*</label>
                                <input 
                                    type="text"
                                    value={project.prf && project.prf[0] ? removeFileExtension(project.prf[0]) : ''}
                                    onChange={(e) => handleInputFieldChange('prf', e.target.value)}
                                />
                            </div>
                        </div>

                        <h2>Editable Data Files</h2>
                        <div className="form-section">
                            <div className="input-group">
                                <label>CVP*</label>
                                <input 
                                    type="text"
                                    value={project.cvp && project.cvp[0] ? removeFileExtension(project.cvp[0]) : ''}
                                    onChange={(e) => handleInputFieldChange('cvp', e.target.value)}
                                />
                            </div>

                            <div className="input-group">
                                <label>WMData*</label>
                                <input 
                                    type="text"
                                    value={project.wmdata && project.wmdata[0] ? removeFileExtension(project.wmdata[0]) : ''}
                                    onChange={(e) => handleInputFieldChange('wmdata', e.target.value)}
                                />
                            </div>
                            <div className="input-group">
                                <label>OOB</label>
                                <input 
                                    type="text"
                                    value={project.oob && project.oob[0] ? removeFileExtension(project.oob[0]) : ''}
                                    onChange={(e) => handleInputFieldChange('oob', e.target.value)}
                                />
                            </div>
                            <div className="input-group">
                                <label>Pre-Cache</label>
                                <input 
                                    type="text"
                                    value={project.preCache && project.preCache[0] ? removeFileExtension(project.preCache[0]) : ''}
                                    onChange={(e) => handleInputFieldChange('preCache', e.target.value)}
                                />
                            </div>
                            <div className="input-group">
                                <label>Post-Cache</label>
                                <input 
                                    type="text"
                                    value={project.postCache && project.postCache[0] ? removeFileExtension(project.postCache[0]) : ''}
                                    onChange={(e) => handleInputFieldChange('postCache', e.target.value)}
                                />
                            </div>
                        </div>
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

export default ScenarioPage;
