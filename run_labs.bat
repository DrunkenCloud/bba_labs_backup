@echo off
REM Batch file to run blockchain labs with virtual environment
REM Activates .venv, changes to blockchain-labs directory, and runs run_labs.py

echo Starting Blockchain Labs with Virtual Environment...
echo.

REM Activate virtual environment and run the script
call .venv\Scripts\activate.bat
cd blockchain-labs
python run_labs.py %*

REM Pause to see any error messages
if errorlevel 1 (
    echo.
    echo An error occurred. Press any key to exit...
    pause >nul
) 