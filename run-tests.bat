@echo off
set "PATH=%~dp0tools\node;%PATH%"
echo Running FarmShare Automated Test Suite...
cd /d "%~dp0server"
node test_e2e_http.js
pause
