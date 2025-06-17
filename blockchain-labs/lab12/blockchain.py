import hashlib
import time
import copy

class Block:
    def __init__(self, data, prev_hash, difficulty=2):
        self.timestamp = time.time()
        self.data = data
        self.prev_hash = prev_hash
        self.nonce = 0
        self.difficulty = difficulty
        self.hash = self.mine()

    def calculate_hash(self):
        text = f"{self.timestamp}{self.data}{self.prev_hash}{self.nonce}"
        return hashlib.sha256(text.encode()).hexdigest()

    def mine(self):
        prefix = "0" * self.difficulty
        while True:
            h = self.calculate_hash()
            if h.startswith(prefix):
                return h
            self.nonce += 1

class Blockchain:
    def __init__(self, difficulty=2):
        self.difficulty = difficulty
        self.chain = [Block("Genesis Block", "0", difficulty)]

    def add_block(self, data):
        prev_hash = self.chain[-1].hash
        self.chain.append(Block(data, prev_hash, self.difficulty))

    def tamper_block(self, index, new_data):
        if 0 <= index < len(self.chain):
            self.chain[index].data = new_data  # Tamper!
            self.chain[index].hash = self.chain[index].calculate_hash()

    def is_valid(self):
        for i in range(1, len(self.chain)):
            if self.chain[i].prev_hash != self.chain[i-1].hash:
                return False
            if self.chain[i].hash != self.chain[i].calculate_hash():
                return False
        return True

    def sync_from(self, other_chain):
        # Deep copy so objects aren't shared
        self.chain = copy.deepcopy(other_chain)
