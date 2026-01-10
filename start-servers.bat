@echo off
echo ============================================
echo   Starting MediCare Servers (Local Testing)
echo ============================================
echo.

cd /d "%~dp0"

echo Starting Backend Server (Port 5001)...
start "MediCare Backend" cmd /k "npm run dev"

timeout /t 3 /nobreak > nul

echo.
echo Starting Frontend Server (Port 3000)...
cd "..\CC Frontend"
start "MediCare Frontend" cmd /k "npm run dev"

echo.
echo ============================================
echo   Servers Starting...
echo ============================================
echo.
echo Backend:  http://localhost:5001
echo Frontend: http://localhost:5173 (Vite default)
echo.
echo Check the new terminal windows for server status
echo.
echo To test admin:
echo   1. Open: http://localhost:5173
echo   2. Login: admin@gmail.com / Test@123
echo.
echo Press Ctrl+C in server windows to stop
echo.
pause
