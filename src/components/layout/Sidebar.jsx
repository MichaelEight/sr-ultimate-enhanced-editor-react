// src/components/Sidebar.jsx
import React from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import FolderIcon from '@mui/icons-material/Folder';

const Sidebar = ({
    defaultProjects = [],
    project,
    handleLoadDefaultProject,
    handleCloseProject,
    handleExport,
    handleCreateEmptyProject,
    handleFileChangeAndUpload,
    drawerOpen,
    drawerWidth
}) => {
    return (
        <Drawer
            variant="persistent"
            anchor="left"
            open={drawerOpen}
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                },
            }}
        >
            <Toolbar />
            <Box sx={{ overflow: 'auto', p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Project Management
                </Typography>

                <List sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<AddIcon />}
                        onClick={handleCreateEmptyProject}
                        sx={{ justifyContent: 'flex-start', py: 1.5 }}
                    >
                        Create Empty Project
                    </Button>

                    <input
                        type="file"
                        onChange={handleFileChangeAndUpload}
                        style={{ display: 'none' }}
                        id="fileInput"
                    />
                    <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<UploadFileIcon />}
                        onClick={() => document.getElementById('fileInput').click()}
                        sx={{ justifyContent: 'flex-start', py: 1.5 }}
                    >
                        Upload Project
                    </Button>

                    <Divider sx={{ my: 1 }} />

                    <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<CloseIcon />}
                        onClick={handleCloseProject}
                        disabled={!project}
                        color="error"
                        sx={{ justifyContent: 'flex-start', py: 1.5 }}
                    >
                        Close Current Project
                    </Button>

                    <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<DownloadIcon />}
                        onClick={handleExport}
                        disabled={!project}
                        color="success"
                        sx={{ justifyContent: 'flex-start', py: 1.5 }}
                    >
                        Export Project
                    </Button>
                </List>

                {project && (
                    <>
                        <Divider sx={{ my: 3 }} />
                        <Box sx={{
                            bgcolor: 'action.selected',
                            border: 1,
                            borderColor: 'divider',
                            p: 2,
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}>
                            <FolderIcon sx={{ color: 'success.main' }} />
                            <Box>
                                <Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>
                                    Current Project
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                    Loaded
                                </Typography>
                            </Box>
                        </Box>
                    </>
                )}
            </Box>
        </Drawer>
    );
};

export default Sidebar;
