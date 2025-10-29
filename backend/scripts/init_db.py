import os
from datetime import datetime
from dotenv import load_dotenv
from passlib.hash import bcrypt
from pymongo import MongoClient, ASCENDING, errors  # Import errors
from urllib.parse import urlparse


def main():
    load_dotenv()
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/skillatics")

    print(f"Connecting to MongoDB: {mongo_uri}")
    try:
        # Set a short timeout to fail fast if DB is not reachable
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        # Force a connection check
        client.server_info()
    except errors.ServerSelectionTimeoutError as err:
        print(f"Error: Could not connect to MongoDB.")
        print("Please ensure MongoDB is running and the MONGO_URI is correct.")
        print(f"Details: {err}")
        return  # Exit the script

    # Determine database name: prefer explicit env, else parse from URI path, else fallback
    explicit_db = os.getenv("MONGO_DB") or os.getenv("DB_NAME") or os.getenv("MONGO_DATABASE")
    parsed = urlparse(mongo_uri)
    parsed_db = parsed.path.lstrip("/") if parsed.path and parsed.path != "/" else None
    db_name = (explicit_db or parsed_db or "skillatics").strip()
    
    print(f"Successfully connected. Using database: {db_name}")
    db = client[db_name]

    # Collections
    users = db["users"]
    questions = db["questions"]
    tests = db["tests"]

    # Indexes
    print("Ensuring indexes...")
    try:
        users.create_index([("email", ASCENDING)], unique=True, name="uniq_email")
        questions.create_index([("difficulty", ASCENDING)], name="by_difficulty")
        questions.create_index([("type", ASCENDING)], name="by_type")
        tests.create_index([("userId", ASCENDING), ("createdAt", ASCENDING)], name="by_user_created")
    except errors.OperationFailure as err:
        print(f"Error creating indexes: {err}")
        # Continue, as indexes might already exist in a conflicting way
        
    # Seed admin
    admin_email = os.getenv("ADMIN_EMAIL", "admin@skillatics.local").strip().lower()
    admin_password = os.getenv("ADMIN_PASSWORD")

    if not users.find_one({"email": admin_email}):
        if not admin_password:
            # Non-interactive friendly: allow env only; if absent, fallback to default
            admin_password = os.getenv("DEFAULT_ADMIN_PASSWORD", "ChangeMe123!")
            print("Warning: ADMIN_PASSWORD not set. Using default password.")
            
        print(f"Creating admin user {admin_email}...")
        users.insert_one({
            "email": admin_email,
            "password": bcrypt.hash(admin_password),
            "name": "Administrator",
            "role": "Admin",
            "createdAt": datetime.utcnow(),
        })
    else:
        print("Admin user already exists; skipping admin seed")

    # Seed a sample question, if none exists
    try:
        # Use modern count_documents (pymongo 3.7+)
        question_count = questions.count_documents({})
    except AttributeError:
        # Fallback for old pymongo (< 3.7)
        print("Warning: 'count_documents' not found. Using deprecated 'count()'.")
        print("Consider upgrading: pip install --upgrade pymongo")
        question_count = questions.count()
    except errors.OperationFailure as err:
        print(f"Error checking question count: {err}")
        question_count = -1 # Flag as error

    if question_count == 0:
        print("Seeding sample questions...")
        questions.insert_many([
            {"text": "2 + 2 = ?", "choices": ["3", "4", "5", "6"], "answer": 1, "difficulty": 1, "type": "math"},
            {"text": "Capital of France?", "choices": ["Paris", "London", "Berlin", "Rome"], "answer": 0, "difficulty": 1, "type": "gk"},
        ])
    elif question_count > 0:
        print("Questions already present; skipping question seed")

    print("Database initialization complete.")


if __name__ == "__main__":
    main()