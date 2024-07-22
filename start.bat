@echo off

REM Start the backend
start cmd /k "call startBackend.bat"

REM Start the frontend
start cmd /k "call startFrontend.bat"

REM Wait for user input to close
pause