@echo off
title ANON-IRAN v5.0.0 - Auto Install & Build
color 0C
echo.
echo  ╔══════════════════════════════════════════════╗
echo  ║   ANON-IRAN v5.0.0 — Auto Installer         ║
echo  ║   Arsenal ✦ Swiss Army ✦ Kali ✦ Parrot      ║
echo  ║   531+ Security Tools                       ║
echo  ╚══════════════════════════════════════════════╝
echo.

set "NEED_NODE=0"
node --version >nul 2>&1
if errorlevel 1 set NEED_NODE=1

if "%NEED_NODE%"=="0" (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
    echo  [OK] Node.js %NODE_VER% detected
    goto :BUILD
)

echo  [!] Node.js not found. Attempting automatic installation...
echo.

:: Try winget first
winget --version >nul 2>&1
if not errorlevel 1 (
    echo  [INSTALL] Installing Node.js via winget...
    winget install OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
    goto :REFRESH
)

:: Try chocolatey
choco --version >nul 2>&1
if not errorlevel 1 (
    echo  [INSTALL] Installing Node.js via Chocolatey...
    choco install nodejs-lts -y
    goto :REFRESH
)

:: Manual download via PowerShell
echo  [INSTALL] Downloading Node.js installer via PowerShell...
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol='Tls12'; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi' -OutFile '%TEMP%\node_installer.msi' -UseBasicParsing}"
if exist "%TEMP%\node_installer.msi" (
    echo  [INSTALL] Running Node.js installer...
    msiexec /i "%TEMP%\node_installer.msi" /qn ADDLOCAL=ALL
    goto :REFRESH
)

echo  [ERROR] Could not auto-install Node.js.
echo          Please install manually from: https://nodejs.org
echo          Then run BUILD.bat
pause
exit /b 1

:REFRESH
echo  [INFO] Refreshing environment variables...
call refreshenv >nul 2>&1
set PATH=%PATH%;%ProgramFiles%\nodejs
node --version >nul 2>&1
if errorlevel 1 (
    echo  [WARN] Node.js installed but PATH not updated yet.
    echo  Please restart this script or open a new terminal.
    pause
    exit /b 1
)

:BUILD
echo.
echo  [1/3] Installing npm packages...
call npm install --prefer-offline
if errorlevel 1 (
    echo  [INFO] Retrying with network...
    call npm install
)
if errorlevel 1 (
    echo  [ERROR] npm install failed.
    pause
    exit /b 1
)

echo.
echo  [2/3] Building EXE (2-5 mins)...
call npm run build
if errorlevel 1 (
    echo  [ERROR] Build failed.
    pause
    exit /b 1
)

echo.
echo  ╔══════════════════════════════════════════════╗
echo  ║   ✓ BUILD COMPLETE!                          ║
echo  ║                                              ║
echo  ║   dist\ANON-IRAN Setup 5.0.0.exe            ║
echo  ║   dist\ANON-IRAN-Portable-5.0.0.exe         ║
echo  ╚══════════════════════════════════════════════╝
echo.
if exist dist (explorer dist)
pause
