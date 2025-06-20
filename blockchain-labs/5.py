from Crypto.Signature import pkcs1_15
from Crypto.Hash import SHA256
from Crypto.PublicKey import RSA

key = RSA.generate(2048)
public_key = key.publickey()

message = b"Sign me!"
hash = SHA256.new(message)

signature = pkcs1_15.new(key).sign(hash)
print(signature)
try:
    pkcs1_15.new(public_key).verify(hash, signature)
    print("Signature verified!")
except (ValueError, TypeError):
    print("Verification failed!")
