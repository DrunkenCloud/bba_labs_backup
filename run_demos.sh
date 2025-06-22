#!/bin/bash
# Shell script to run all demo labs with virtual environment activation
# This script activates .venv and runs various demo labs

echo "🚀 Starting Demo Labs with Virtual Environment..."
echo

# Activate virtual environment
source .venv/bin/activate

# Function to run a demo with error handling
run_demo() {
    local demo_name="$1"
    local demo_path="$2"
    local command="$3"
    
    echo "🔧 Starting $demo_name..."
    if [ -d "$demo_path" ]; then
        cd "$demo_path"
        echo "📦 Running: $command"
        eval "$command" &
        local pid=$!
        echo "✅ $demo_name started with PID: $pid"
        cd - > /dev/null
        return 0
    else
        echo "❌ Directory $demo_path does not exist, skipping $demo_name."
        return 1
    fi
}

# Start all demos
echo "Starting all demo labs..."
echo "=" * 60

# Node.js/Express demos
run_demo "Blockchain Demo" "blockchain-demo" "pnpm start"
run_demo "Coin Demo" "coin-demo" "pnpm run dev"
run_demo "Wallet Demo" "wallet-demo" "pnpm run dev"
run_demo "Public-Private Key Demo" "public-private-key-demo" "pnpm start"

# Python Flask demos
run_demo "DID Auth Addon Backend" "did-based-secure-auth/addon" "python app.py"
run_demo "DID Auth Alternative Backend" "did-based-secure-auth/alternative" "python app.py"
run_demo "VC-VP Demo Wallet Backend" "vc-vp-demo-wallet" "python app.py"
run_demo "VC-VP Demo FastAPI" "vc-vp-demo" "python app.py"
run_demo "VC-VP Demo Flask" "vc-vp-demo" "python flask_app.py"

# React Frontends for DID Auth
run_demo "DID Auth Addon Frontend" "did-based-secure-auth/addon/frontend" "PORT=3004 pnpm start"
run_demo "DID Auth Alternative Frontend" "did-based-secure-auth/alternative/frontend" "PORT=3005 pnpm start"

echo
echo "🎉 All demo labs started!"
echo "📋 Running processes:"
ps aux | grep -E "(node|python|pnpm)" | grep -v grep

echo
echo "💡 To stop all demos, press Ctrl+C or run: pkill -f 'node|python.*app.py'"
echo "🔗 Access the demos at:"
echo "   - Blockchain Demo: http://localhost:3000"
echo "   - Coin Demo: http://localhost:3001"
echo "   - Wallet Demo: http://localhost:3002"
echo "   - Public-Private Key Demo: http://localhost:3003"
echo "   - DID Auth Addon Backend: http://localhost:5000"
echo "   - DID Auth Alternative Backend: http://localhost:5001"
echo "   - VC-VP Demo FastAPI: http://localhost:5002"
echo "   - VC-VP Demo Flask: http://localhost:5003"
echo "   - VC-VP Demo Wallet Backend: http://localhost:5004"
echo "   - DID Auth Addon Frontend: http://localhost:3004"
echo "   - DID Auth Alternative Frontend: http://localhost:3005"

# Wait for user to stop
echo
echo "Press Ctrl+C to stop all demos..."
wait 