users = {}  # username -> password

def signup():
    username = input("Enter new username: ")
    if username in users:
        print("User already exists.")
        return
    password = input("Enter password: ")
    users[username] = password
    print("Signup successful.")

def login():
    username = input("Enter username: ")
    password = input("Enter password: ")
    if users.get(username) == password:
        print("Login successful.")
    else:
        print("Login failed.")

def print_db():
    print("Stored users:", users)

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
