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
        target = "0" * self.difficulty
        while True:
            hash_try = self.calculate_hash()
            if hash_try.startswith(target):
                return hash_try
            self.nonce += 1

class Blockchain:
    def __init__(self, difficulty=2):
        self.difficulty = difficulty
        self.chain = [Block("Genesis Block", "0", self.difficulty)]

    def add_block(self, data):
        prev_hash = self.chain[-1].hash
        new_block = Block(data, prev_hash, self.difficulty)
        self.chain.append(new_block)

    def display(self):
        for i, block in enumerate(self.chain):
            print(f"Block {i}:")
            print("  Data:", block.data)
            print("  Hash:", block.hash)
            print("  Prev Hash:", block.prev_hash)
            print("  Nonce:", block.nonce)
            print("  Timestamp:", time.ctime(block.timestamp))
            print("-" * 40)

    def is_valid(self):
        for i in range(1, len(self.chain)):
            curr = self.chain[i]
            prev = self.chain[i - 1]
            if curr.prev_hash != prev.hash:
                return False
            if curr.hash != curr.calculate_hash():
                return False
        return True

if __name__ == "__main__":
    bc = Blockchain(difficulty=3)

    while True:
        print("\nMenu:")
        print("1. Add Block")
        print("2. Show Blockchain")
        print("3. Check Validity")
        print("4. Exit")

        choice = input("Enter choice: ")

        if choice == "1":
            data = input("Enter block data: ")
            bc.add_block(data)
            print("Block added.")
        elif choice == "2":
            bc.display()
        elif choice == "3":
            print("Blockchain valid?" , bc.is_valid())
        elif choice == "4":
            break
        else:
            print("Invalid choice.")