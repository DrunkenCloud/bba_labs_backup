#!/bin/bash

# Function to list all available labs
list_labs() {
    echo "Available Labs:"
    echo "---------------"
    # List Python files
    for file in *.py; do
        if [ -f "$file" ]; then
            echo "${file%.py}"
        fi
    done
    # List lab directories
    for dir in lab*; do
        if [ -d "$dir" ]; then
            echo "$dir"
        fi
    done
    echo "---------------"
}

# Function to run a Python file
run_python_lab() {
    local lab_num=$1
    python3 "${lab_num}.py"
}

# Function to run a lab directory
run_lab_directory() {
    local lab_dir=$1
    cd "$lab_dir" || exit

    # Check if it's a React app
    if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
        echo "Starting React frontend..."
        cd frontend
        npm start &
        cd ..
    fi

    # Check if it's a Python web server
    if [ -f "app.py" ]; then
        echo "Starting Python web server..."
        python3 app.py &
    fi

    cd ..
}

# Function to run lab24_27 specific labs
run_lab24_27() {
    local lab_num=$1
    cd lab24_27 || exit
    
    # Check if build/contracts folder exists, if not run truffle commands
    if [ ! -d "build/contracts" ]; then
        echo "Compiling and migrating contracts..."
        truffle compile
        truffle migrate
    fi
    
    # Run the specific Python file
    if [ -f "${lab_num}.py" ]; then
        echo "Running lab ${lab_num}..."
        python3 "${lab_num}.py"
    else
        echo "Lab ${lab_num}.py not found in lab24_27 directory"
    fi
    
    cd ..
}

# Function to run lab28
run_lab28() {
    cd lab28 || exit
    
    # Check if build/contracts folder exists, if not run truffle commands
    if [ ! -d "build/contracts" ]; then
        echo "Compiling and migrating contracts..."
        truffle compile
        truffle migrate
    fi
    
    # Run the Flask app
    echo "Starting lab28 Flask app..."
    python3 app.py
    
    cd ..
}

# Function to stop all running processes
stop_labs() {
    echo "Stopping all lab processes..."
    pkill -f "python3.*\.py"
    pkill -f "npm start"
}

# Show labs list only once at the beginning
list_labs

# Main loop
while true; do
    echo "Enter lab number to run (or 'q' to quit):"
    read -r choice

    if [ "$choice" = "q" ]; then
        stop_labs
        echo "Goodbye!"
        exit 0
    fi

    # Stop any running labs
    stop_labs

    # Check if it's a Python file
    if [ -f "${choice}.py" ]; then
        echo "Running Python lab ${choice}..."
        run_python_lab "$choice"
    # Check if it's lab24_27 (labs 24-27)
    elif [ "$choice" -ge 24 ] && [ "$choice" -le 27 ]; then
        echo "Running lab ${choice} from lab24_27..."
        run_lab24_27 "$choice"
    # Check if it's a lab directory
    elif [ -d "lab${choice}" ]; then
        echo "Running lab directory lab${choice}..."
        run_lab_directory "lab${choice}"
    # Check if it's lab28
    elif [ "$choice" = "28" ]; then
        echo "Running lab28..."
        run_lab28
    else
        echo "Invalid lab number. Please try again."
    fi

    echo "Press Enter to continue..."
    read -r
done 