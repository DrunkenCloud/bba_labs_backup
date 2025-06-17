#!/bin/bash

# Function to print a separator line
print_separator() {
    echo "================================================================================"
}

# Function to print a section header
print_header() {
    echo ""
    print_separator
    echo "  $1"
    print_separator
}

# Function to print a subsection
print_subsection() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  $1"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Function to list all available labs
list_labs() {
    print_header "BLOCKCHAIN LABS - AVAILABLE OPTIONS"
    echo ""
    echo "📁 Python Files:"
    echo "────────────────────────────────────────────────────────────────────────────────"
    # List Python files
    for file in *.py; do
        if [ -f "$file" ]; then
            echo "  • ${file%.py}"
        fi
    done
    
    echo ""
    echo "📂 Lab Directories:"
    echo "────────────────────────────────────────────────────────────────────────────────"
    # List lab directories
    for dir in lab*; do
        if [ -d "$dir" ]; then
            echo "  • $dir"
        fi
    done
    print_separator
}

# Function to run a Python file
run_python_lab() {
    local lab_num=$1
    print_subsection "RUNNING PYTHON LAB: ${lab_num}"
    echo "Executing: python3 ${lab_num}.py"
    echo ""
    python3 "${lab_num}.py"
}

# Function to run a lab directory
run_lab_directory() {
    local lab_dir=$1
    print_subsection "RUNNING LAB DIRECTORY: ${lab_dir}"
    cd "$lab_dir" || exit

    # Check if it's a React app
    if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
        echo "🚀 Starting React frontend..."
        cd frontend
        npm start &
        cd ..
        echo "✅ React frontend started in background"
    fi

    # Check if it's a Python web server
    if [ -f "app.py" ]; then
        echo "🐍 Starting Python web server..."
        python3 app.py &
        echo "✅ Python web server started in background"
    fi

    cd ..
}

# Function to run lab24_27 specific labs
run_lab24_27() {
    local lab_num=$1
    print_subsection "RUNNING LAB24_27: ${lab_num}"
    cd lab24_27 || exit
    
    # Check if build/contracts folder exists, if not run truffle commands
    if [ ! -d "build/contracts" ]; then
        echo "🔨 Compiling and migrating contracts..."
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        truffle compile
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        truffle migrate
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    fi
    
    # Run the specific Python file
    if [ -f "${lab_num}.py" ]; then
        echo "🐍 Running lab ${lab_num}..."
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        python3 "${lab_num}.py"
    else
        echo "❌ Lab ${lab_num}.py not found in lab24_27 directory"
    fi
    
    cd ..
}

# Function to run lab28
run_lab28() {
    print_subsection "RUNNING LAB28"
    cd lab28 || exit
    
    # Check if build/contracts folder exists, if not run truffle commands
    if [ ! -d "build/contracts" ]; then
        echo "🔨 Compiling and migrating contracts..."
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        truffle compile
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        truffle migrate
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    fi
    
    # Run the Flask app
    echo "🐍 Starting lab28 Flask app..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    python3 app.py
    
    cd ..
}

# Function to stop all running processes
stop_labs() {
    print_subsection "STOPPING ALL LAB PROCESSES"
    echo "🛑 Stopping all lab processes..."
    pkill -f "python3.*\.py"
    pkill -f "npm start"
    echo "✅ All lab processes stopped"
}

# Show labs list only once at the beginning
list_labs

# Main loop
while true; do
    print_subsection "LAB SELECTION"
    echo "Enter lab number to run (or 'q' to quit):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    read -r choice

    if [ "$choice" = "q" ]; then
        print_subsection "EXITING"
        stop_labs
        echo "👋 Goodbye!"
        print_separator
        exit 0
    fi

    # Stop any running labs
    stop_labs

    # Check if it's a Python file
    if [ -f "${choice}.py" ]; then
        run_python_lab "$choice"
    # Check if it's lab24_27 (labs 24-27)
    elif [ "$choice" -ge 24 ] && [ "$choice" -le 27 ]; then
        run_lab24_27 "$choice"
    # Check if it's a lab directory
    elif [ -d "lab${choice}" ]; then
        run_lab_directory "lab${choice}"
    # Check if it's lab28
    elif [ "$choice" = "28" ]; then
        run_lab28
    else
        print_subsection "ERROR"
        echo "❌ Invalid lab number. Please try again."
    fi

    print_subsection "CONTINUE"
    echo "Press Enter to continue to main menu..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    read -r
done 