
import requests
import json

url = 'http://localhost:3000/api/login'
headers = {'Content-Type': 'application/json'}
data = {'username': 'testuser_nonexistent_12345', 'password': 'password123'}

try:
    print(f"Sending POST request to {url}")
    response = requests.post(url, headers=headers, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 401:
        print("Success: Server responded with Expected 401 for non-existent user.")
    elif response.status_code == 200:
        print("Success: Login successful (unexpected for test user).")
    else:
        print(f"Unexpected status code: {response.status_code}")

except Exception as e:
    print(f"Error: {e}")
