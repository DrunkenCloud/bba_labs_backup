from flask import Flask, render_template, request, redirect
from blockchain import Blockchain

app = Flask(__name__)

nodes = {
    "A": Blockchain(difficulty=2),
    "B": Blockchain(difficulty=2),
    "C": Blockchain(difficulty=2)
}

@app.route('/')
def index():
    return render_template('index.html', nodes=nodes)

@app.route('/add/<node_id>', methods=['POST'])
def add(node_id):
    data = request.form.get('data')
    if data:
        nodes[node_id].add_block(data)
        for other_id, chain in nodes.items():
            if other_id != node_id:
                nodes[other_id].sync_from(nodes[node_id].chain)
    return redirect('/')

@app.route('/tamper/<node_id>/<int:block_index>', methods=['POST'])
def tamper(node_id, block_index):
    new_data = request.form.get('new_data')
    nodes[node_id].tamper_block(block_index, new_data)
    return redirect('/')

if __name__ == '__main__':
    app.run(debug=True)
