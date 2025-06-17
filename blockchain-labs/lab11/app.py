from flask import Flask, render_template, request, redirect
from blockchain import Blockchain

app = Flask(__name__)
blockchain = Blockchain(difficulty=3)

@app.route('/')
def index():
    chain = blockchain.get_chain()
    return render_template('index.html', chain=chain)

@app.route('/add', methods=['POST'])
def add():
    data = request.form.get('data')
    if data:
        blockchain.add_block(data)
    return redirect('/')

if __name__ == '__main__':
    app.run(debug=True)

