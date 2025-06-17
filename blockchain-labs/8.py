import hashlib
import time

class Block:
    def __init__(self, data, prev_hash):
        self.timestamp = time.time()
        self.data = data
        self.prev_hash = prev_hash
        self.hash = self.calculate_hash()

    def calculate_hash(self):
        content = str(self.timestamp) + self.data + self.prev_hash
        return hashlib.sha256(content.encode()).hexdigest()

class Blockchain:
    def __init__(self):
        genesis = Block("Genesis Block", "0")
        self.chain = [genesis]

    def add_block(self, data):
        prev_hash = self.chain[-1].hash
        new_block = Block(data, prev_hash)
        self.chain.append(new_block)

    def is_valid(self):
        for i in range(1, len(self.chain)):
            curr = self.chain[i]
            prev = self.chain[i-1]

            if curr.hash != curr.calculate_hash():
                return False

            if curr.prev_hash != prev.hash:
                return False

        return True

    def display(self):
        for block in self.chain:
            print("Data:", block.data)
            print("Hash:", block.hash)
            print("Prev Hash:", block.prev_hash)
            print("-" * 30)

bc = Blockchain()
bc.add_block("Alice pays Bob 10 BTC")
bc.add_block("Bob pays Charlie 5 BTC")

bc.display()

print("Blockchain valid?", bc.is_valid())

bc.chain[1].data = "Alice pays Eve 1000 BTC"

print("\nAfter tampering:")
print("Blockchain valid?", bc.is_valid())
