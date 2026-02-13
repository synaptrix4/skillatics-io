
import os
import sys
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

# Add backend directory to path to import extensions if needed
sys.path.append(os.path.join(os.getcwd(), 'backend'))

load_dotenv(os.path.join('backend', '.env'))

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    print("MONGO_URI not found in .env")
    sys.exit(1)

client = MongoClient(MONGO_URI)
db = client.skillatics

def check_analytics_data():
    print("--- Checking Analytics Data ---")
    
    # 1. List Students
    students = list(db.users.find({"role": "Student"}))
    print(f"Found {len(students)} students.")
    
    total_results = db.test_results.count_documents({})
    print(f"Total test_results in DB: {total_results}")
    
    for student in students:
        sid = student["_id"]
        name = student.get("name", "Unknown")
        email = student.get("email", "Unknown")
        
        # Count results
        count = db.test_results.count_documents({"studentId": sid})
        print(f"Student: {name} ({email}) - ID: {sid} - Results: {count}")
        
    # 2. Check if there are results with NO studentId or invalid ones
    orphaned = 0
    formatted_results = list(db.test_results.find({}, {"studentId": 1}))
    for r in formatted_results:
        if "studentId" not in r:
            orphaned += 1
            
    print(f"Orphaned results (no studentId): {orphaned}")

if __name__ == "__main__":
    # Redirect stdout to a file
    with open("analytics_debug.txt", "w", encoding="utf-8") as f:
        sys.stdout = f
        check_analytics_data()
