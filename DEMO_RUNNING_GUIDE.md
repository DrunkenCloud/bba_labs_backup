# Demo Running Guide

This guide provides instructions for running and compiling each demo in the repository.

## Prerequisites

### General Requirements
- **Node.js** (v18 or higher recommended)
- **Python** (3.8 or higher)
- **pnpm** (recommended) or **npm**
- **Git**

### Python Dependencies
Install the required Python packages:
```bash
pip install -r requirements.txt
```

## Demo Instructions

### 1. Blockchain Demo (`blockchain-demo/`)

A web-based demonstration of blockchain concepts.

**Setup:**
```bash
cd blockchain-demo
npm install
# or
pnpm install
```

**Run:**
```bash
npm start
# or
pnpm start
```

**Access:** http://localhost:3000

**Docker Alternative:**
```bash
docker-compose up
```

---

### 2. Coin Demo (`coin-demo/`)

A Next.js-based cryptocurrency demo application.

**Setup:**
```bash
cd coin-demo
npm install
# or
pnpm install
```

**Development Mode:**
```bash
npm run dev
# or
pnpm dev
```

**Production Build:**
```bash
npm run build
npm start
# or
pnpm build
pnpm start
```

**Access:** http://localhost:3000

---

### 3. Public-Private Key Demo (`public-private-key-demo/`)

A web-based demonstration of public/private key concepts.

**Setup:**
```bash
cd public-private-key-demo
npm install
# or
pnpm install
```

**Run:**
```bash
npm start
# or
pnpm start
```

**Access:** http://localhost:3000

**Docker Alternative:**
```bash
docker build -t public-private-key-demo .
docker run -p 3000:3000 public-private-key-demo
```

---

### 4. VC-VP Demo (`vc-vp-demo/`)

A FastAPI-based Verifiable Credentials and Presentations demo.

**Setup:**
```bash
cd vc-vp-demo
# Ensure Python dependencies are installed from root requirements.txt
```

**Run:**
```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

**Access:** http://localhost:8000

**API Documentation:** http://localhost:8000/docs

---

### 5. VC-VP Wallet Demo (`vc-vp-demo-wallet/`)

A full-stack demo with FastAPI backend and React frontend for VC/VP wallet functionality.

**Backend Setup:**
```bash
cd vc-vp-demo-wallet
# Ensure Python dependencies are installed from root requirements.txt
```

**Backend Run:**
```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

**Frontend Setup:**
```bash
cd vc-vp-demo-wallet/frontend
npm install
# or
pnpm install
```

**Frontend Run:**
```bash
npm start
# or
pnpm start
```

**Access:**
- Backend API: http://localhost:8000
- Frontend: http://localhost:3000

---

### 6. Wallet Demo (`wallet-demo/`)

A Next.js-based cryptocurrency wallet demo.

**Setup:**
```bash
cd wallet-demo
npm install
# or
pnpm install
```

**Development Mode:**
```bash
npm run dev
# or
pnpm dev
```

**Production Build:**
```bash
npm run build
npm start
# or
pnpm build
pnpm start
```

**Access:** http://localhost:3000

---

### 7. DID-Based Secure Auth (`did-based-secure-auth/`)

A secure authentication system using DIDs and Verifiable Credentials.

#### Addon Version (`did-based-secure-auth/addon/`)

**Backend Setup:**
```bash
cd did-based-secure-auth/addon
# Ensure Python dependencies are installed from root requirements.txt
```

**Backend Run:**
```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

**Frontend Setup:**
```bash
cd did-based-secure-auth/addon/frontend
npm install
# or
pnpm install
```

**Frontend Run:**
```bash
npm start
# or
pnpm start
```

**Access:**
- Backend API: http://localhost:8000
- Frontend: http://localhost:3000

#### Alternative Version (`did-based-secure-auth/alternative/`)

**Backend Setup:**
```bash
cd did-based-secure-auth/alternative
# Ensure Python dependencies are installed from root requirements.txt
```

**Backend Run:**
```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8001
```

**Frontend Setup:**
```bash
cd did-based-secure-auth/alternative/frontend
npm install
# or
pnpm install
```

**Frontend Run:**
```bash
npm start
# or
pnpm start
```

**Access:**
- Backend API: http://localhost:8001
- Frontend: http://localhost:3000

---

## Port Summary

| Demo | Backend Port | Frontend Port | Notes |
|------|-------------|---------------|-------|
| blockchain-demo | 3000 | - | Express.js app |
| coin-demo | - | 3000 | Next.js app |
| public-private-key-demo | 3000 | - | Express.js app |
| vc-vp-demo | 8000 | - | FastAPI app |
| vc-vp-demo-wallet | 8000 | 3000 | FastAPI + React |
| wallet-demo | - | 3000 | Next.js app |
| did-based-secure-auth/addon | 8000 | 3000 | FastAPI + React |
| did-based-secure-auth/alternative | 8001 | 3000 | FastAPI + React |

## Troubleshooting

### Common Issues

1. **Port Conflicts**: If a port is already in use, change the port in the respective configuration files or kill the process using that port.

2. **Python Dependencies**: Ensure all Python dependencies are installed:
   ```bash
   pip install -r requirements.txt
   ```

3. **Node.js Dependencies**: If you encounter module not found errors, try:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **DIDKit Issues**: The Python demos use DIDKit for cryptographic operations. Ensure it's properly installed via the requirements.txt.

### Environment Setup

For the best experience, consider using a virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### Running Multiple Demos

To run multiple demos simultaneously, ensure they use different ports. The table above shows the default ports for each demo. 