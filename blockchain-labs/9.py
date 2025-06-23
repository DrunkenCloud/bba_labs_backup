import hashlib
import time

class Block:
    def __init__(self, data, prev_hash, difficulty=2):
        self.timestamp = time.time()
        self.data = data
        self.prev_hash = prev_hash
        self.nonce = 0
        self.difficulty = difficulty
        self.hash = self.mine_block()

    def calculate_hash(self):
        content = str(self.timestamp) + self.data + self.prev_hash + str(self.nonce)
        return hashlib.sha256(content.encode()).hexdigest()

    def mine_block(self):
        print(f"⛏️ Mining block with data: '{self.data}'...")
        target = "0" * self.difficulty
        while True:
            hash_attempt = self.calculate_hash()
            if hash_attempt.startswith(target):
                print(f"✅ Block mined with nonce: {self.nonce}")
                return hash_attempt
            self.nonce += 1

genesis = Block("Genesis Block", "0", difficulty=4)
print("Genesis Hash:", genesis.hash)
