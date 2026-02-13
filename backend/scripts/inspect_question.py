import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

# Function to get a JWT token for a student
def get_student_token():
    # Login as student (using a known seeded student or create one)
    # For now, let's try to login as 'mikaran@example.com' if it exists, or register
    # Simulating login flow is hard without running app.
    # Let's just create a token manually if possible or use a known one?
    # Actually, simpler to just use the backend code to generating a token for a user.
    pass

# We'll just Inspect the DB directly to see what the 'random question' looks like
from pymongo import MongoClient

def inspect_question_format():
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/skillatics")
    client = MongoClient(mongo_uri)
    try:
        db = client.get_database()
    except:
        db = client["skillatics"]
    if db.name is None: db = client["skillatics"]

    q = db.questions.findOne({"type": "coding"})
    if q:
        # Convert ObjectId to str for printing
        q['_id'] = str(q['_id'])
        print(json.dumps(q, indent=2, default=str))
    else:
        print("No coding questions found.")

if __name__ == "__main__":
    inspect_question_format()
