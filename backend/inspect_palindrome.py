from pymongo import MongoClient

try:
    print("Checking local db...")
    client = MongoClient("mongodb+srv://synaptrix4_db_user:J9XtgV7H3xSqyfMT@skillaticscluster.nlzuvuu.mongodb.net/?retryWrites=true&w=majority&appName=SkillaticsCluster", serverSelectionTimeoutMS=5000)
    db = client.skillatics
    
    q = db.questions.find_one({"title": "Palindrome Number"})
    if q:
        print("Test cases:", q.get("test_cases"))
except Exception as e:
    print(f"Error: {e}")
