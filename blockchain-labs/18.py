import hashlib
import jwt
import time

SECRET = "secretkey123"
users = {}

def hash_password(pw):
    return hashlib.sha256(pw.encode()).hexdigest()

def signup():
    username = input("New username: ")
    if username in users:
        print("User exists.")
        return
    password = input("Password: ")
    bio = input("Bio: ")
    users[username] = {
        "password": hash_password(password),
        "bio": bio,
        "joined": "2025-06-06"
    }
    print("Signup complete.")

def login():
    username = input("Username: ")
    password = input("Password: ")
    user = users.get(username)
    if user and user["password"] == hash_password(password):
        payload = {
            "user": username,
            "exp": time.time() + 3600
        }
        token = jwt.encode(payload, SECRET, algorithm="HS256")
        print("Login successful.")
        print(f"JWT Token:\n{token}")
    else:
        print("Invalid credentials.")

def get_profile():
    token = input("Enter JWT token: ")
    try:
        decoded = jwt.decode(token, SECRET, algorithms=["HS256"])
        username = decoded["user"]
        print(f"Logged in as {username}")
        print("Profile:", users[username])
    except jwt.ExpiredSignatureError:
        print("Token expired.")
    except jwt.InvalidTokenError:
        print("Invalid token.")

def print_db():
    print("Users:")
    for user, data in users.items():
        print(f"{user} → {data}")

def main():
    while True:
        print("\n1.Signup 2.Login 3.Get Profile (JWT) 4.Print DB 5.Exit")
        c = input("Choose: ")
        if c == '1': signup()
        elif c == '2': login()
        elif c == '3': get_profile()
        elif c == '4': print_db()
        elif c == '5': break
        else: print("Invalid.")

if __name__ == "__main__":
    main()
