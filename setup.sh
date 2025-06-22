#!/bin/bash

echo "🚀 Hardcoded setup for Blockchain Course Labs..."

# Create and activate virtual environment
echo "🐍 Creating Python virtual environment..."
python3 -m venv .venv

echo "🔧 Activating virtual environment..."
source .venv/bin/activate

dirs=(
  "blockchain-demo"
  "coin-demo"
  "wallet-demo"
  "public-private-key-demo"
  "did-based-secure-auth/addon/frontend"
  "did-based-secure-auth/alternative/frontend"
  "vc-vp-demo-wallet/frontend"
)

for dir in "${dirs[@]}"; do
  if [ -d "$dir" ]; then
    echo "📦 Running pnpm install in $dir..."
    cd "$dir"
    pnpm install
    cd - > /dev/null
  else
    echo "❌ Directory $dir does not exist, skipping."
  fi
done

echo "🐍 Installing Python requirements (requirements.txt if present in root)..."
if [ -f requirements.txt ]; then
  pip install -r requirements.txt
else
  echo "❌ No requirements.txt found in root directory."
fi

# Compile and migrate Truffle contracts for lab24_27
echo "🔧 Compiling and migrating Truffle contracts for lab24_27..."
if [ -d "blockchain-labs/lab24_27" ]; then
  cd blockchain-labs/lab24_27
  if command -v truffle &> /dev/null; then
    echo "📦 Running truffle compile..."
    truffle compile
    echo "🚀 Running truffle migrate..."
    truffle migrate
  else
    echo "❌ Truffle not found. Please install truffle first."
  fi
  cd - > /dev/null
else
  echo "❌ Directory blockchain-labs/lab24_27 does not exist, skipping."
fi

# Compile and migrate Truffle contracts for lab28
echo "🔧 Compiling and migrating Truffle contracts for lab28..."
if [ -d "blockchain-labs/lab28" ]; then
  cd blockchain-labs/lab28
  if command -v truffle &> /dev/null; then
    echo "📦 Running truffle compile..."
    truffle compile
    echo "🚀 Running truffle migrate..."
    truffle migrate
  else
    echo "❌ Truffle not found. Please install truffle first."
  fi
  cd - > /dev/null
else
  echo "❌ Directory blockchain-labs/lab28 does not exist, skipping."
fi

echo "✅ Setup complete!"
