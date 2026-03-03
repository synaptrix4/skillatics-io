import os
from pymongo import MongoClient

client = MongoClient('mongodb://127.0.0.1:27017/')
db = client.skillatics

for q in db.questions.find({'type': 'coding'}):
    print(f"Title: {q.get('text')} | Function: {q.get('function_name')} | Format: {q.get('input_format')}")
