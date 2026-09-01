@echo off
title SyncStream Server - Starting...
color 0A
echo.
echo  ============================================
echo   SyncStream Backend Server Launcher
echo  ============================================
echo.

:: Kill any existing Node.js process on port 5000
echo  [1/3] Checking for existing server on port 5000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000 " ^| findstr "LISTENING" 2^>nul') do (
    echo  [1/3] Killing existing process PID %%a on port 5000...
    taskkill /PID %%a /F >nul 2>&1
)

:: Check MySQL is running
echo  [2/3] Checking XAMPP MySQL is running...
netstat -ano | findstr ":3306 " | findstr "LISTENING" >nul 2>&1
if errorlevel 1 (
    echo  [WARNING] MySQL is NOT running. Start XAMPP MySQL first!
) else (
    echo  [2/3] MySQL is running OK.
)

:: Start the server
echo  [3/3] Starting SyncStream server on port 5000...
echo.
cd /d "%~dp0server"
echo  Server started! Keep this window open.
echo.
node index.js

pause
