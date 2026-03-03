"""
Seed script for coding questions.
Run with: venv\\Scripts\\python.exe seed_coding_questions.py

- Inserts 10 coding questions with proper function_name, input_format, starter_code, and test_cases.
- Patches existing coding questions that are missing function_name/starter_code.
"""

import os
from dotenv import load_dotenv
from pymongo import MongoClient
from urllib.parse import urlparse

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/skillatics")
parsed = urlparse(MONGO_URI)
DB_NAME = parsed.path.lstrip("/") or "skillatics"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
col = db["questions"]

# ------------------------------------
# Helper: build per-language starter code
# ------------------------------------
def starter(fn, py_params, js_params, java_sig, cpp_sig):
    return {
        "python": f"def {fn}({py_params}):\n    # Write your solution here\n    pass\n",
        "javascript": (
            f"/**\n * @return {{*}}\n */\n"
            f"var {fn} = function({js_params}) {{\n    // Write your solution here\n}};\n"
        ),
        "java": f"class Solution {{\n    public {java_sig} {fn}(...) {{\n        // Write your solution here\n    }}\n}}",
        "cpp":  f"#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {{\npublic:\n    {cpp_sig};\n}};",
    }


# ------------------------------------
# Coding questions to seed
# ------------------------------------
QUESTIONS = [
    {
        "type": "coding",
        "text": "Two Sum",
        "description": (
            "Given an array of integers nums and an integer target, return indices of the two numbers "
            "such that they add up to target.\n\n"
            "You may assume that each input would have exactly one solution, and you may not use the same element twice."
        ),
        "topic": "Arrays",
        "difficulty": 1,
        "function_name": "twoSum",
        "input_format": "array_int, int",
        "starter_code": starter(
            "twoSum",
            "nums, target",
            "nums, target",
            "int[] twoSum(int[] nums, int target)",
            "vector<int> twoSum(vector<int>& nums, int target)"
        ),
        "test_cases": [
            {"input": "[2,7,11,15]\n9",  "expected_output": "0 1", "hidden": False},
            {"input": "[3,2,4]\n6",       "expected_output": "1 2", "hidden": False},
            {"input": "[3,3]\n6",         "expected_output": "0 1", "hidden": True},
            {"input": "[1,2,3,4,5]\n9",   "expected_output": "3 4", "hidden": True},
        ],
        "constraints": [
            "2 <= nums.length <= 10^4",
            "-10^9 <= nums[i] <= 10^9",
            "-10^9 <= target <= 10^9",
            "Only one valid answer exists."
        ]
    },
    {
        "type": "coding",
        "text": "Reverse String",
        "description": (
            "Write a function that reverses a string. The input is a string s and you should return it reversed."
        ),
        "topic": "Strings",
        "difficulty": 1,
        "function_name": "reverseString",
        "input_format": "string",
        "starter_code": starter(
            "reverseString",
            "s",
            "s",
            "String reverseString(String s)",
            "string reverseString(string s)"
        ),
        "test_cases": [
            {"input": "hello",   "expected_output": "olleh", "hidden": False},
            {"input": "Hannah",  "expected_output": "hannaH", "hidden": False},
            {"input": "abcde",   "expected_output": "edcba", "hidden": True},
            {"input": "racecar", "expected_output": "racecar", "hidden": True},
        ],
        "constraints": [
            "1 <= s.length <= 10^5",
            "s consists of printable ASCII characters."
        ]
    },
    {
        "type": "coding",
        "text": "Palindrome Number",
        "description": (
            "Given an integer x, return true if x is a palindrome, and false otherwise.\n\n"
            "An integer is a palindrome when it reads the same forward and backward."
        ),
        "topic": "Math",
        "difficulty": 1,
        "function_name": "isPalindrome",
        "input_format": "int",
        "starter_code": starter(
            "isPalindrome",
            "x",
            "x",
            "boolean isPalindrome(int x)",
            "bool isPalindrome(int x)"
        ),
        "test_cases": [
            {"input": "121",   "expected_output": "True",  "hidden": False},
            {"input": "-121",  "expected_output": "False", "hidden": False},
            {"input": "10",    "expected_output": "False", "hidden": True},
            {"input": "12321", "expected_output": "True",  "hidden": True},
        ],
        "constraints": [
            "-2^31 <= x <= 2^31 - 1"
        ]
    },
    {
        "type": "coding",
        "text": "Fibonacci Number",
        "description": (
            "The Fibonacci numbers, commonly denoted F(n), form a sequence called the Fibonacci sequence, "
            "such that each number is the sum of the two preceding ones, starting from 0 and 1.\n\n"
            "Given n, calculate F(n)."
        ),
        "topic": "Dynamic Programming",
        "difficulty": 1,
        "function_name": "fib",
        "input_format": "int",
        "starter_code": starter(
            "fib",
            "n",
            "n",
            "int fib(int n)",
            "int fib(int n)"
        ),
        "test_cases": [
            {"input": "2",  "expected_output": "1",  "hidden": False},
            {"input": "3",  "expected_output": "2",  "hidden": False},
            {"input": "4",  "expected_output": "3",  "hidden": True},
            {"input": "10", "expected_output": "55", "hidden": True},
        ],
        "constraints": [
            "0 <= n <= 30"
        ]
    },
    {
        "type": "coding",
        "text": "Maximum Subarray",
        "description": (
            "Given an integer array nums, find the subarray with the largest sum, and return its sum.\n\n"
            "Example: Input: nums = [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6\n"
            "Explanation: The subarray [4,-1,2,1] has the largest sum 6."
        ),
        "topic": "Dynamic Programming",
        "difficulty": 2,
        "function_name": "maxSubArray",
        "input_format": "array_int",
        "starter_code": {
            "python":     "def maxSubArray(nums):\n    # Write your solution here\n    pass\n",
            "javascript": "var maxSubArray = function(nums) {\n    // Write your solution here\n};\n",
            "java":       "class Solution {\n    public int maxSubArray(int[] nums) {\n        // Write your solution here\n    }\n}",
            "cpp":        "#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxSubArray(vector<int>& nums);\n};",
        },
        "test_cases": [
            {"input": "-2 1 -3 4 -1 2 1 -5 4", "expected_output": "6",  "hidden": False},
            {"input": "1",                       "expected_output": "1",  "hidden": False},
            {"input": "5 4 -1 7 8",              "expected_output": "23", "hidden": True},
            {"input": "-1 -2 -3",                "expected_output": "-1", "hidden": True},
        ],
        "constraints": [
            "1 <= nums.length <= 10^5",
            "-10^4 <= nums[i] <= 10^4"
        ]
    },
    {
        "type": "coding",
        "text": "Valid Parentheses",
        "description": (
            "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', "
            "determine if the input string is valid.\n\n"
            "An input string is valid if:\n"
            "1. Open brackets must be closed by the same type of brackets.\n"
            "2. Open brackets must be closed in the correct order.\n"
            "3. Every close bracket has a corresponding open bracket of the same type."
        ),
        "topic": "Stacks",
        "difficulty": 2,
        "function_name": "isValid",
        "input_format": "string",
        "starter_code": starter(
            "isValid",
            "s",
            "s",
            "boolean isValid(String s)",
            "bool isValid(string s)"
        ),
        "test_cases": [
            {"input": "()",     "expected_output": "True",  "hidden": False},
            {"input": "()[]{}","expected_output": "True",  "hidden": False},
            {"input": "(]",     "expected_output": "False", "hidden": True},
            {"input": "([)]",   "expected_output": "False", "hidden": True},
            {"input": "{[]}",   "expected_output": "True",  "hidden": True},
        ],
        "constraints": [
            "1 <= s.length <= 10^4",
            "s consists of parentheses only '()[]{}'."
        ]
    },
    {
        "type": "coding",
        "text": "Climbing Stairs",
        "description": (
            "You are climbing a staircase. It takes n steps to reach the top.\n\n"
            "Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?"
        ),
        "topic": "Dynamic Programming",
        "difficulty": 2,
        "function_name": "climbStairs",
        "input_format": "int",
        "starter_code": starter(
            "climbStairs",
            "n",
            "n",
            "int climbStairs(int n)",
            "int climbStairs(int n)"
        ),
        "test_cases": [
            {"input": "2", "expected_output": "2", "hidden": False},
            {"input": "3", "expected_output": "3", "hidden": False},
            {"input": "5", "expected_output": "8", "hidden": True},
            {"input": "10","expected_output": "89","hidden": True},
        ],
        "constraints": [
            "1 <= n <= 45"
        ]
    },
    {
        "type": "coding",
        "text": "Contains Duplicate",
        "description": (
            "Given an integer array nums, return true if any value appears at least twice in the array, "
            "and return false if every element is distinct."
        ),
        "topic": "Arrays",
        "difficulty": 1,
        "function_name": "containsDuplicate",
        "input_format": "array_int",
        "starter_code": {
            "python":     "def containsDuplicate(nums):\n    # Write your solution here\n    pass\n",
            "javascript": "var containsDuplicate = function(nums) {\n    // Write your solution here\n};\n",
            "java":       "class Solution {\n    public boolean containsDuplicate(int[] nums) {\n        // Write your solution here\n    }\n}",
            "cpp":        "#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool containsDuplicate(vector<int>& nums);\n};",
        },
        "test_cases": [
            {"input": "1 2 3 1",   "expected_output": "True",  "hidden": False},
            {"input": "1 2 3 4",   "expected_output": "False", "hidden": False},
            {"input": "1 1 1 3 3 4 3 2 4 2", "expected_output": "True",  "hidden": True},
        ],
        "constraints": [
            "1 <= nums.length <= 10^5",
            "-10^9 <= nums[i] <= 10^9"
        ]
    },
    {
        "type": "coding",
        "text": "Single Number",
        "description": (
            "Given a non-empty array of integers nums, every element appears twice except for one. "
            "Find that single one.\n\nYou must implement a solution with a linear runtime complexity "
            "and use only constant extra space."
        ),
        "topic": "Bit Manipulation",
        "difficulty": 2,
        "function_name": "singleNumber",
        "input_format": "array_int",
        "starter_code": {
            "python":     "def singleNumber(nums):\n    # Write your solution here\n    pass\n",
            "javascript": "var singleNumber = function(nums) {\n    // Write your solution here\n};\n",
            "java":       "class Solution {\n    public int singleNumber(int[] nums) {\n        // Write your solution here\n    }\n}",
            "cpp":        "#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    int singleNumber(vector<int>& nums);\n};",
        },
        "test_cases": [
            {"input": "2 2 1",     "expected_output": "1", "hidden": False},
            {"input": "4 1 2 1 2", "expected_output": "4", "hidden": False},
            {"input": "1",         "expected_output": "1", "hidden": True},
        ],
        "constraints": [
            "1 <= nums.length <= 3 * 10^4",
            "-3 * 10^4 <= nums[i] <= 3 * 10^4",
            "Each element appears twice except for one."
        ]
    },
    {
        "type": "coding",
        "text": "Best Time to Buy and Sell Stock",
        "description": (
            "You are given an array prices where prices[i] is the price of a given stock on the ith day.\n\n"
            "You want to maximize your profit by choosing a single day to buy one stock and choosing a "
            "different day in the future to sell that stock.\n\n"
            "Return the maximum profit you can achieve from this transaction. "
            "If you cannot achieve any profit, return 0."
        ),
        "topic": "Arrays",
        "difficulty": 2,
        "function_name": "maxProfit",
        "input_format": "array_int",
        "starter_code": {
            "python":     "def maxProfit(prices):\n    # Write your solution here\n    pass\n",
            "javascript": "var maxProfit = function(prices) {\n    // Write your solution here\n};\n",
            "java":       "class Solution {\n    public int maxProfit(int[] prices) {\n        // Write your solution here\n    }\n}",
            "cpp":        "#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxProfit(vector<int>& prices);\n};",
        },
        "test_cases": [
            {"input": "7 1 5 3 6 4", "expected_output": "5", "hidden": False},
            {"input": "7 6 4 3 1",   "expected_output": "0", "hidden": False},
            {"input": "2 4 1",        "expected_output": "2", "hidden": True},
            {"input": "1 2 3 4 5",    "expected_output": "4", "hidden": True},
        ],
        "constraints": [
            "1 <= prices.length <= 10^5",
            "0 <= prices[i] <= 10^4"
        ]
    },
]


def run():
    inserted = 0
    patched = 0

    # ----- 1. Insert new questions (avoid duplicates by text) -----
    for q in QUESTIONS:
        exists = col.find_one({"text": q["text"], "type": "coding"})
        if exists:
            # Patch missing fields on existing doc
            update = {}
            for field in ("function_name", "input_format", "starter_code", "test_cases", "description", "constraints"):
                if not exists.get(field) and q.get(field):
                    update[field] = q[field]
            if update:
                col.update_one({"_id": exists["_id"]}, {"$set": update})
                patched += 1
                print(f"  [PATCHED]  {q['text']}")
            else:
                print(f"  [SKIP]     {q['text']} (already complete)")
        else:
            col.insert_one(q)
            inserted += 1
            print(f"  [INSERTED] {q['text']}")

    # ----- 2. Patch all other existing coding questions missing function_name -----
    orphans = col.find({
        "type": "coding",
        "$or": [
            {"function_name": {"$exists": False}},
            {"function_name": None},
            {"function_name": ""},
        ]
    })
    for doc in orphans:
        title = doc.get("text", "")
        words = title.replace(":", "").split()
        fn = "".join(w[0].upper() + w[1:].lower() if i > 0 else w.lower() for i, w in enumerate(words)) if words else "solution"
        col.update_one({"_id": doc["_id"]}, {"$set": {
            "function_name": fn,
            "input_format": "array_int, int",
            "starter_code": {
                "python": f"def {fn}(nums, target):\n    # Write your solution here\n    pass\n",
                "javascript": f"var {fn} = function(nums, target) {{\n    // Write your solution here\n}};\n",
                "java": f"class Solution {{\n    public int[] {fn}(int[] nums, int target) {{\n        // Write your solution here\n    }}\n}}",
                "cpp": f"#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {{\npublic:\n    vector<int> {fn}(vector<int>& nums, int target);\n}};",
            }
        }})
        patched += 1
        print(f"  [AUTO-PATCHED] {title} → function_name={fn}")

    print(f"\nDone! Inserted: {inserted}, Patched: {patched}")
    client.close()


if __name__ == "__main__":
    print("Seeding coding questions...")
    run()
