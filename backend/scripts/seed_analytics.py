import os
import sys
import random
from datetime import datetime, timedelta
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

def seed_analytics():
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
            
        # Find all students
        students = list(db.users.find({"role": "Student"}))
        if not students:
            print("No student users found! Please register a student first.")
            return

        print(f"Found {len(students)} students. Seeding analytics for all...")
        
        # Questions (get some IDs)
        question_ids = []
        try:
             question_ids = [q["_id"] for q in db.questions.find().limit(20)]
        except:
             pass

        total_seeded = 0
        
        for student in students:
            student_id = student["_id"]
            name = student.get("name", "Unknown")
            
            # Check if already seeded
            existing_count = db.test_results.count_documents({"studentId": student_id})
            if existing_count >= 5:
                print(f"Skipping {name} (already has {existing_count} results)")
                continue
                
            print(f"Seeding data for {name}...")
            
            results = []
            base_date = datetime.utcnow() - timedelta(days=30)
            topics = ["Mathematics", "Physics", "Computer Science", "General Knowledge"]
            
            # Generate 15 results
            for i in range(15):
                score = random.choice([40, 50, 60, 70, 80, 90, 100])
                # Add some randomness to score
                score = max(0, min(100, score + random.randint(-10, 10)))
                
                completed_at = base_date + timedelta(days=i*2, hours=random.randint(0, 23))
                
                # Simple result structure matching StudentDashboard expectations
                result = {
                    "studentId": student_id,
                    "score": score,
                    "totalQuestions": 10,
                    "correctQuestions": int(score / 10),
                    "type": random.choice(topics), 
                    "completedAt": completed_at,
                    "timeTaken": random.randint(300, 1800),
                    "adaptivePath": [random.randint(1, 5) for _ in range(10)], # difficulty levels
                    "history": [] 
                }
                
                # Add some dummy history if questions exist
                if question_ids:
                    # Pick random questions
                    temp_ids = random.sample(question_ids, min(len(question_ids), 10))
                    correct_count = 0
                    result["history"] = []
                    
                    for q_id in temp_ids:
                        is_correct = random.random() < (score / 100)
                        if is_correct: correct_count += 1
                        
                        result["history"].append({
                            "questionId": q_id,
                            "selectedOption": "A",
                            "isCorrect": is_correct,
                            "timeTaken": random.randint(10, 60)
                        })
                    
                    # Update counts based on history
                    result["correctQuestions"] = correct_count
                    result["totalQuestions"] = len(temp_ids)
                    result["score"] = int((correct_count / len(temp_ids)) * 100)
                
                results.append(result)

            if results:
                db.test_results.insert_many(results)
                print(f"  Inserted {len(results)} records for {name}.")
                total_seeded += len(results)
            
        print(f"Done! Total new records: {total_seeded}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    seed_analytics()
