from flask import Flask, send_from_directory
import os

app = Flask(__name__)
HTML_DIR = os.path.dirname(os.path.abspath(__file__))

@app.route("/")
def home():
    return send_from_directory(HTML_DIR, "index.html")

@app.route("/create-credential")
def create_credential():
    return send_from_directory(HTML_DIR, "create-credential.html")

@app.route("/create-presentation")
def create_presentation():
    return send_from_directory(HTML_DIR, "create-presentation.html")

@app.route("/verify-presentation")
def verify_presentation():
    return send_from_directory(HTML_DIR, "verify-presentation.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5003) 