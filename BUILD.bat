@echo off
title ANON-IRAN v5.0.0 - Build
color 0C
echo.
echo  ╔══════════════════════════════════════════╗
echo  ║   ANON-IRAN v5.0.0 - EXE Builder         ║
echo  ║   531+ Security Tools Platform           ║
echo  ╚══════════════════════════════════════════╝
echo.

:: Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Node.js not found!
    echo  Please install Node.js 18+ from https://nodejs.org
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo  [OK] Node.js %NODE_VER% found
echo.

echo  [1/3] Installing dependencies (this may take a few minutes)...
echo        Requires internet connection for first run.
echo.
call npm install
if errorlevel 1 (
    echo  [ERROR] npm install failed. Check internet connection.
    pause
    exit /b 1
)

echo.
echo  [2/3] Building Windows EXE (NSIS installer + Portable)...
echo        This will take 2-5 minutes...
echo.
call npm run build
if errorlevel 1 (
    echo  [ERROR] Build failed. See output above.
    pause
    exit /b 1
)

echo.
echo  [3/3] Build complete!
echo.
echo  ╔══════════════════════════════════════════╗
echo  ║   OUTPUT FILES in dist\ folder:          ║
echo  ║                                          ║
echo  ║   ANON-IRAN Setup 5.0.0.exe   (installer)║
echo  ║   ANON-IRAN-Portable-5.0.0.exe (portable)║
echo  ╚══════════════════════════════════════════╝
echo.
echo  Double-click either EXE to run ANON-IRAN!
echo.
explorer dist
pause
