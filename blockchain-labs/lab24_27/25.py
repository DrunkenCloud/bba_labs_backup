from web3 import Web3
import json

# Connect to Ganache
web3 = Web3(Web3.HTTPProvider("http://127.0.0.1:7545"))

# Load compiled contract
with open('./build/contracts/UserLogin.json') as f:
    artifact = json.load(f)

abi = artifact['abi']
addr = artifact['networks'][list(artifact['networks'].keys())[0]]['address']
contract = web3.eth.contract(address=addr, abi=abi)

acct = web3.eth.accounts[0]

def register(username, password):
    tx_hash = contract.functions.register(username, password).transact({'from': acct})
    web3.eth.wait_for_transaction_receipt(tx_hash)
    print("User registered.")

def login(username, password):
    result = contract.functions.login(username, password).call()
    print("Login success ✅" if result else "Login failed ❌")

# Test
register("alice", "pass123")
login("alice", "pass123")
login("alice", "wrongpass")
