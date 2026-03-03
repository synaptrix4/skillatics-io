import requests

payload = {
    "source_code": "def twoSum(nums, target):\n    for i in range(len(nums)):\n        for j in range(i + 1, len(nums)):\n            if nums[i] + nums[j] == target:\n                return [i, j]\n    return []",
    "language": "python",
    "function_name": "twoSum",
    "input_format": "array_int, int",
    "test_cases": [
        {
            "input": "2 7 11 15\n9",
            "expected_output": "0 1",
            "hidden": False
        },
        {
            "input": "3 2 4\n6",
            "expected_output": "1 2",
            "hidden": False
        }
    ]
}

print("Testing direct backend execution with wrapped test harness...")
try:
    headers = {"Content-Type": "application/json"}
    
    # We bypass auth by just using a dummy user if possible, or wait
    # The /execute endpoint requires JWT auth in Flask.
    # So we'll hit the inner python function instead of the flask endpoint to bypass auth!
    import sys
    import os
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    from routes.code_wrapper import wrap_user_code_with_test_harness
    from routes.code_execution import execute_code_piston
    
    for case in payload["test_cases"]:
        print(f"\\n--- Test Case ---")
        print(f"Input: {case['input'].replace('\\n', ' | ')}")
        wrapped = wrap_user_code_with_test_harness(
            payload["source_code"], 
            payload["language"], 
            case["input"], 
            payload["function_name"], 
            payload["input_format"]
        )
        res = execute_code_piston(wrapped, payload["language"], "")
        print(f"Output: {res.get('stdout')}")
        print(f"Expected: {case['expected_output']}")
        print(f"Passed: {(res.get('stdout') or '').strip() == case['expected_output'].strip()}")
        
except Exception as e:
    import traceback
    traceback.print_exc()
