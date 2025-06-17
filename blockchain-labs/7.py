import hashlib
import time

class Block:
    def __init__(self, data, prev_hash):
        self.timestamp = time.time()
        self.data = data
        self.prev_hash = prev_hash
        self.hash = self.calculate_hash()

    def calculate_hash(self):
        block_string = str(self.timestamp) + self.data + self.prev_hash
        return hashlib.sha256(block_string.encode()).hexdigest()

genesis_block = Block("First Block", "0")

print("Genesis Block:")
print("Data:", genesis_block.data)
print("Timestamp:", genesis_block.timestamp)
print("Prev Hash:", genesis_block.prev_hash)
print("Hash:", genesis_block.hash)
