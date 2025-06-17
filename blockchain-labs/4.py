from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP

key = RSA.generate(2048)
public_key = key.publickey()

print(public_key.export_key().decode('utf-8'))
print(key.export_key().decode("utf-8"))

cipher = PKCS1_OAEP.new(public_key)
message = b"Hello RSA!"
ciphertext = cipher.encrypt(message)

decipher = PKCS1_OAEP.new(key)
plaintext = decipher.decrypt(ciphertext)

print("Encrypted:", ciphertext)
print("Decrypted:", plaintext.decode())
