from flask import Flask, render_template, request, redirect
from blockchain import Blockchain
from collections import Counter

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
        # Automatically sync all others
        for k in nodes:
            if k != node_id:
                nodes[k].sync_from(nodes[node_id].chain)
    return redirect('/')

@app.route('/tamper/<node_id>/<int:block_index>', methods=['POST'])
def tamper(node_id, block_index):
    new_data = request.form.get('new_data')
    nodes[node_id].tamper_block(block_index, new_data)
    return redirect('/')

@app.route('/consensus')
def consensus():
    chain_map = {}
    for nid, node in nodes.items():
        hlist = tuple(node.to_hash_list())
        if hlist not in chain_map:
            chain_map[hlist] = []
        chain_map[hlist].append(node.chain)

    most_common_chain = max(chain_map.items(), key=lambda x: len(x[1]))[1][0]

    for node in nodes.values():
        node.sync_from(most_common_chain)

    return redirect('/')

if __name__ == "__main__":
    app.run(debug=True, port=5001)