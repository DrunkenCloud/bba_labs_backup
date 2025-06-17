from flask import Flask, request, render_template
import random
import logging

app = Flask(__name__)

logging.basicConfig(level=logging.INFO)

P = 2087

def polynom(x, coefficients):
    res = 0
    for coefficient_index, coefficient_value in enumerate(coefficients[::-1]):
        res += x ** coefficient_index * coefficient_value
    return res % P

def generate_shares(secret, k, n):
    coeffs = [secret] + [random.randint(0, P) for _ in range(k - 1)]
    logging.info(f"Generated polynomial coefficients: {coeffs}")
    shares = []
    for i in range(1, n + 1):
        x = i
        y = polynom(x, coeffs)
        shares.append((x, y))
    logging.info(f"Generated shares: {shares}")
    return shares

def reconstruct_secret(shares):
    def lagrange_interpolate(x, x_s, y_s):
        total = 0
        for i in range(len(x_s)):
            xi, yi = x_s[i], y_s[i]
            prod = 1
            for j in range(len(x_s)):
                if i != j:
                    xj = x_s[j]
                    prod *= (x - xj) * pow(xi - xj, -1, P)
            total += yi * prod
        return int(round(total)) % P

    x_vals = [x for x, _ in shares]
    y_vals = [y for _, y in shares]
    secret = lagrange_interpolate(0, x_vals, y_vals)
    logging.info(f"Reconstructed secret from shares {shares}: {secret}")
    return secret

@app.route("/", methods=["GET", "POST"])
def index():
    result = None
    shares = []
    reconstructed = None

    if request.method == "POST":
        action = request.form.get("action")
        if action == "generate":
            secret = int(request.form["secret"])
            k = int(request.form["threshold"])
            n = int(request.form["total"])
            shares = generate_shares(secret, k, n)
            result = shares
        elif action == "reconstruct":
            shares_input = request.form.get("shares")
            shares = []
            for line in shares_input.strip().splitlines():
                try:
                    line = line.strip().replace('\r', '')
                    if not line:
                        continue
                    x_str, y_str = line.strip("() ").split(",")
                    x, y = int(x_str.strip()), int(y_str.strip())
                    shares.append((x, y))
                except Exception as e:
                    print(f"Skipping invalid line: {line} ({e})")

    return render_template("index.html", result=result, reconstructed=reconstructed)

if __name__ == "__main__":
    app.run(debug=True)
