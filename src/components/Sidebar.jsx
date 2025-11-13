import React, { useState } from 'react';
import '../assets/styles/Sidebar.css'; // Import the Sidebar CSS

const Sidebar = ({ 
    defaultProjects = [], 
    project, 
    handleLoadDefaultProject, 
    handleCloseProject, 
    handleExport, 
    handleCreateEmptyProject,
    handleFileChangeAndUpload 
}) => {
    const [selectedProject, setSelectedProject] = useState(''); // State for selected project in dropdown

    const handleDropdownChange = (e) => {
        setSelectedProject(e.target.value); // Update selected project
    };

    return (
        <div className="sidebar">
            <button onClick={handleCreateEmptyProject}>Create Empty Project</button>
            <input type="file" onChange={handleFileChangeAndUpload} style={{ display: 'none' }} id="fileInput" />
            <button onClick={() => document.getElementById('fileInput').click()}>Upload Project</button>

            {/* <div className="default-projects">
                <h3>Load Default Project</h3>
                <select value={selectedProject} onChange={handleDropdownChange}>
                    <option value="">Not selected</option>
                    {defaultProjects.map((project, index) => (
                        <option key={index} value={project}>{project}</option>
                    ))}
                </select>
                <button 
                    onClick={() => handleLoadDefaultProject(selectedProject)} 
                    disabled={!selectedProject} // Disable if "Not selected"
                >
                    Load Selected
                </button>
            </div> // NOT IMPLEMENTED*/}

            {/*<button disabled>Load Last Project</button> // NOT IMPLEMENTED*/}
            <button onClick={handleCloseProject} disabled={!project}>Close Current Project</button>
            <button onClick={handleExport} disabled={!project}>Export Project</button>
        </div>
    );
};

export default Sidebar;
