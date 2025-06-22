#!/bin/bash
# Shell script to run blockchain labs with virtual environment
# Activates .venv, changes to blockchain-labs directory, and runs run_labs.py

echo "Starting Blockchain Labs with Virtual Environment..."
echo

# Activate virtual environment and run the script
source .venv/bin/activate
cd blockchain-labs
python run_labs.py "$@"

# Check for errors
if [ $? -ne 0 ]; then
    echo
    echo "An error occurred. Press Enter to exit..."
    read
fi 