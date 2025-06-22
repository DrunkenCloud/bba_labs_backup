from flask import Flask, render_template, request, redirect, session
from flask_session import Session
from blockchain import Blockchain
import uuid

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)

def get_user_blockchain():
    """Get or create blockchain for current user session"""
    if 'user_id' not in session:
        session['user_id'] = str(uuid.uuid4())
    
    if 'blockchain' not in session:
        # Create new blockchain for this user
        blockchain = Blockchain(difficulty=3)
        session['blockchain'] = blockchain.to_dict()
    else:
        # Load existing blockchain from session
        blockchain = Blockchain.from_dict(session['blockchain'])
    
    return blockchain

def save_blockchain(blockchain):
    """Save blockchain to session"""
    session['blockchain'] = blockchain.to_dict()

@app.route('/')
def index():
    blockchain = get_user_blockchain()
    chain = blockchain.get_chain()
    return render_template('index.html', chain=chain, difficulty=blockchain.difficulty, user_id=session['user_id'])

@app.route('/add', methods=['POST'])
def add():
    blockchain = get_user_blockchain()
    data = request.form.get('data')
    if data:
        blockchain.add_block(data)
        save_blockchain(blockchain)
    return redirect('/')

@app.route('/set_difficulty', methods=['POST'])
def set_difficulty():
    blockchain = get_user_blockchain()
    try:
        new_difficulty = int(request.form.get('difficulty', 3))
        if new_difficulty < 1 or new_difficulty > 8:
            new_difficulty = 3  # Default to 3 if invalid
        blockchain.reset_chain(new_difficulty)
        save_blockchain(blockchain)
    except ValueError:
        # If conversion fails, keep current difficulty
        pass
    return redirect('/')

@app.route('/new_session')
def new_session():
    """Create a new session for the user"""
    session.clear()
    session['user_id'] = str(uuid.uuid4())
    return redirect('/')

if __name__ == '__main__':
    app.run(debug=True)

