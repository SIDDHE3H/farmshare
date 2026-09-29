@echo off
set "PATH=%~dp0tools\node;%PATH%"
echo Starting FarmShare Backend Server on http://localhost:5000...
cd /d "%~dp0server"
node src/index.js
pause
