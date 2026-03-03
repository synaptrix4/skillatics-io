import json
from pymongo import MongoClient

try:
    # Use the URI from app.py to connect locally
    client = MongoClient("mongodb+srv://anishyadav:Kaka1234@cluster0.o8tyg.mongodb.net/skillatics?retryWrites=true&w=majority", serverSelectionTimeoutMS=5000)
    db = client.skillatics
    
    with open('example_question_twosum.json', 'r') as f:
        q_data = json.load(f)
        
    q_data["type"] = "coding"
    
    # Check if already exists
    existing = db.questions.find_one({"title": "Two Sum", "type": "coding"})
    if existing:
        print("Updating existing Two Sum question...")
        db.questions.update_one({"_id": existing["_id"]}, {"$set": q_data})
        print("Updated!")
    else:
        print("Inserting new Two Sum question...")
        db.questions.insert_one(q_data)
        print("Inserted!")
        
except Exception as e:
    print("Failed to seed question:", e)
    
    print("\nTrying local mongo fallback...")
    try:
        client = MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=5000)
        db = client.skillatics
        with open('example_question_twosum.json', 'r') as f:
            q_data = json.load(f)
        q_data["type"] = "coding"
        existing = db.questions.find_one({"title": "Two Sum", "type": "coding"})
        if existing:
            db.questions.update_one({"_id": existing["_id"]}, {"$set": q_data})
            print("Local update success!")
        else:
            db.questions.insert_one(q_data)
            print("Local insert success!")
    except Exception as e2:
        print("Local fallback failed:", e2)
