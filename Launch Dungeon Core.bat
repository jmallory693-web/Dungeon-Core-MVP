@echo off
setlocal

cd /d "%~dp0"

echo.
echo ============================================================
echo   Dungeon Core: First Floor
echo ============================================================
echo.

where npm >nul 2>&1
if errorlevel 1 (
  echo npm was not found in PATH.
  echo Install Node.js 18+ from https://nodejs.org/ and try again.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo Installing dependencies - first launch...
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo npm install failed. Check the errors above.
    echo.
    pause
    exit /b 1
  )
  echo.
)

echo The dev server is starting.
echo Your browser should open automatically.
echo If it does not, open: http://127.0.0.1:5173
echo.
echo Press Ctrl+C in this window to stop the server.
echo.

call npm run dev -- --host 127.0.0.1 --open /

echo.
echo Dev server stopped.
pause
