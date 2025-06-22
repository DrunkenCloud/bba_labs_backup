@echo off
setlocal enabledelayedexpansion

echo 🚀 Starting Demo Labs with Virtual Environment (Windows)...
echo.

REM Activate virtual environment
call .venv\Scripts\activate.bat

REM Function to run a demo with error handling
:run_demo
set "demo_name=%~1"
set "demo_path=%~2"
set "command=%~3"

echo 🔧 Starting %demo_name%...
if exist "%demo_path%" (
    cd /d "%demo_path%"
    echo 📦 Running: %command%
    start "%~1" cmd /c "%command%"
    echo ✅ %demo_name% started
    cd /d "%~dp0"
) else (
    echo ❌ Directory %demo_path% does not exist, skipping %demo_name%.
)
goto :eof

REM Start all demos
echo Starting all demo labs...
echo ============================================================

REM Node.js/Express demos
call :run_demo "Blockchain Demo" "blockchain-demo" "pnpm start"
call :run_demo "Coin Demo" "coin-demo" "pnpm run dev"
call :run_demo "Wallet Demo" "wallet-demo" "pnpm run dev"
call :run_demo "Public-Private Key Demo" "public-private-key-demo" "pnpm start"

REM Python Flask demos
call :run_demo "DID Auth Addon Backend" "did-based-secure-auth\addon" "python app.py"
call :run_demo "DID Auth Alternative Backend" "did-based-secure-auth\alternative" "python app.py"
call :run_demo "VC-VP Demo Wallet Backend" "vc-vp-demo-wallet" "python app.py"
call :run_demo "VC-VP Demo FastAPI" "vc-vp-demo" "python app.py"
call :run_demo "VC-VP Demo Flask" "vc-vp-demo" "python flask_app.py"

REM React Frontends for DID Auth
call :run_demo "DID Auth Addon Frontend" "did-based-secure-auth\addon\frontend" "set PORT=3004 && pnpm start"
call :run_demo "DID Auth Alternative Frontend" "did-based-secure-auth\alternative\frontend" "set PORT=3005 && pnpm start"

echo.
echo 🎉 All demo labs started!
echo 📋 Running processes:
tasklist /fi "imagename eq node.exe" /fo table
tasklist /fi "imagename eq python.exe" /fo table

echo.
echo 💡 To stop all demos, close the command windows or run: taskkill /f /im node.exe & taskkill /f /im python.exe
echo 🔗 Access the demos at:
echo    - Blockchain Demo: http://localhost:3000
echo    - Coin Demo: http://localhost:3001
echo    - Wallet Demo: http://localhost:3002
echo    - Public-Private Key Demo: http://localhost:3003
echo    - DID Auth Addon Backend: http://localhost:5000
echo    - DID Auth Alternative Backend: http://localhost:5001
echo    - VC-VP Demo FastAPI: http://localhost:5002
echo    - VC-VP Demo Flask: http://localhost:5003
echo    - VC-VP Demo Wallet Backend: http://localhost:5004
echo    - DID Auth Addon Frontend: http://localhost:3004
echo    - DID Auth Alternative Frontend: http://localhost:3005

echo.
echo Press any key to exit...
pause >nul 