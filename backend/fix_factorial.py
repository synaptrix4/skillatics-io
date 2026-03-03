from pymongo import MongoClient

try:
    print("Fixing Factorial Database Format...")
    client = MongoClient("mongodb+srv://synaptrix4_db_user:J9XtgV7H3xSqyfMT@skillaticscluster.nlzuvuu.mongodb.net/?retryWrites=true&w=majority&appName=SkillaticsCluster", serverSelectionTimeoutMS=5000)
    db = client.skillatics
    
    # Update Factorial Calculator to exact requirements
    db.questions.update_one(
        {"title": {"$regex": "Factorial"}},
        {"$set": {
            "function_name": "factorial",
            "input_format": "int",
            "starter_code": {
                "python": "def factorial(n):\n    # Write your solution here\n    pass",
                "javascript": "function factorial(n) {\n    // Write your solution here\n}"
            }
        }}
    )
    print("Successfully updated Factorial Database Configuration!")
except Exception as e:
    print(f"Error: {e}")
