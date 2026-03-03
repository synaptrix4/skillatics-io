import os
from pymongo import MongoClient
import re

client = MongoClient('mongodb://127.0.0.1:27017/')
db = client.skillatics
col = db.questions

# Patch Two Sum
col.update_many(
    {"text": {"$regex": re.compile("^two sum", re.IGNORECASE)}, "type": "coding"},
    {"$set": {
        "function_name": "twoSum",
        "input_format": "array_int, int",
        "starter_code": {
            "python": "def twoSum(nums, target):\n    # Write your solution here\n    pass\n",
            "javascript": "/**\n * @return {*}\n */\nvar twoSum = function(nums, target) {\n    // Write your solution here\n};\n",
            "java": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n    }\n}",
            "cpp": "#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your solution here\n    }\n};"
        }
    }}
)
print("Patched Two Sum")

# Patch Factorial Calculator
col.update_many(
    {"text": {"$regex": re.compile("^factorial", re.IGNORECASE)}, "type": "coding"},
    {"$set": {
        "function_name": "factorial",
        "input_format": "int",
        "starter_code": {
            "python": "def factorial(n: int):\n    # Write your solution here\n    pass\n",
            "javascript": "/**\n * @return {*}\n */\nvar factorial = function(n) {\n    // Write your solution here\n};\n",
            "java": "class Solution {\n    public int factorial(int n) {\n        // Write your solution here\n    }\n}",
            "cpp": "#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    int factorial(int n) {\n        // Write your solution here\n    }\n};"
        }
    }}
)
print("Patched Factorial Calculator")
