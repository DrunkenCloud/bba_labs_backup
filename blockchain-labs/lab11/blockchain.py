import hashlib
import time

class Block:
    def __init__(self, data, prev_hash, difficulty=3):
        self.timestamp = time.time()
        self.data = data
        self.prev_hash = prev_hash
        self.nonce = 0
        self.difficulty = difficulty
        self.hash = self.mine_block()

    def calculate_hash(self):
        text = str(self.timestamp) + self.data + self.prev_hash + str(self.nonce)
        return hashlib.sha256(text.encode()).hexdigest()

    def mine_block(self):
        prefix = "0" * self.difficulty
        while True:
            h = self.calculate_hash()
            if h.startswith(prefix):
                return h
            self.nonce += 1

class Blockchain:
    def __init__(self, difficulty=3):
        self.chain = [Block("Genesis Block", "0", difficulty)]
        self.difficulty = difficulty

    def add_block(self, data):
        prev_hash = self.chain[-1].hash
        self.chain.append(Block(data, prev_hash, self.difficulty))

    def get_chain(self):
        return self.chain