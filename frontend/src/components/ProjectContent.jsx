// src/components/ProjectContent.jsx
import React from 'react';

const ProjectContent = ({ projectData, setProjectData }) => {
    const handleInputChange = (e) => {
        const { name, value, checked, type } = e.target;
        const inputValue = type === 'checkbox' ? checked : value;
        setProjectData((prevData) => ({
            ...prevData,
            [name]: inputValue,
        }));
    };

    return (
        <div className="project-content">
            <h2>General Information</h2>
            <label>
                Scenario Name*:
                <input
                    type="text"
                    name="scenarioName"
                    value={projectData.scenarioName || ''}
                    onChange={handleInputChange}
                />
            </label>
            <label>
                Cache Name*:
                <input
                    type="text"
                    name="cacheName"
                    value={projectData.cacheName || ''}
                    onChange={handleInputChange}
                />
            </label>
            <label>
                <input
                    type="checkbox"
                    name="sameAsScenarioName"
                    checked={projectData.sameAsScenarioName || false}
                    onChange={handleInputChange}
                />
                Same as Scenario Name
            </label>

            <h2>Map Files</h2>
            <label>
                Map Name*:
                <input
                    type="text"
                    name="mapName"
                    value={projectData.mapName || ''}
                    onChange={handleInputChange}
                />
            </label>
            <label>
                <input
                    type="checkbox"
                    name="createNewMap"
                    checked={projectData.createNewMap || false}
                    onChange={handleInputChange}
                />
                Create New Map
            </label>
            <label>
                OOF*:
                <input
                    type="text"
                    name="oof"
                    value={projectData.oof || ''}
                    onChange={handleInputChange}
                />
            </label>
            <label>
                <input
                    type="checkbox"
                    name="sameAsMapName"
                    checked={projectData.sameAsMapName || false}
                    onChange={handleInputChange}
                />
                Same as Map Name
            </label>

            <h2>Non-editable Data Files</h2>
            <label>
                <input
                    type="checkbox"
                    name="useDefaultFiles"
                    checked={projectData.useDefaultFiles || false}
                    onChange={handleInputChange}
                />
                Use Default Files
            </label>
            {['unit', 'pplx', 'ttrx', 'terx', 'newsitems', 'profile'].map((file) => (
                <label key={file}>
                    {file.toUpperCase()}*:
                    <input
                        type="text"
                        name={file}
                        value={projectData[file] || ''}
                        onChange={handleInputChange}
                    />
                </label>
            ))}

            <h2>Editable Data Files</h2>
            {['cvp', 'wmdata', 'oob', 'precache', 'postcache'].map((file) => (
                <label key={file}>
                    {file.toUpperCase()}*:
                    <input
                        type="text"
                        name={file}
                        value={projectData[file] || ''}
                        onChange={handleInputChange}
                    />
                </label>
            ))}
        </div>
    );
};

export default ProjectContent;
