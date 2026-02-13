import requests
import json

# Test the backend execution endpoint directly
BACKEND_URL = "http://localhost:5000"

print("Testing Backend /code/execute endpoint...")
print("=" * 50)

# You'll need a valid JWT token - get it from browser dev tools
# Or test without auth by temporarily removing @jwt_required
test_payload = {
    "source_code": 'print("Hello World")',
    "language": "python",
    "test_cases": []
}

print("\nPayload:")
print(json.dumps(test_payload, indent=2))

try:
    # Note: This will fail with 401 if backend requires auth
    response = requests.post(
        f"{BACKEND_URL}/api/code/execute",
        json=test_payload,
        timeout=30
    )
    
    print(f"\nResponse Status: {response.status_code}")
    print(f"Response Body:")
    print(json.dumps(response.json(), indent=2))
    
except requests.exceptions.ConnectionError:
    print("\n❌ Cannot connect to backend")
    print("   Is the backend running? (python app.py)")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    print(f"   Response text: {response.text if 'response' in locals() else 'N/A'}")
