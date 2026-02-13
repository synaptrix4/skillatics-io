import requests

print("Testing Piston API...")
print("=" * 50)

payload = {
    "language": "python",
    "version": "*",
    "files": [{"content": 'print("Hello from Piston!")'}],
    "stdin": ""
}

try:
    response = requests.post(
        "https://emkc.org/api/v2/piston/execute",
        json=payload,
        timeout=10
    )
    
    if response.status_code == 200:
        result = response.json()
        stdout = result.get("run", {}).get("stdout", "")
        print(f"✅ SUCCESS!")
        print(f"   Output: {stdout.strip()}")
        print(f"   Language: {result.get('language')}")
        print(f"   Version: {result.get('version')}")
    else:
        print(f"❌ FAILED: Status {response.status_code}")
        print(response.text)
        
except Exception as e:
    print(f"❌ ERROR: {e}")

print("=" * 50)
