from web3 import Web3
import json

web3 = Web3(Web3.HTTPProvider("http://127.0.0.1:7545"))
assert web3.is_connected(), "Web3 is not connected"

with open('./build/contracts/HelloWorld.json') as f:
    artifact = json.load(f)

abi = artifact['abi']
networks = artifact['networks']
if not networks:
    raise Exception("No networks found in artifact")

network_id = list(networks.keys())[0]
contract_address = networks[network_id]['address']

contract = web3.eth.contract(address=contract_address, abi=abi)

print("Greeting from blockchain:", contract.functions.greet().call())
