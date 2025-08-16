# The purpose of this script is to generate the public keys (n, e)
# and the ciphertext for a simple RSA CTF challenge.
# The flag is encrypted with the provided p, q, and a common public exponent e.

# --- Given Values ---
# Prime numbers p and q. These are typically kept secret.
p = 1955175890537890492055221842734816092141
q = 670577792467509699665091201633524389157003

# Public exponent e. This is part of the public key.
e = 65537

# The plaintext flag to be encrypted.
# This will be the secret the user needs to find.
plaintext_flag = "flag{smal1_N_n0_g0od}"

# --- RSA Key Generation and Encryption ---

# 1. Calculate the modulus n. This is the product of p and q.
# n is the other part of the public key.
# In this challenge, n is intentionally small, making it vulnerable.
n = p * q

# 2. Convert the plaintext string to a numerical representation.
# This is a crucial step in RSA, as it operates on numbers.
# We'll use bytes and then convert to a large integer.
plaintext_int = int.from_bytes(plaintext_flag.encode('utf-8'), 'big')

# 3. Encrypt the plaintext integer.
# The encryption formula is: ciphertext = (plaintext ^ e) mod n
# The built-in pow() function is efficient for modular exponentiation.
ciphertext = pow(plaintext_int, e, n)

# --- Output for the CTF Challenger ---

# Print the public key components and the ciphertext.
# This is all the information the user will be given.
print("--- RSA CTF Challenge ---")
print(f"Public Exponent (e): {e}")
print(f"Modulus (n): {n}")
print(f"Ciphertext: {ciphertext}")

print("\n")
print("With these values, a user should be able to factorize n to find p and q,")
print("calculate the private key, and decrypt the ciphertext to get the flag.")
