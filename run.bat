@echo off
title Acqclip Launcher
echo =======================================
echo       Starting Acqclip Server...
echo =======================================
cd /d "%~dp0"

:: Check if node_modules exists, if not install
if not exist "node_modules\" (
    echo Installing Node dependencies...
    call npm install
)

:: Open browser automatically after 2 seconds in background
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:3000"

:: Start the server
node server.js
pause
