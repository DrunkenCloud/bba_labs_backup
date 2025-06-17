#!/bin/bash

echo "🚀 Setting up Blockchain Course Labs..."

# Function to run truffle commands in a directory
run_truffle_setup() {
    local dir=$1
    if [ -d "$dir" ]; then
        echo "📦 Setting up Truffle in $dir..."
        cd "$dir" || return
        
        # Check if truffle-config.js exists
        if [ -f "truffle-config.js" ] || [ -f "truffle.js" ]; then
            echo "  🔧 Compiling contracts..."
            truffle compile
            
            echo "  🚀 Migrating contracts..."
            truffle migrate --reset
        fi
        
        cd ..
    fi
}

# Function to run pnpm install in a directory
run_pnpm_setup() {
    local dir=$1
    if [ -d "$dir" ]; then
        echo "📦 Installing dependencies in $dir..."
        cd "$dir" || return
        
        # Check if package.json exists
        if [ -f "package.json" ]; then
            echo "  📥 Running pnpm install..."
            pnpm install
        fi
        
        cd ..
    fi
}

# Function to run npm install in a directory
run_npm_setup() {
    local dir=$1
    if [ -d "$dir" ]; then
        echo "📦 Installing dependencies in $dir..."
        cd "$dir" || return
        
        # Check if package.json exists
        if [ -f "package.json" ]; then
            echo "  📥 Running npm install..."
            npm install
        fi
        
        cd ..
    fi
}

# Function to setup Python dependencies
run_python_setup() {
    local dir=$1
    if [ -d "$dir" ]; then
        echo "🐍 Setting up Python dependencies in $dir..."
        cd "$dir" || return
        
        # Check if requirements.txt exists
        if [ -f "requirements.txt" ]; then
            echo "  📥 Installing Python requirements..."
            pip3 install -r requirements.txt
        fi
        
        cd ..
    fi
}

# Main setup process
echo "🔍 Scanning directories for setup..."

# Setup blockchain-regular
if [ -d "blockchain-regular" ]; then
    echo "📁 Setting up blockchain-regular..."
    run_python_setup "blockchain-regular"
    
    # Setup specific lab directories that need truffle
    run_truffle_setup "blockchain-regular/lab24_27"
    run_truffle_setup "blockchain-regular/lab28"
fi

# Setup other directories
for dir in */; do
    if [ -d "$dir" ]; then
        dir_name=${dir%/}
        
        # Skip blockchain-regular as it's handled above
        if [ "$dir_name" = "blockchain-regular" ]; then
            continue
        fi
        
        echo "📁 Setting up $dir_name..."
        
        # Check for package.json and run appropriate package manager
        if [ -f "$dir/package.json" ]; then
            # Check if pnpm-lock.yaml exists (prefer pnpm)
            if [ -f "$dir/pnpm-lock.yaml" ]; then
                run_pnpm_setup "$dir"
            else
                run_npm_setup "$dir"
            fi
        fi
        
        # Check for truffle config
        if [ -f "$dir/truffle-config.js" ] || [ -f "$dir/truffle.js" ]; then
            run_truffle_setup "$dir"
        fi
        
        # Check for Python requirements
        if [ -f "$dir/requirements.txt" ]; then
            run_python_setup "$dir"
        fi
        
        # Recursively check subdirectories
        for subdir in "$dir"*/; do
            if [ -d "$subdir" ]; then
                subdir_name=${subdir%/}
                echo "  📁 Checking subdirectory $subdir_name..."
                
                if [ -f "$subdir/package.json" ]; then
                    if [ -f "$subdir/pnpm-lock.yaml" ]; then
                        run_pnpm_setup "$subdir"
                    else
                        run_npm_setup "$subdir"
                    fi
                fi
                
                if [ -f "$subdir/truffle-config.js" ] || [ -f "$subdir/truffle.js" ]; then
                    run_truffle_setup "$subdir"
                fi
                
                if [ -f "$subdir/requirements.txt" ]; then
                    run_python_setup "$subdir"
                fi
            fi
        done
    fi
done

echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "  1. Start Ganache or your preferred blockchain network"
echo "  2. Run './blockchain-regular/run_labs.sh' to start the lab manager"
echo "  3. Or navigate to specific directories to run individual projects"
echo ""
echo "📝 Note: Some projects may require additional setup steps. Check individual README files for specific instructions."