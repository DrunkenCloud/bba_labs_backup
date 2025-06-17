from flask import Flask, request, render_template, redirect, session
from web3 import Web3
import json, hashlib, secrets

app = Flask(__name__)
app.secret_key = "supersecret"

web3 = Web3(Web3.HTTPProvider("http://127.0.0.1:7545"))
acct = web3.eth.accounts[0]

with open('./build/contracts/SecureLogin.json') as f:
    artifact = json.load(f)
abi = artifact['abi']
addr = artifact['networks'][list(artifact['networks'].keys())[0]]['address']
contract = web3.eth.contract(address=addr, abi=abi)

user_db = {}

def h(text):
    return Web3.keccak(text=text)

@app.route('/')
def index():
    if 'username' in session:
        u = session['username']
        return f"<h1>Welcome {u}!</h1><p>{user_db[u]}</p><a href='/logout'>Logout</a>"
    return render_template("index.html")

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        uname = request.form['username']
        pwd = request.form['password']
        bio = request.form['bio']
        email = request.form['email']
        try:
            tx = contract.functions.register(h(uname), h(pwd)).transact({'from': acct})
            web3.eth.wait_for_transaction_receipt(tx)
            user_db[uname] = {'bio': bio, 'email': email}
            return redirect('/')
        except:
            return "⚠️ User already exists."
    return render_template("signup.html")

@app.route('/login', methods=['POST'])
def login():
    uname = request.form['username']
    pwd = request.form['password']
    if contract.functions.login(h(uname), h(pwd)).call():
        session['username'] = uname
        session['session_token'] = secrets.token_hex(16)
        return redirect('/')
    return "❌ Login failed. Try again."

@app.route('/logout')
def logout():
    session.clear()
    return redirect('/')

if __name__ == "__main__":
    app.run(debug=True, port=5005)