import hashlib
import os

# Get user input for file path
filepath = input("Enter file path to hash: ")

# Check if file exists
if not os.path.exists(filepath):
    print(f"Error: File '{filepath}' does not exist.")
    exit(1)

with open(filepath, "rb") as f:
    bytes = f.read()
    file_hash = hashlib.sha256(bytes).hexdigest()

print("File Hash (SHA-256):", file_hash)
