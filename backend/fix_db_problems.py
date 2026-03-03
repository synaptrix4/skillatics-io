from pymongo import MongoClient
import json

try:
    client = MongoClient("mongodb+srv://synaptrix4_db_user:J9XtgV7H3xSqyfMT@skillaticscluster.nlzuvuu.mongodb.net/?retryWrites=true&w=majority&appName=SkillaticsCluster", serverSelectionTimeoutMS=5000)
    db = client.skillatics
    
    coding_qs = list(db.questions.find({"type": "coding"}))
    for i, q in enumerate(coding_qs):
        print(f"\n--- Question {i} ---")
        # Print basic info to identify it
        print(f"ID: {q.get('_id')}")
        print(f"Topic: {q.get('topic')}")
        print(f"Text/Description snippet: {str(q.get('text', ''))[:50]}...")
        
        # Update based on text content
        text_lower = str(q.get('text', '')).lower()
        if 'palindrome' in text_lower:
            db.questions.update_one(
                {"_id": q["_id"]},
                {"$set": {
                    "function_name": "isPalindrome",
                    "input_format": "string",
                    "starter_code": {
                        "python": "def isPalindrome(s):\n    # Write your solution here\n    pass",
                        "javascript": "function isPalindrome(s) {\n    // Write your solution here\n}"
                    }
                }}
            )
            print("-> UPDATED to Palindrome format")
        elif 'reverse' in text_lower:
            db.questions.update_one(
                {"_id": q["_id"]},
                {"$set": {
                    "function_name": "reverseString",
                    "input_format": "string",
                    "starter_code": {
                        "python": "def reverseString(s):\n    # Write your solution here\n    pass",
                        "javascript": "function reverseString(s) {\n    // Write your solution here\n}"
                    }
                }}
            )
            print("-> UPDATED to Reverse String format")
        else:
            print("-> Left as is")
            
except Exception as e:
    print(f"Error: {e}")
