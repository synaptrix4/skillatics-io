import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client.get_database()

for q in db.questions.find({'type': 'coding'}):
    print(f"Title: {q.get('text')} | Function: {q.get('function_name')} | Format: {q.get('input_format')}")
