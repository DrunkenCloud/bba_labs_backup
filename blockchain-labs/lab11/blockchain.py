import hashlib
import time
import json

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

    def to_dict(self):
        """Convert block to dictionary for serialization"""
        return {
            'timestamp': self.timestamp,
            'data': self.data,
            'prev_hash': self.prev_hash,
            'nonce': self.nonce,
            'difficulty': self.difficulty,
            'hash': self.hash
        }

    @classmethod
    def from_dict(cls, data):
        """Create block from dictionary"""
        block = cls.__new__(cls)
        block.timestamp = data['timestamp']
        block.data = data['data']
        block.prev_hash = data['prev_hash']
        block.nonce = data['nonce']
        block.difficulty = data['difficulty']
        block.hash = data['hash']
        return block

class Blockchain:
    def __init__(self, difficulty=3):
        self.chain = [Block("Genesis Block", "0", difficulty)]
        self.difficulty = difficulty

    def add_block(self, data):
        prev_hash = self.chain[-1].hash
        self.chain.append(Block(data, prev_hash, self.difficulty))

    def reset_chain(self, new_difficulty):
        """Reset the blockchain with a new difficulty and clear all blocks except genesis"""
        self.difficulty = new_difficulty
        self.chain = [Block("Genesis Block", "0", new_difficulty)]

    def get_chain(self):
        return self.chain

    def to_dict(self):
        """Convert blockchain to dictionary for session storage"""
        return {
            'difficulty': self.difficulty,
            'chain': [block.to_dict() for block in self.chain]
        }

    @classmethod
    def from_dict(cls, data):
        """Create blockchain from dictionary"""
        blockchain = cls.__new__(cls)
        blockchain.difficulty = data['difficulty']
        blockchain.chain = [Block.from_dict(block_data) for block_data in data['chain']]
        return blockchain