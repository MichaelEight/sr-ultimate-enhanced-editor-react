// src/App.js
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Box from "@mui/material/Box";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import ScenarioPage from "./pages/ScenarioPage";
import SettingsPage from "./pages/SettingsPage";
import RegionsPage from "./pages/RegionsPage";
import TheatersPage from "./pages/TheatersPage";
import ResourcesPage from "./pages/ResourcesPage";
import WorldMarketPage from "./pages/WorldMarketPage";
import OrbatPage from "./pages/OrbatPage";
import ProgressBar from "./components/common/Progressbar";
import { ProjectProvider } from "./context/ProjectContext";
import { ThemeProvider } from "./context/ThemeContext";
import useProjectManagement from "./hooks/useProjectManagement";

const DRAWER_WIDTH = 280;

const App = () => {
  return (
    <ThemeProvider>
      <ProjectProvider>
        <Router basename={import.meta.env.BASE_URL}>
          <AppWrapper />
        </Router>
      </ProjectProvider>
    </ThemeProvider>
  );
};

const AppWrapper = () => {
  const {
    project,
    setProject,
    progress,
    handleCreateEmptyProject,
    handleFileChangeAndUpload,
    handleLoadDefaultProject,
    handleCloseProject,
    handleExport,
  } = useProjectManagement();

  const defaultProjects = ["Project1", "Project2", "Project3"];

  return (
    <AppContent
      defaultProjects={defaultProjects}
      project={project}
      setProject={setProject}
      handleLoadDefaultProject={handleLoadDefaultProject}
      handleCloseProject={handleCloseProject}
      handleExport={handleExport}
      handleCreateEmptyProject={handleCreateEmptyProject}
      handleFileChangeAndUpload={handleFileChangeAndUpload}
      progress={progress}
    />
  );
};

const AppContent = ({
  defaultProjects,
  project,
  setProject,
  handleLoadDefaultProject,
  handleCloseProject,
  handleExport,
  handleCreateEmptyProject,
  handleFileChangeAndUpload,
  progress,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [activeTab, setActiveTab] = useState(location.pathname);

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location]);

  useEffect(() => {
    if (!project) {
      setActiveTab("/");
      navigate("/");
    }
  }, [project, navigate]);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Navbar
        project={project}
        drawerOpen={drawerOpen}
        toggleDrawer={toggleDrawer}
        drawerWidth={DRAWER_WIDTH}
      />
      <Sidebar
        defaultProjects={defaultProjects}
        project={project}
        handleLoadDefaultProject={handleLoadDefaultProject}
        handleCloseProject={handleCloseProject}
        handleExport={handleExport}
        handleCreateEmptyProject={handleCreateEmptyProject}
        handleFileChangeAndUpload={handleFileChangeAndUpload}
        drawerOpen={drawerOpen}
        drawerWidth={DRAWER_WIDTH}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          ml: drawerOpen ? 0 : `-${DRAWER_WIDTH}px`,
          transition: (theme) =>
            theme.transitions.create(["margin"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          backgroundColor: "background.default",
        }}
      >
        <Routes>
          <Route
            path="/"
            element={
              <ScenarioPage
                activeTab={activeTab}
                project={project}
                setProject={setProject}
              />
            }
          />
          {project && (
            <>
              <Route
                path="/settings"
                element={
                  <SettingsPage
                    activeTab={activeTab}
                    project={project}
                    setProject={setProject}
                  />
                }
              />
              <Route
                path="/regions"
                element={
                  <RegionsPage
                    activeTab={activeTab}
                    project={project}
                    setProject={setProject}
                  />
                }
              />
              <Route
                path="/theaters"
                element={<TheatersPage activeTab={activeTab} />}
              />
              <Route
                path="/resources"
                element={<ResourcesPage activeTab={activeTab} />}
              />
              <Route
                path="/worldmarket"
                element={<WorldMarketPage activeTab={activeTab} />}
              />
              <Route
                path="/orbat"
                element={<OrbatPage activeTab={activeTab} />}
              />
            </>
          )}
        </Routes>
      </Box>
      <ProgressBar progress={progress} />
    </Box>
  );
};

export default App;
