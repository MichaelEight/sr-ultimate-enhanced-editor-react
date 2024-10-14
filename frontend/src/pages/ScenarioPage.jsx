// src/pages/ScenarioPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import useProjectManagement from '../hooks/useProjectManagement';
import useSocket from '../hooks/useSocket';
import '../assets/styles/ScenarioPage.css';
import debounce from 'lodash/debounce';

const ScenarioPage = ({ project, setProject }) => {
    const {
        handleFileChangeAndUpload,
        handleExport,
        progress,
        setProgress
    } = useProjectManagement();

    useSocket(setProgress);

    const [useDefaultFiles, setUseDefaultFiles] = useState(true);
    const [isCacheNameSameAsScenario, setIsCacheNameSameAsScenario] = useState(false);
    const [isOOFSameAsMapName, setIsOOFSameAsMapName] = useState(false);
    const [errors, setErrors] = useState({}); // State to track validation errors

    // Create a ref to store the debounced function
    const debouncedHandleInputChange = useRef();

    if (!debouncedHandleInputChange.current) {
        debouncedHandleInputChange.current = debounce((ext, newFileName) => {
            console.log(`handleInputChange ${ext} : ${newFileName}`);
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
        }, 500);
    }

    const handleInputChange = (ext, newFileName) => {
        debouncedHandleInputChange.current(ext, newFileName);
    };

    // Helper function to get the filename
    const getFilename = (ext) => {
        if (project && project[ext] && project[ext]['filename']) {
            return project[ext]['filename'];
        }
        return '';
    };

    // Update handleInputFieldChange to include logging and validation
    const handleInputFieldChange = (ext, newFileName) => {
        console.log(`handleInputFieldChange ${ext} : ${newFileName}`);
        let extsToUpdate = [ext]; // Keep track of which exts need to send API calls

        // Validate the newFileName
        if (newFileName.trim() === '') {
            setErrors(prevErrors => ({
                ...prevErrors,
                [ext]: 'This field is required.'
            }));
        } else {
            setErrors(prevErrors => ({
                ...prevErrors,
                [ext]: ''
            }));
        }

        setProject((prevProject) => {
            if (!prevProject) prevProject = {};
            const prevFileName = prevProject[ext]?.filename || '';
            if (prevFileName === newFileName) {
                return prevProject; // No change, return previous state
            }
            let updatedProject = {
                ...prevProject,
                [ext]: {
                    ...(prevProject[ext] || {}),
                    filename: newFileName,
                },
            };

            // Synchronize 'sav' with 'scenario' if checkbox is checked
            if (ext === 'scenario' && isCacheNameSameAsScenario) {
                updatedProject = {
                    ...updatedProject,
                    'sav': {
                        ...(prevProject['sav'] || {}),
                        filename: newFileName,
                    },
                };
                extsToUpdate.push('sav'); // Add 'sav' to the list of extensions to update
            }

            // Synchronize 'oof' with 'mapx' if checkbox is checked
            if (ext === 'mapx' && isOOFSameAsMapName) {
                updatedProject = {
                    ...updatedProject,
                    'oof': {
                        ...(prevProject['oof'] || {}),
                        filename: newFileName,
                    },
                };
                extsToUpdate.push('oof'); // Add 'oof' to the list of extensions to update
            }

            return updatedProject;
        });

        // After state update, make API calls for all affected extensions if no validation errors
        extsToUpdate.forEach((extension) => {
            if (newFileName.trim() !== '') {
                handleInputChange(extension, newFileName);
            }
        });
    };

    useEffect(() => {
        if (!project) {
            // Reset state when project is closed
            setUseDefaultFiles(true);
            setIsCacheNameSameAsScenario(false);
            setIsOOFSameAsMapName(false);
            setErrors({});
            // Reset any other state variables as needed
        }
    }, [project]);

    // Function to check if all required fields are filled
    const isFormValid = () => {
        const requiredFields = [
            'scenario',
            'sav',
            'mapx',
            'oof',
            'unit',
            'pplx',
            'ttrx',
            'terx',
            'newsitems',
            'prf',
            'cvp',
            'wmdata'
        ];

        for (let field of requiredFields) {
            const value = getFilename(field);
            if (value.trim() === '') {
                return false;
            }
        }
        return true;
    };

    return (
        <div className="ScenarioPage-container">
            <div className="content">
                {project && Object.keys(project).length > 0 ? (
                    <div className="project-content">
                        <h2>General Information</h2>
                        <div className="form-section">
                            <div className="input-group">
                                <label>Scenario Name<span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={getFilename('scenario')}
                                    onChange={(e) =>
                                        handleInputFieldChange('scenario', e.target.value)
                                    }
                                    required
                                    className={errors.scenario ? 'input-error' : ''}
                                />
                                {errors.scenario && <span className="error-text">{errors.scenario}</span>}
                            </div>

                            <div className="input-group">
                                <label>Cache Name<span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={getFilename('sav')}
                                    onChange={(e) =>
                                        handleInputFieldChange('sav', e.target.value)
                                    }
                                    disabled={isCacheNameSameAsScenario}
                                    required
                                    className={errors.sav ? 'input-error' : ''}
                                />
                                {errors.sav && <span className="error-text">{errors.sav}</span>}
                                <div className="checkbox-under-input">
                                    <input
                                        type="checkbox"
                                        id="same-as-scenario"
                                        checked={isCacheNameSameAsScenario}
                                        onChange={() => {
                                            const newValue = !isCacheNameSameAsScenario;
                                            setIsCacheNameSameAsScenario(newValue);
                                            if (newValue) {
                                                const newFileName = getFilename('scenario');
                                                handleInputFieldChange('sav', newFileName);
                                            }
                                        }}
                                    />
                                    <label htmlFor="same-as-scenario">Same as Scenario Name</label>
                                </div>
                            </div>
                        </div>

                        <h2>Map Files</h2>
                        <div className="form-section">
                            <div className="input-group">
                                <label>Map Name<span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={getFilename('mapx')}
                                    onChange={(e) =>
                                        handleInputFieldChange('mapx', e.target.value)
                                    }
                                    required
                                    className={errors.mapx ? 'input-error' : ''}
                                />
                                {errors.mapx && <span className="error-text">{errors.mapx}</span>}
                            </div>

                            <div className="input-group">
                                <label>OOF<span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={getFilename('oof')}
                                    onChange={(e) =>
                                        handleInputFieldChange('oof', e.target.value)
                                    }
                                    disabled={isOOFSameAsMapName}
                                    required
                                    className={errors.oof ? 'input-error' : ''}
                                />
                                {errors.oof && <span className="error-text">{errors.oof}</span>}
                                <div className="checkbox-under-input">
                                    <input
                                        type="checkbox"
                                        id="same-as-map"
                                        checked={isOOFSameAsMapName}
                                        onChange={() => {
                                            const newValue = !isOOFSameAsMapName;
                                            setIsOOFSameAsMapName(newValue);
                                            if (newValue) {
                                                const newFileName = getFilename('mapx');
                                                handleInputFieldChange('oof', newFileName);
                                            }
                                        }}
                                    />
                                    <label htmlFor="same-as-map">Same as Map Name</label>
                                </div>
                            </div>
                        </div>

                        <h2>Non-editable Data Files</h2>
                        <div className="checkbox-group">
                            <input
                                type="checkbox"
                                id="use-default-files"
                                checked={useDefaultFiles}
                                onChange={() => {
                                    const newValue = !useDefaultFiles;
                                    setUseDefaultFiles(newValue);
                                    if (newValue) {
                                        const nonEditableExtensions = ['unit', 'pplx', 'ttrx', 'terx', 'newsitems', 'prf'];
                                        nonEditableExtensions.forEach((ext) => {
                                            handleInputFieldChange(ext, 'DEFAULT');
                                        });
                                    }
                                }}
                            />
                            <label htmlFor="use-default-files">Use Default Files</label>
                        </div>

                        <div className="form-section">
                            <div className="input-group">
                                <label>UNIT<span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={getFilename('unit')}
                                    onChange={(e) =>
                                        handleInputFieldChange('unit', e.target.value)
                                    }
                                    disabled={useDefaultFiles}
                                    required
                                    className={errors.unit ? 'input-error' : ''}
                                />
                                {errors.unit && <span className="error-text">{errors.unit}</span>}
                            </div>
                            <div className="input-group">
                                <label>PPLX<span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={getFilename('pplx')}
                                    onChange={(e) =>
                                        handleInputFieldChange('pplx', e.target.value)
                                    }
                                    disabled={useDefaultFiles}
                                    required
                                    className={errors.pplx ? 'input-error' : ''}
                                />
                                {errors.pplx && <span className="error-text">{errors.pplx}</span>}
                            </div>
                            <div className="input-group">
                                <label>TTRX<span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={getFilename('ttrx')}
                                    onChange={(e) =>
                                        handleInputFieldChange('ttrx', e.target.value)
                                    }
                                    disabled={useDefaultFiles}
                                    required
                                    className={errors.ttrx ? 'input-error' : ''}
                                />
                                {errors.ttrx && <span className="error-text">{errors.ttrx}</span>}
                            </div>
                            <div className="input-group">
                                <label>TERX<span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={getFilename('terx')}
                                    onChange={(e) =>
                                        handleInputFieldChange('terx', e.target.value)
                                    }
                                    disabled={useDefaultFiles}
                                    required
                                    className={errors.terx ? 'input-error' : ''}
                                />
                                {errors.terx && <span className="error-text">{errors.terx}</span>}
                            </div>
                            <div className="input-group">
                                <label>NEWSITEMS<span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={getFilename('newsitems')}
                                    onChange={(e) =>
                                        handleInputFieldChange('newsitems', e.target.value)
                                    }
                                    disabled={useDefaultFiles}
                                    required
                                    className={errors.newsitems ? 'input-error' : ''}
                                />
                                {errors.newsitems && <span className="error-text">{errors.newsitems}</span>}
                            </div>
                            <div className="input-group">
                                <label>PROFILE<span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={getFilename('prf')}
                                    onChange={(e) =>
                                        handleInputFieldChange('prf', e.target.value)
                                    }
                                    disabled={useDefaultFiles}
                                    required
                                    className={errors.prf ? 'input-error' : ''}
                                />
                                {errors.prf && <span className="error-text">{errors.prf}</span>}
                            </div>
                        </div>

                        <h2>Editable Data Files</h2>
                        <div className="form-section">
                            <div className="input-group">
                                <label>CVP<span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={getFilename('cvp')}
                                    onChange={(e) =>
                                        handleInputFieldChange('cvp', e.target.value)
                                    }
                                    required
                                    className={errors.cvp ? 'input-error' : ''}
                                />
                                {errors.cvp && <span className="error-text">{errors.cvp}</span>}
                            </div>

                            <div className="input-group">
                                <label>WMData<span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={getFilename('wmdata')}
                                    onChange={(e) =>
                                        handleInputFieldChange('wmdata', e.target.value)
                                    }
                                    required
                                    className={errors.wmdata ? 'input-error' : ''}
                                />
                                {errors.wmdata && <span className="error-text">{errors.wmdata}</span>}
                            </div>
                            <div className="input-group">
                                <label>OOB<span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={getFilename('oob')}
                                    onChange={(e) =>
                                        handleInputFieldChange('oob', e.target.value)
                                    }
                                    required
                                    className={errors.oof ? 'input-error' : ''}
                                />
                                {errors.oof && <span className="error-text">{errors.oof}</span>}
                            </div>
                            <div className="input-group">
                                <label>Pre-Cache<span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={getFilename('preCache')}
                                    onChange={(e) =>
                                        handleInputFieldChange('preCache', e.target.value)
                                    }
                                    required
                                    className={errors.preCache ? 'input-error' : ''}
                                />
                                {errors.preCache && <span className="error-text">{errors.preCache}</span>}
                            </div>
                            <div className="input-group">
                                <label>Post-Cache<span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={getFilename('postCache')}
                                    onChange={(e) =>
                                        handleInputFieldChange('postCache', e.target.value)
                                    }
                                    required
                                    className={errors.postCache ? 'input-error' : ''}
                                />
                                {errors.postCache && <span className="error-text">{errors.postCache}</span>}
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
