from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask_mail import Mail, Message
import random
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = 'your-super-secret-key-here'

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('EMAIL')
app.config['MAIL_PASSWORD'] = os.getenv('PASSWORD')

mail = Mail(app)

@app.route('/', methods=['GET', 'POST'])
def home():
    if request.method == 'POST':
        email = request.form['email']
        otp = request.form['otp']
        
        # Verify OTP
        with open('../otps.txt', 'r') as f:
            otps = f.readlines()
            for stored_otp in otps:
                stored_email, stored_code = stored_otp.strip().split(':')
                if email == stored_email and otp == stored_code:
                    session['logged_in'] = True
                    session['email'] = email
                    flash('Login successful!', 'success')
                    return render_template('login.html', message="Login successful!", category="success")
        
        return render_template('login.html', message="Invalid email or OTP!", category="error")
    
    return render_template('login.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        email = request.form['email']
        otp = str(random.randint(100000, 999999))
        
        # Send OTP via email
        msg = Message('Your OTP',
                    sender=os.getenv('EMAIL'),
                    recipients=[email])
        msg.body = f'Your OTP is: {otp}'
        mail.send(msg)
        
        # Save OTP to file
        with open('../otps.txt', 'a') as f:
            f.write(f'{email}:{otp}\n')
            
        return redirect(url_for('home'))
    return render_template('signup.html')

if __name__ == '__main__':
    app.run(port=5000, debug=True)