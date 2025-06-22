@echo off
setlocal enabledelayedexpansion

echo 🚀 Hardcoded setup for Blockchain Course Labs (Windows)...

REM Create and activate virtual environment
echo 🐍 Creating Python virtual environment...
python -m venv .venv

echo 🔧 Activating virtual environment...
call .venv\Scripts\activate.bat

REM Define directories to process
set "dirs=blockchain-demo coin-demo wallet-demo public-private-key-demo did-based-secure-auth\addon\frontend did-based-secure-auth\alternative\frontend vc-vp-demo-wallet\frontend"

REM Process each directory
for %%d in (%dirs%) do (
    if exist "%%d" (
        echo 📦 Running pnpm install in %%d...
        cd /d "%%d"
        pnpm install
        cd /d "%~dp0"
    ) else (
        echo ❌ Directory %%d does not exist, skipping.
    )
)

echo 🐍 Installing Python requirements (requirements.txt if present in root)...
if exist "requirements.txt" (
    pip install -r requirements.txt
) else (
    echo ❌ No requirements.txt found in root directory.
)

REM Compile and migrate Truffle contracts for lab24_27
echo 🔧 Compiling and migrating Truffle contracts for lab24_27...
if exist "blockchain-labs\lab24_27" (
    cd /d "blockchain-labs\lab24_27"
    where truffle >nul 2>&1
    if !errorlevel! equ 0 (
        echo 📦 Running truffle compile...
        truffle compile
        echo 🚀 Running truffle migrate...
        truffle migrate
    ) else (
        echo ❌ Truffle not found. Please install truffle first.
    )
    cd /d "%~dp0"
) else (
    echo ❌ Directory blockchain-labs\lab24_27 does not exist, skipping.
)

REM Compile and migrate Truffle contracts for lab28
echo 🔧 Compiling and migrating Truffle contracts for lab28...
if exist "blockchain-labs\lab28" (
    cd /d "blockchain-labs\lab28"
    where truffle >nul 2>&1
    if !errorlevel! equ 0 (
        echo 📦 Running truffle compile...
        truffle compile
        echo 🚀 Running truffle migrate...
        truffle migrate
    ) else (
        echo ❌ Truffle not found. Please install truffle first.
    )
    cd /d "%~dp0"
) else (
    echo ❌ Directory blockchain-labs\lab28 does not exist, skipping.
)

echo ✅ Setup complete!
echo 💡 To activate the virtual environment in the future, run: .venv\Scripts\activate.bat
pause 