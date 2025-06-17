from flask import Flask, request, render_template, session, redirect, url_for
import hashlib
import logging

app = Flask(__name__)
app.secret_key = 'super-secret-key'

logging.basicConfig(level=logging.INFO)

users = {}

def hash_password(pw):
    return hashlib.sha256(pw.encode()).hexdigest()

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        action = request.form.get("action")

        if action == "signup":
            username = request.form["username"]
            password = request.form["password"]
            if username in users:
                logging.warning(f"Signup failed: user '{username}' already exists")
                return "User already exists"
            users[username] = {
                "password": hash_password(password),
                "bio": f"{username}'s default bio",
                "joined": "2025-06-06"
            }
            logging.info(f"New user signed up: {username}")
            return redirect(url_for("index"))

        elif action == "login":
            username = request.form["username"]
            password = request.form["password"]
            user = users.get(username)
            if user and user["password"] == hash_password(password):
                session["user"] = username
                logging.info(f"User '{username}' logged in successfully")
                return redirect(url_for("index"))
            else:
                logging.warning(f"Failed login attempt for user '{username}'")
                return "Login failed"

    user = session.get("user")
    if user:
        logging.info(f"Session check: user '{user}' is logged in")
    return render_template("index.html", user=user, users=users)

@app.route("/logout")
def logout():
    user = session.pop("user", None)
    if user:
        logging.info(f"User '{user}' logged out")
    return redirect(url_for("index"))

if __name__ == "__main__":
    app.run(debug=True)
