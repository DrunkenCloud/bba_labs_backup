import hashlib

# Get user input for text to hash
text = input("Enter text to hash: ")
hashed = hashlib.sha256(text.encode()).hexdigest()

print("Text:", text)
print("SHA-256 Hash:", hashed)
