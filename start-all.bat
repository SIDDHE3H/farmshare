@echo off
title FarmShare Launcher
echo Starting FarmShare Full-Stack System...
start "FarmShare Backend Server (Port 5000)" cmd /k "%~dp0start-server.bat"
timeout /t 2 /nobreak >nul
start "FarmShare Frontend Client (Port 5173)" cmd /k "%~dp0start-client.bat"
timeout /t 3 /nobreak >nul
start http://localhost:5173
echo FarmShare is launching!
