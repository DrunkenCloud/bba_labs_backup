@echo off
setlocal enabledelayedexpansion

REM Function to print a separator line
:print_separator
echo ================================================================================
goto :eof

REM Function to print a section header
:print_header
echo.
call :print_separator
echo   %~1
call :print_separator
goto :eof

REM Function to print a subsection
:print_subsection
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo   %~1
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
goto :eof

REM Function to list all available labs
:list_labs
call :print_header "BLOCKCHAIN LABS - AVAILABLE OPTIONS"
echo.
echo 📁 Python Files:
echo ────────────────────────────────────────────────────────────────────────────────
REM List Python files
for %%f in (*.py) do (
    if exist "%%f" (
        echo   • %%~nf
    )
)

echo.
echo 📂 Lab Directories:
echo ────────────────────────────────────────────────────────────────────────────────
REM List lab directories
for /d %%d in (lab*) do (
    if exist "%%d" (
        echo   • %%d
    )
)
call :print_separator
goto :eof

REM Function to run a Python file
:run_python_lab
call :print_subsection "RUNNING PYTHON LAB: %~1"
echo Executing: python %~1.py
echo.
python "%~1.py"
goto :eof

REM Function to run a lab directory
:run_lab_directory
call :print_subsection "RUNNING LAB DIRECTORY: %~1"
cd /d "%~1" 2>nul || exit /b 1

REM Check if it's a React app
if exist "frontend\package.json" (
    echo 🚀 Starting React frontend...
    cd frontend
    start /b npm start
    cd ..
    echo ✅ React frontend started in background
)

REM Check if it's a Python web server
if exist "app.py" (
    echo 🐍 Starting Python web server...
    start /b python app.py
    echo ✅ Python web server started in background
)

cd ..
goto :eof

REM Function to run lab24_27 specific labs
:run_lab24_27
call :print_subsection "RUNNING LAB24_27: %~1"
cd /d "lab24_27" 2>nul || exit /b 1

REM Check if build/contracts folder exists, if not run truffle commands
if not exist "build\contracts" (
    echo 🔨 Compiling and migrating contracts...
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    truffle compile
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    truffle migrate
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
)

REM Run the specific Python file
if exist "%~1.py" (
    echo 🐍 Running lab %~1...
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    python "%~1.py"
) else (
    echo ❌ Lab %~1.py not found in lab24_27 directory
)

cd ..
goto :eof

REM Function to run lab28
:run_lab28
call :print_subsection "RUNNING LAB28"
cd /d "lab28" 2>nul || exit /b 1

REM Check if build/contracts folder exists, if not run truffle commands
if not exist "build\contracts" (
    echo 🔨 Compiling and migrating contracts...
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    truffle compile
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    truffle migrate
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
)

REM Run the Flask app
echo 🐍 Starting lab28 Flask app...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
python app.py

cd ..
goto :eof

REM Function to stop all running processes
:stop_labs
call :print_subsection "STOPPING ALL LAB PROCESSES"
echo 🛑 Stopping all lab processes...
taskkill /f /im python.exe 2>nul
taskkill /f /im node.exe 2>nul
echo ✅ All lab processes stopped
goto :eof

REM Main script starts here
echo 🚀 Blockchain Labs Runner for Windows
echo.

REM Show labs list only once at the beginning
call :list_labs

REM Main loop
:main_loop
call :print_subsection "LAB SELECTION"
echo Enter lab number to run (or 'q' to quit):
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
set /p choice="> "

if /i "%choice%"=="q" (
    call :print_subsection "EXITING"
    call :stop_labs
    echo 👋 Goodbye!
    call :print_separator
    pause
    exit /b 0
)

REM Stop any running labs
call :stop_labs

REM Check if it's a Python file
if exist "%choice%.py" (
    call :run_python_lab "%choice%"
) else if %choice% geq 24 if %choice% leq 27 (
    REM Check if it's lab24_27 (labs 24-27)
    call :run_lab24_27 "%choice%"
) else if exist "lab%choice%" (
    REM Check if it's a lab directory
    call :run_lab_directory "lab%choice%"
) else if "%choice%"=="28" (
    REM Check if it's lab28
    call :run_lab28
) else (
    call :print_subsection "ERROR"
    echo ❌ Invalid lab number. Please try again.
)

call :print_subsection "CONTINUE"
echo Press Enter to continue to main menu...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
pause >nul
goto main_loop 