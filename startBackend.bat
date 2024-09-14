@echo off

REM Clear backend from existing project files
start cmd /c "call clearBackendFiles.bat"

REM Navigate to the backend directory
cd backend

REM Start the Flask app
echo Starting backend...
python app.py
