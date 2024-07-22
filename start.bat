@echo off

REM Start the backend
start cmd /k "call startBackend.bat"

REM Start the frontend
start cmd /k "call startFrontend.bat"