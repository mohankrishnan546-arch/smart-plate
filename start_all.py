import socket
import subprocess
import os
import time

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0

def kill_port(port):
    try:
        if os.name == 'nt': # Windows
            output = subprocess.check_output(f"netstat -ano | findstr :{port}", shell=True).decode()
            for line in output.splitlines():
                if "LISTENING" in line:
                    pid = line.strip().split()[-1]
                    print(f"[*] Killing PID {pid} on port {port}")
                    os.system(f"taskkill /F /PID {pid}")
    except:
        pass

def start_servers():
    print("🥗 Smart Plate Stability Guard - Initializing...")
    
    # Clean up old processes
    kill_port(5173)
    kill_port(8000)
    
    # Start Backend
    print("[+] Launching Backend Engine (Port 8000)...")
    backend_proc = subprocess.Popen(
        "python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload",
        cwd="backend",
        shell=True
    )
    
    # Start Frontend
    print("[+] Launching Frontend Analytics (Port 5173)...")
    frontend_proc = subprocess.Popen(
        "npx vite --host 127.0.0.1 --port 5173 --strictPort",
        cwd="frontend",
        shell=True
    )
    
    print("\n✅ System is ONLINE at http://127.0.0.1:5173")
    print("Press Ctrl+C to stop all services.")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[!] Shutting down services...")
        backend_proc.terminate()
        frontend_proc.terminate()

if __name__ == "__main__":
    start_servers()
