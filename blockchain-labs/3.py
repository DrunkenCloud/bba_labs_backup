p = 3
q = 11
n = p * q
phi = (p - 1) * (q - 1)
e = 7
d = 3

message = 5 # alphabet e as its 5th alphabet
encrypted = (message ** e) % n
decrypted = (encrypted ** d) % n

print("Original:", message)
print("Encrypted:", encrypted)
print("Decrypted:", decrypted)
