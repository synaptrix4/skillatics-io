import os
import sys
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

sys.path.append(os.path.join(os.getcwd(), 'backend'))

load_dotenv(os.path.join('backend', '.env'))

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client.skillatics

def test_analytics_endpoints():
    """
    Test the analytics endpoints by simulating what the frontend calls
    """
    print("=" * 80)
    print("TESTING ANALYTICS API ENDPOINTS")
    print("=" * 80)
    
    # Get all students
    students = list(db.users.find({"role": "Student"}))
    print(f"\n📊 Found {len(students)} students\n")
    
    for student in students:
        student_id = student["_id"]
        name = student.get("name", "Unknown")
        email = student.get("email", "Unknown")
        
        print(f"\n{'=' * 80}")
        print(f"Testing for: {name} ({email})")
        print(f"Student ID: {student_id}")
        print(f"{'=' * 80}")
        
        # TEST 1: /api/data/my-results
        print("\n1️⃣ Testing /api/data/my-results")
        try:
            results = list(db.test_results.find({"studentId": student_id}))
            print(f"   ✅ Found {len(results)} test results")
            if results:
                print(f"   Sample: score={results[0].get('score')}, completedAt={results[0].get('completedAt')}")
        except Exception as e:
            print(f"   ❌ ERROR: {e}")
        
        # TEST 2: /api/data/my-topic-averages
        print("\n2️⃣ Testing /api/data/my-topic-averages")
        try:
            pipeline = [
                {"$match": {"studentId": student_id}},
                {"$unwind": {"path": "$history", "preserveNullAndEmptyArrays": False}},
                {"$lookup": {"from": "questions", "localField": "history.questionId", "foreignField": "_id", "as": "q"}},
                {"$unwind": "$q"},
                {"$group": {"_id": "$q.topic", "avgScore": {"$avg": "$score"}, "tests": {"$sum": 1}}},
                {"$sort": {"_id": 1}}
            ]
            topic_data = list(db.test_results.aggregate(pipeline))
            print(f"   ✅ Found {len(topic_data)} topics")
            for topic in topic_data[:3]:
                print(f"      - {topic.get('_id')}: {topic.get('avgScore'):.1f}% ({topic.get('tests')} tests)")
        except Exception as e:
            print(f"   ❌ ERROR: {e}")
        
        # TEST 3: /api/data/skill-gaps
        print("\n3️⃣ Testing /api/data/skill-gaps")
        try:
            pipeline = [
                {"$match": {"studentId": student_id}},
                {"$unwind": "$history"},
                {"$lookup": {
                    "from": "questions",
                    "localField": "history.questionId",
                    "foreignField": "_id",
                    "as": "q"
                }},
                {"$unwind": "$q"},
                {"$group": {
                    "_id": "$q.topic",
                    "totalAttempted": {"$sum": 1},
                    "totalCorrect": {"$sum": {"$cond": [{"$eq": ["$history.isCorrect", True]}, 1, 0]}},
                    "avgDifficulty": {"$avg": "$q.difficulty"}
                }}
            ]
            skills = list(db.test_results.aggregate(pipeline))
            print(f"   ✅ Found {len(skills)} skill areas")
            for skill in skills[:3]:
                accuracy = (skill["totalCorrect"] / skill["totalAttempted"]) * 100 if skill["totalAttempted"] > 0 else 0
                print(f"      - {skill['_id']}: {accuracy:.1f}% accuracy ({skill['totalAttempted']} questions)")
        except Exception as e:
            print(f"   ❌ ERROR: {e}")
        
        # TEST 4: /api/data/recommendations
        print("\n4️⃣ Testing /api/data/recommendations")
        try:
            recent_tests = list(db.test_results.find(
                {"studentId": student_id}
            ).sort("completedAt", -1).limit(5))
            
            if not recent_tests:
                print(f"   ⚠️  No recent tests found - would show default recommendation")
            else:
                print(f"   ✅ Found {len(recent_tests)} recent tests")
                avg_score = sum(t.get("score", 0) for t in recent_tests) / len(recent_tests)
                print(f"      - Average score: {avg_score:.1f}%")
                
                # Check for topic-based recommendations
                topic_performance = {}
                for t in recent_tests:
                    if "history" in t:
                        for h in t["history"]:
                            topic = t.get("type", "General") or "General"
                            if topic not in topic_performance:
                                topic_performance[topic] = {"correct": 0, "total": 0}
                            topic_performance[topic]["total"] += 1
                            if h.get("isCorrect"):
                                topic_performance[topic]["correct"] += 1
                
                print(f"      - Topics analyzed: {len(topic_performance)}")
        except Exception as e:
            print(f"   ❌ ERROR: {e}")
    
    print("\n" + "=" * 80)
    print("CHECKING FOR COMMON ISSUES")
    print("=" * 80)
    
    # Check if questions collection has data
    question_count = db.questions.count_documents({})
    print(f"\n📚 Questions in database: {question_count}")
    
    # Check if test_results have history
    results_with_history = db.test_results.count_documents({"history": {"$exists": True, "$ne": []}})
    total_results = db.test_results.count_documents({})
    print(f"📋 Test results with history: {results_with_history}/{total_results}")
    
    # Check for ObjectId issues
    print("\n🔍 Checking for ObjectId serialization issues...")
    sample_result = db.test_results.find_one()
    if sample_result:
        print(f"   Sample result _id type: {type(sample_result['_id'])}")
        print(f"   Sample result studentId type: {type(sample_result.get('studentId'))}")
        if 'history' in sample_result and sample_result['history']:
            print(f"   Sample history questionId type: {type(sample_result['history'][0].get('questionId'))}")


if __name__ == "__main__":
    with open("analytics_test_output.txt", "w", encoding="utf-8") as f:
        sys.stdout = f
        test_analytics_endpoints()

