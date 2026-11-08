@echo off
setlocal EnableExtensions
title Vessel Browser - Community Edition

cd /d "%~dp0"
if errorlevel 1 (
  echo [ERROR] Could not open the Vessel Browser folder.
  pause
  exit /b 1
)

echo.
echo  ============================================
echo    VESSEL BROWSER - COMMUNITY EDITION
echo  ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js is not installed or is not in PATH.
  echo Install Node.js 22.23.2 or newer, then run this file again.
  echo https://nodejs.org/
  pause
  exit /b 1
)

node -e "const v=process.versions.node.split('.').map(Number);process.exit(v[0]>22||(v[0]===22&&(v[1]>23||(v[1]===23&&v[2]>=2)))?0:1)"
if errorlevel 1 (
  echo [ERROR] Node.js 22.23.2 or newer is required.
  echo Current version:
  node -v
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm was not found. Reinstall Node.js with npm included.
  pause
  exit /b 1
)

npm -s --version >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm is not working correctly.
  pause
  exit /b 1
)

if not exist "node_modules\electron\package.json" (
  echo [SETUP] Installing project dependencies. This may take a few minutes...
  call npm install
  if errorlevel 1 (
    echo.
    echo [ERROR] Dependency installation failed.
    pause
    exit /b 1
  )
)

if not exist "node_modules\electron-vite\bin\electron-vite.js" (
  echo [SETUP] Installing missing development dependencies...
  call npm install
  if errorlevel 1 (
    echo.
    echo [ERROR] Dependency installation failed.
    pause
    exit /b 1
  )
)

if not exist "node_modules\electron-vite\bin\electron-vite.js" (
  echo [ERROR] electron-vite is still missing after npm install.
  pause
  exit /b 1
)

rem Prevent inherited Electron/Node environment variables from breaking startup.
set "ELECTRON_RUN_AS_NODE="
set "ELECTRON_DISABLE_SANDBOX=1"

echo [START] Launching Vessel Browser...
echo [INFO] Close this window to stop the development session.
echo.
call ".\node_modules\.bin\electron-vite.cmd" dev
set "EXIT_CODE=%ERRORLEVEL%"

if not "%EXIT_CODE%"=="0" (
  echo.
  echo [ERROR] Vessel Browser stopped with exit code %EXIT_CODE%.
  echo If you need help, send the full error text shown above.
  pause
)

exit /b %EXIT_CODE%
