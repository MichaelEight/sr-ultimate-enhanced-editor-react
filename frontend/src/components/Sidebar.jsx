import React from 'react';
import '../assets/styles/Sidebar.css'; // Import the Sidebar CSS

const Sidebar = ({ 
    defaultProjects = [], 
    project, 
    handleLoadDefaultProject, 
    handleCloseProject, 
    handleExport, 
    handleCreateEmptyProject, // Pass this prop from App.js 
    handleFileChangeAndUpload // Pass this prop from App.js 
}) => {

    return (
        <div className="sidebar">
            <button onClick={handleCreateEmptyProject}>Create Empty Project</button>
            <input type="file" onChange={handleFileChangeAndUpload} style={{ display: 'none' }} id="fileInput" />
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
    );
};

export default Sidebar;
