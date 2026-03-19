@echo off
setlocal enabledelayedexpansion
echo 🥗 Smart Plate Stability Guard - Final Version...
echo.

:: Path Config
set PROJECT_DIR=%~dp0
cd /d %PROJECT_DIR%

:: Step 1: Kill existing processes on ports 8000 and 5173
echo [*] Cleaning up existing server processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do (
    echo [*] Found PID %%a on port 5173. Killing...
    taskkill /F /PID %%a 2>nul
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do (
    echo [*] Found PID %%a on port 8000. Killing...
    taskkill /F /PID %%a 2>nul
)

:: Step 2: Start Backend
echo [+] Launching Backend Engine (Port 8000)...
cd backend
start /b python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
cd ..
timeout /t 5 /nobreak >nul

:: Step 3: Start Frontend
echo [+] Launching Frontend Analytics (Port 5173)...
cd frontend
start /b npx vite --host 0.0.0.0 --port 5173 --strictPort
cd ..
timeout /t 5 /nobreak >nul

:: Step 4: Final Launch
echo.
echo ✅ System is ONLINE! Check the terminal above for your "Network" IP Address.
echo [!] Type that Network IP starting with http:// in your Phone browser!
echo [!] Keep this window open. 
echo.
start http://localhost:5173

pause
