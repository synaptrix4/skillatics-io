import os
import sys
from datetime import datetime
from pymongo import MongoClient
from dotenv import load_dotenv

# Load env vars
load_dotenv()

def seed_coding_questions():
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/skillatics")
    print(f"Connecting to {mongo_uri}...")
    
    try:
        client = MongoClient(mongo_uri)
        # Explicitly use 'skillatics' database if get_database() fails or returns None
        try:
            db = client.get_database()
        except:
            db = client["skillatics"]
        
        # fallback if URI didn't have db name
        if db.name is None:
             db = client["skillatics"]
        
        # Define questions
        questions = [
            {
                "text": "Two Sum",
                "description": """Given an array of integers `nums` and an integer `target`, return the indices of the two numbers such that they add up to `target`.
You may assume that each input would have exactly one solution, and you may not use the same element twice.
You can return the answer in any order.

**Input Format:**
- First line: Space-separated integers representing the array `nums`
- Second line: A single integer representing `target`

**Output Format:**
- Two space-separated integers representing the indices

**Example 1:**
Input:
2 7 11 15
9
Output:
0 1

**Example 2:**
Input:
3 2 4
6
Output:
1 2
""",
                "type": "coding",
                "difficulty": 1,
                "topic": "Arrays",
                "test_cases": [
                    {"input": "2 7 11 15\n9", "expected_output": "0 1", "hidden": False},
                    {"input": "3 2 4\n6", "expected_output": "1 2", "hidden": False},
                    {"input": "3 3\n6", "expected_output": "0 1", "hidden": True}
                ],
                "templates": {
                    "python": """def two_sum(nums, target):
    # Write your code here
    pass

import sys

# Boilerplate
if __name__ == "__main__":
    nums = list(map(int, sys.stdin.readline().split()))
    target = int(sys.stdin.readline())
    result = two_sum(nums, target)
    print(f"{result[0]} {result[1]}")
"""
                },
                "created_at": datetime.utcnow()
            },
            {
                "text": "Palindrome Number",
                "description": """Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.

**Input Format:**
- A single integer `x`

**Output Format:**
- `true` or `false`

**Example 1:**
Input:
121
Output:
true

**Example 2:**
Input:
-121
Output:
false
""",
                "type": "coding",
                "difficulty": 1,
                "topic": "Math",
                "test_cases": [
                    {"input": "121", "expected_output": "true", "hidden": False},
                    {"input": "-121", "expected_output": "false", "hidden": False},
                    {"input": "10", "expected_output": "false", "hidden": True}
                ],
                "templates": {
                    "python": """def is_palindrome(x):
    # Write your code here
    pass

import sys

if __name__ == "__main__":
    x = int(sys.stdin.readline())
    if is_palindrome(x):
        print("true")
    else:
        print("false")
"""
                },
                "created_at": datetime.utcnow()
            },
           {
                "text": "Factorial Calculator",
                "description": """Write a function to calculate the factorial of a non-negative integer `n`.

**Input Format:**
- A single non-negative integer `n`

**Output Format:**
- A single integer representing `n!`

**Example:**
Input:
5
Output:
120
""",
                "type": "coding",
                "difficulty": 1,
                "topic": "Math",
                "test_cases": [
                    {"input": "5", "expected_output": "120", "hidden": False},
                    {"input": "0", "expected_output": "1", "hidden": False},
                    {"input": "10", "expected_output": "3628800", "hidden": True}
                ],
                "templates": {
                    "python": """def factorial(n):
    # Write your code here
    return 1

import sys

if __name__ == "__main__":
    n = int(sys.stdin.readline())
    print(factorial(n))
"""
                },
                "created_at": datetime.utcnow()
            }
        ]

        print(f"Seeding {len(questions)} coding questions...")
        for q in questions:
            # Check if exists by text
            existing = db.questions.find_one({"text": q["text"], "type": "coding"})
            if existing:
                print(f"Skipping {q['text']} (already exists)")
            else:
                db.questions.insert_one(q)
                print(f"Inserted {q['text']}")
        
        print("Done!")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    seed_coding_questions()
