import hashlib

db = {}

def hash_password(pw):
    return hashlib.sha256(pw.encode()).hexdigest()

def signup():
    username = input("New username: ")
    if username in db:
        print("User already exists.")
        return
    password = input("Password: ")
    bio = input("Write a short bio: ")
    db[username] = {
        "password": hash_password(password),
        "bio": bio,
        "joined": "2025-06-06"
    }
    print("Signup complete.")

def login():
    username = input("Username: ")
    password = input("Password: ")
    user = db.get(username)
    if user and user["password"] == hash_password(password):
        print(f"Welcome back, {username}!")
        print("Your profile:", user)
    else:
        print("Invalid credentials.")

def print_db():
    print("Database:")
    for user, info in db.items():
        print(f"{user} → {info}")

def main():
    while True:
        print("\nOptions: 1.Signup  2.Login  3.Print DB  4.Exit")
        choice = input("Choose: ")
        if choice == '1':
            signup()
        elif choice == '2':
            login()
        elif choice == '3':
            print_db()
        elif choice == '4':
            break
        else:
            print("Invalid choice.")

if __name__ == '__main__':
    main()
