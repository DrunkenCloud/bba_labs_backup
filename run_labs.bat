@echo off
REM Activate and run the Python script

echo Starting Blockchain Labs with Virtual Environment...
call .venv\Scripts\activate.bat
cd blockchain-labs
python run_labs.py %*
set EXITCODE=%ERRORLEVEL%

REM Only treat exit codes 2 or above as "real" errors
if %EXITCODE% GEQ 2 (
    echo.
    echo ❌ An error occurred. Exit code: %EXITCODE%
    pause >nul
)