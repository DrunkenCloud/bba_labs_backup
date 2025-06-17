# Blockchain Course Labs

This repository contains various blockchain labs and demonstrations covering different aspects of blockchain technology.

## Quick Setup

### Prerequisites
- Node.js and npm/pnpm
- Python 3.x
- Truffle Suite
- Ganache (for local blockchain development)

### Automated Setup
Run the setup script to automatically install dependencies and compile contracts:

```bash
./setup.sh
```

This script will:
- Install Python dependencies from `requirements.txt` files
- Install Node.js dependencies using pnpm (preferred) or npm
- Compile and migrate Truffle contracts where needed
- Set up all projects recursively

### Manual Setup
If you prefer to set up projects individually:

1. **Python Projects**: `pip3 install -r requirements.txt`
2. **Node.js Projects**: `pnpm install` or `npm install`
3. **Truffle Projects**: `truffle compile && truffle migrate`

## Project Structure

### blockchain-regular/
Contains the main blockchain labs with a lab manager script.

**Usage:**
```bash
cd blockchain-regular
./run_labs.sh
```

The lab manager allows you to:
- Run individual Python labs (1.py, 2.py, etc.)
- Run web-based labs (lab12, lab13, etc.)
- Run labs 24-27 with automatic Truffle compilation
- Run lab28 with automatic Truffle compilation

### Other Projects
- `did-based-secure-auth/` - DID-based authentication
- `vc-vp-demo/` - Verifiable Credentials and Presentations
- `wallet-demo/` - Wallet implementation demo
- `coin-demo/` - Cryptocurrency demo
- `public-private-key-demo/` - Key pair demonstrations
- `blockchain-demo/` - Basic blockchain implementation

## Running Individual Projects

### Web Applications
Most web applications can be started with:
```bash
cd <project-directory>
python3 app.py  # For Flask apps
npm start       # For React/Next.js apps
```

### Blockchain Applications
For Truffle-based projects:
```bash
cd <project-directory>
truffle compile
truffle migrate
python3 app.py  # If there's a Python interface
```

## Development

### Git Workflow
The repository is initialized with git and includes a comprehensive `.gitignore` file that covers:
- Node.js dependencies and build artifacts
- Python cache and virtual environments
- Truffle build outputs
- IDE and OS-specific files
- Blockchain-specific files (keystores, contracts, etc.)

### Adding New Projects
1. Create your project directory
2. Add any necessary configuration files
3. Run `./setup.sh` to automatically detect and set up the new project

## Troubleshooting

### Common Issues

1. **Truffle Migration Fails**
   - Ensure Ganache is running on the correct port
   - Check that the network configuration matches your Ganache setup

2. **Python Dependencies Missing**
   - Run `pip3 install -r requirements.txt` in the project directory
   - Ensure you're using Python 3.x

3. **Node.js Dependencies Issues**
   - Delete `node_modules/` and `package-lock.json`/`pnpm-lock.yaml`
   - Run `pnpm install` or `npm install` again

4. **Port Conflicts**
   - Check if ports are already in use
   - Modify port configurations in the respective project files

## Contributing

When adding new labs or projects:
1. Follow the existing directory structure
2. Include appropriate configuration files
3. Update this README if necessary
4. Ensure the setup script can handle your project type

## License

This project is for educational purposes. Check individual project directories for specific licensing information. 