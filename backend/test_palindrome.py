import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from routes.code_wrapper import wrap_user_code_with_test_harness
from routes.code_execution import execute_code_piston

source_code = """
def isPalindrome(s):
    return s == s[::-1]
"""

test_input = "racecar"

print("Wrapping Palindrome Code...")
wrapped = wrap_user_code_with_test_harness(
    source_code, 
    "python", 
    test_input, 
    "isPalindrome", 
    "string"
)

print("\n--- Wrapped Code ---")
print(wrapped)

print("\nExecuting Local Python...")
res = execute_code_piston(wrapped, "python", "")
print(f"Stdout: {res.get('stdout')}")
print(f"Stderr: {res.get('stderr')}")
