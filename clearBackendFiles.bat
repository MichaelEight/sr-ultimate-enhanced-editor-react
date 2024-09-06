@echo off

REM Navigate to the backend directory
cd backend

REM Clear the content of extracted and uploads directories
echo Clearing extracted and uploads directories...
rmdir /S /Q extracted
mkdir extracted
rmdir /S /Q uploads
mkdir uploads
rmdir /S /Q exported
mkdir exported