import requests
import cv2
import numpy as np
import time
import sys
import subprocess
import os

BASE_URL = "http://127.0.0.1:5001"
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SERVER_SCRIPT = os.path.join(PROJECT_ROOT, "src", "server.py")

def is_server_running():
    try:
        r = requests.get(f"{BASE_URL}/health")
        return r.status_code == 200
    except:
        return False

def start_server():
    print(f"Starting {SERVER_SCRIPT}...")
    # Start server as a subprocess
    process = subprocess.Popen([sys.executable, SERVER_SCRIPT], cwd=PROJECT_ROOT)
    
    # Wait for it to come up
    for i in range(20):
        if is_server_running():
            print("Server started successfully.")
            return process
        time.sleep(0.5)
        
    print("Failed to start server.")
    process.terminate()
    return None

def test_server():
    server_process = None
    if not is_server_running():
        server_process = start_server()
        if not server_process:
            sys.exit(1)
    else:
        print("Server already running, using existing instance.")

    try:
        # 1. Health check
        print("Testing /health...")
        resp = requests.get(f"{BASE_URL}/health")
        if resp.status_code == 200:
            print("PASS: /health")
        else:
            print(f"FAIL: /health {resp.text}")
            sys.exit(1)

        # 2. Upload and Analyze (with a dummy video file if possible, or just check endpoint existence)
        print("Testing /upload-and-analyze existence...")
        # We'll just send a junk request to see if it 404s or 400s
        resp = requests.post(f"{BASE_URL}/upload-and-analyze")
        if resp.status_code == 400: # Expected because no file provided
            print("PASS: /upload-and-analyze is reachable")
        else:
            print(f"FAIL: /upload-and-analyze returned {resp.status_code} - {resp.text}")

    finally:
        if server_process:
            print("Stopping server...")
            server_process.terminate()
            server_process.wait()

if __name__ == "__main__":
    test_server()
