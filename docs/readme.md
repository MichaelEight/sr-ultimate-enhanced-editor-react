# SR Ultimate Enhanced Editor React

This project is a **Python Backend** and **ReactJS Frontend** web application for managing, uploading, and exporting project files. It includes features for validating and processing game scenario files.

## Table of Contents

- [Project Structure](#project-structure)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [License](#license)

## Project Structure

The project follows the structure below:

```
/backend/                  # Python backend API code
  ├── /exported/           # Exported project files
  ├── /extracted/          # Extracted project files
  ├── /logs/               # Backend log files
  ├── /uploaded/           # Uploaded project files
  ├── app.py               # Main Flask application
  ├── config.py            # Configuration settings
  ├── message.py           # Logging system and messages
  ├── utilities.py         # Utility functions for backend
  ├── validation.py        # Validation module for file structure
  └── requirements.txt     # Python dependencies

/docs/                     # Documentation
  ├── guide_commit_pull_request.md  # Guide for commits and pull requests
  ├── guide_issue_creation_workflow.md  # Guide for issue creation and workflow
  └── guide_release.md     # Release guide

/frontend/                 # ReactJS frontend code
  ├── /public/             # Static frontend assets
  ├── /src/                # React application source code
  ├── package.json         # Frontend dependencies and scripts
  └── package-lock.json    # Locked dependency versions

/experimental_scripts/      # Experimental Python scripts for data extraction and insertion
  ├── extractingDataFromCVP/  
  ├── extractingDataFromOOB/
  ├── insertingDataIntoCVP/
  ├── insertingDataIntoOOB/
  └── insertingDataIntoWMData/

/.gitignore                 # Git ignored files
Dockerfile                  # Docker configuration for backend
docker-compose.yml          # Docker Compose setup for backend and frontend
```

## Installation

### Backend (Python Flask)

1. Install the Python dependencies:

   ```bash
   pip install -r backend/requirements.txt
   ```

2. Ensure you have Python 3.x installed.

### Frontend (ReactJS)

1. Navigate to the frontend folder:

   ```bash
   cd frontend
   ```

2. Install the Node.js dependencies:

   ```bash
   npm install
   ```

## Running the Application

### General use

Use `start.bat` file to start both frontend and backend.
If one of them fails, launch `startBackend.bat` or `startFrontend.bat` to try again.
If that fails, follow the guide below.

### Backend

To run the Flask backend, use the following commands:

```bash
cd backend
python app.py
```

The backend will be available at `http://localhost:5000`.

### Frontend

To run the React frontend, use the following commands:

```bash
cd frontend
npm start
```

The frontend will be available at `http://localhost:3000`.

### Docker Setup (optional)

To run both the backend and frontend using Docker, use the following command:

```bash
docker-compose up --build
```

This will set up the backend at `http://localhost:5000` and the frontend at `http://localhost:3000`.

## Contributing

### Committing and Pull Requests

Refer to the [commit and pull request guide](docs/guide_commit_pull_request.md) for instructions on making a commit and submitting a pull request.

### Issue Creation

Refer to the [issue creation guide](docs/guide_issue_creation_workflow.md) for instructions on creating and working on issues.

## License

This project is licensed under the terms of the license that will be included.