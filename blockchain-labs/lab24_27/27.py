import hashlib
from web3 import Web3
import json

web3 = Web3(Web3.HTTPProvider("http://127.0.0.1:7545"))

with open('./build/contracts/SecureLogin.json') as f:
    artifact = json.load(f)

abi = artifact['abi']
addr = artifact['networks'][list(artifact['networks'].keys())[0]]['address']
contract = web3.eth.contract(address=addr, abi=abi)
acct = web3.eth.accounts[0]

user_db = {}

def h(s):
    return Web3.keccak(text=s)

def register(username, password, data):
    tx_hash = contract.functions.register(h(username), h(password)).transact({'from': acct})
    web3.eth.wait_for_transaction_receipt(tx_hash)
    user_db[username] = data
    print("User registered and stored off-chain.")

def login(username, password):
    if contract.functions.login(h(username), h(password)).call():
        print("✅ Login success! Off-chain data:", user_db.get(username))
    else:
        print("❌ Login failed.")

# Test
register("nina", "qwerty", {"email": "nina@example.com", "role": "admin"})
login("nina", "qwerty")
login("nina", "wrong")
