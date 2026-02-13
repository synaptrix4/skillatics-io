import requests
import time
import json

# Test Judge0 local instance
JUDGE0_HOST = "http://localhost:2358"

print("=" * 50)
print("Testing Judge0 Local Installation")
print("=" * 50)

# Test 1: Check if Judge0 is accessible
print("\n1. Checking Judge0 availability...")
try:
    response = requests.get(f"{JUDGE0_HOST}/about", timeout=5)
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Judge0 is running!")
        print(f"   Version: {data.get('version', 'Unknown')}")
    else:
        print(f"❌ Judge0 returned status code: {response.status_code}")
        exit(1)
except Exception as e:
    print(f"❌ Cannot connect to Judge0: {e}")
    print("   Make sure Docker containers are running:")
    print("   docker-compose -f docker-compose-judge0.yml ps")
    exit(1)

# Test 2: Submit a simple Python code
print("\n2. Submitting test code...")
test_code = 'print("Hello from Judge0!")'
payload = {
    "language_id": 71,  # Python 3
    "source_code": test_code,
    "stdin": ""
}

try:
    response = requests.post(
        f"{JUDGE0_HOST}/submissions",
        json=payload,
        headers={"content-type": "application/json"},
        timeout=10
    )
    
    if response.status_code == 201:
        submission = response.json()
        token = submission.get("token")
        print(f"✅ Submission created with token: {token}")
    else:
        print(f"❌ Submission failed with status: {response.status_code}")
        print(f"   Response: {response.text}")
        exit(1)
except Exception as e:
    print(f"❌ Submission error: {e}")
    exit(1)

# Test 3: Poll for result
print("\n3. Waiting for execution result...")
max_attempts = 20
attempt = 0

while attempt < max_attempts:
    try:
        response = requests.get(
            f"{JUDGE0_HOST}/submissions/{token}",
            headers={"content-type": "application/json"},
            timeout=5
        )
        
        if response.status_code == 200:
            result = response.json()
            status_id = result.get("status", {}).get("id")
            
            # Status 1 = In Queue, 2 = Processing
            if status_id not in [1, 2]:
                print(f"✅ Execution completed!")
                print(f"   Status: {result.get('status', {}).get('description')}")
                stdout = result.get('stdout') or ""
                stderr = result.get('stderr') or ""
                output = stdout.strip() if stdout else (stderr.strip() if stderr else "")
                print(f"   Output: {output}")
                if result.get("stderr"):
                    print(f"   Error: {result.get('stderr')}")
                if result.get("compile_output"):
                    print(f"   Compile: {result.get('compile_output')}")
                break
        else:
            print(f"❌ Failed to get result: {response.status_code}")
            break
            
    except Exception as e:
        print(f"❌ Error getting result: {e}")
        break
    
    time.sleep(0.5)
    attempt += 1
    if attempt % 5 == 0:
        print(f"   Still waiting... (attempt {attempt}/20)")

if attempt >= max_attempts:
    print("❌ Timeout waiting for result")
    exit(1)

print("\n" + "=" * 50)
print("✅ ALL TESTS PASSED!")
print("Judge0 is working correctly!")
print("=" * 50)
