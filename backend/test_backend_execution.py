import requests
import json

# Test the backend /execute endpoint
BACKEND_URL = "http://localhost:5000"

print("=" * 50)
print("Testing Backend Code Execution Endpoint")
print("=" * 50)

# Test data - simple Python code
test_payload = {
    "source_code": 'print("Hello World")',
    "language": "python",
    "test_cases": [
        {
            "input": "",
            "expected_output": "Hello World"
        }
    ]
}

print("\n1. Testing /code/execute endpoint...")
print(f"   Payload: {json.dumps(test_payload, indent=2)}")

try:
    response = requests.post(
        f"{BACKEND_URL}/code/execute",
        json=test_payload,
        timeout=30
    )
    
    print(f"\n2. Response Status: {response.status_code}")
    print(f"   Response Body:")
    print(json.dumps(response.json(), indent=2))
    
    if response.status_code == 200:
        print("\n✅ SUCCESS! Backend execution works!")
    else:
        print(f"\n❌ FAILED with status {response.status_code}")
        
except requests.exceptions.Timeout:
    print("\n❌ REQUEST TIMED OUT (30 seconds)")
    print("   This means the backend is taking too long to respond")
    
except requests.exceptions.ConnectionError:
    print("\n❌ CONNECTION ERROR")
    print("   Is the backend running on port 5000?")
    print("   Run: python app.py")
    
except Exception as e:
    print(f"\n❌ ERROR: {e}")

print("\n" + "=" * 50)
