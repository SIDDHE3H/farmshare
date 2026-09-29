@echo off
set "PATH=%~dp0tools\node;%PATH%"
echo Starting FarmShare Frontend Client on http://localhost:5173...
cd /d "%~dp0client"
npm run dev
pause
