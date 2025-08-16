from flask import Flask, render_template
import time

app = Flask(__name__)

@app.route('/')
def view_otps():
    otps = []
    try:
        with open('../otps.txt', 'r') as f:
            otps = f.readlines()
    except FileNotFoundError:
        pass
    
    return render_template('view_otps.html', otps=otps)

if __name__ == '__main__':
    app.run(port=5001, debug=True)