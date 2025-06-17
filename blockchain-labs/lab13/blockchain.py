import hashlib, time, copy

class Block:
    def __init__(self, data, prev_hash):
        self.timestamp = time.time()
        self.data = data
        self.prev_hash = prev_hash
        self.nonce = 0
        self.hash = self.hash_self()

    def hash_self(self):
        sha = hashlib.sha256()
        sha.update(f"{self.timestamp}{self.data}{self.prev_hash}{self.nonce}".encode())
        return sha.hexdigest()

    def mine(self, difficulty):
        while not self.hash.startswith("0" * difficulty):
            self.nonce += 1
            self.hash = self.hash_self()

    def to_dict(self):
        return {
            "timestamp": self.timestamp,
            "data": self.data,
            "prev_hash": self.prev_hash,
            "nonce": self.nonce,
            "hash": self.hash
        }

    def __eq__(self, other):
        return self.to_dict() == other.to_dict()

class Blockchain:
    def __init__(self, difficulty=2):
        self.difficulty = difficulty
        self.chain = [self.create_genesis()]

    def create_genesis(self):
        b = Block("Genesis", "0")
        b.mine(self.difficulty)
        return b

    def add_block(self, data):
        last_hash = self.chain[-1].hash
        new_block = Block(data, last_hash)
        new_block.mine(self.difficulty)
        self.chain.append(new_block)

    def tamper_block(self, index, new_data):
        if 0 <= index < len(self.chain):
            self.chain[index].data = new_data
            for i in range(index, len(self.chain)):
                if i == 0:
                    self.chain[i].prev_hash = "0"
                else:
                    self.chain[i].prev_hash = self.chain[i - 1].hash
                self.chain[i].hash = self.chain[i].hash_self()
                self.chain[i].mine(self.difficulty)

    def sync_from(self, chain):
        self.chain = copy.deepcopy(chain)

    def to_hash_list(self):
        return [block.hash for block in self.chain]
