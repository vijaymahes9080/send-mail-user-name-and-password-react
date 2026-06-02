@echo off
title MERN Authentication System Launcher
echo ==========================================
echo Starting MERN Authentication System Setup
echo ==========================================
echo.

:: Check if node_modules exists, if not, install dependencies
if not exist node_modules (
    echo [INFO] node_modules not found. Installing root, backend, and frontend dependencies...
    call npm install
) else (
    echo [INFO] Dependencies already installed. Skipping installation...
)

echo.
echo ==========================================
echo Launching Backend and Frontend Servers...
echo ==========================================
echo.

call npm run dev

pause
