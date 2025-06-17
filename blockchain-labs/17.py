import hashlib
import uuid

users = {}      # username → { password_hash, bio, joined }
sessions = {}   # session_id (UUID str) → username

def hash_password(pw):
    return hashlib.sha256(pw.encode()).hexdigest()

def signup():
    username = input("New username: ")
    if username in users:
        print("User already exists.")
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
        session_id = str(uuid.uuid4())
        sessions[session_id] = username
        print(f"Login successful. Session ID: {session_id}")
    else:
        print("Login failed.")

def get_profile():
    sid = input("Enter session ID: ")
    username = sessions.get(sid)
    if username:
        print(f"Logged in as: {username}")
        print("Profile:", users[username])
    else:
        print("Invalid or expired session.")

def del_profile():
    sid = input("Enter session ID: ")
    username = sessions.get(sid)
    if username:
        sessions.pop(sid)
        print(f"Session Removed for {username}")
    else:
        print("Invalid or expired session.")

def print_db():
    print("\nUsers:")
    for user, data in users.items():
        print(f"{user}: {data}")
    print("\nSessions:")
    for sid, user in sessions.items():
        print(f"{sid} → {user}")

def main():
    while True:
        print("\n1.Signup 2.Login 3.Get Profile (Session) 4. Remove Profile (Session) 5.Print DB 6.Exit")
        c = input("Choose: ")
        if c == '1': signup()
        elif c == '2': login()
        elif c == '3': get_profile()
        elif c == '4': del_profile()
        elif c == '5': print_db()
        elif c == '6': break
        else: print("Invalid.")

if __name__ == "__main__":
    main()
