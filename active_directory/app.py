import subprocess
import base64
import json
import os
from flask import Flask, jsonify, render_template

app = Flask(__name__)

@app.route("/users")
def get_users():
    try:
        cmd = [
            "ldbsearch",
            "-H", "/var/lib/samba/private/sam.ldb",
            "(objectClass=user)",
            "sAMAccountName", "unicodePwd", "ntPwdHash"
        ]

        result = subprocess.run(cmd, capture_output=True, text=True, check=True)

        output = result.stdout
        users = []
        entry = {}
        
        for line in output.strip().splitlines():
            line = line.strip()
            
            if not line:
                if entry:
                    users.append(entry)
                    entry = {}
                continue
            
            if line.startswith("#") or line.startswith("ref:"):
                continue

            if "::" in line:
                k, v_base64 = line.split("::", 1)
                try:
                    entry[k.strip()] = base64.b64decode(v_base64.strip()).hex()
                except Exception as decode_e:
                    entry[k.strip()] = v_base64.strip()
                    print(f"Failed to decode base64 for key {k}: {decode_e}")
            elif ":" in line:
                k, v = line.split(":", 1)
                entry[k.strip()] = v.strip()
        
        if entry:
            users.append(entry)

        try:
            file_path = "users.json"
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(users, f, indent=4)
            print(f"User data successfully written to {file_path}")
        except IOError as file_e:
            print(f"Error writing to file: {file_e}")

        return jsonify(users)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)
