import os
import sys
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

def check_db_content():
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/skillatics")
    print(f"Connecting to {mongo_uri}...")
    
    try:
        client = MongoClient(mongo_uri)
        try:
            db = client.get_database()
        except:
            db = client["skillatics"]
        
        if db.name is None:
            db = client["skillatics"]
        
        # Check Coding Questions
        coding_count = db.questions.count_documents({"type": "coding"})
        print(f"\nCoding Questions Found: {coding_count}")
        if coding_count > 0:
            for q in db.questions.find({"type": "coding"}).limit(1):
                print(f"- {q.get('text')} (Diff: {q.get('difficulty')})")
        
        # Check Test Results (for analytics)
        results_count = db.test_results.count_documents({})
        print(f"\nTotal Test Results Found: {results_count}")
        
        if results_count > 0:
            print("Sample Test Result:")
            sample = db.test_results.find_one()
            print(f"- Score: {sample.get('score')}")
            print(f"- CompletedAt: {sample.get('completedAt')}")
            print(f"- Type: {type(sample.get('score'))}")
            print(f"- StudentId: {sample.get('studentId')}")
            
        # List Students
        print("\nStudent Users:")
        for u in db.users.find({"role": "Student"}).limit(5):
             print(f"- {u.get('name')} ({u.get('email')}) ID: {u.get('_id')}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_db_content()
