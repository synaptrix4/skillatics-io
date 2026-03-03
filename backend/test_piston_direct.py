import requests
print("Testing Piston API endpoint directly...")
url = "https://emkc.org/api/v2/piston/execute"
payload = {
    "language": "python",
    "version": "3.10.0",
    "files": [{"content": "print('Test')"}],
}
try:
    r = requests.post(url, json=payload)
    print("Status:", r.status_code)
    print("Response:", r.text)
except Exception as e:
    print("Error:", e)
