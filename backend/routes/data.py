from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from bson import ObjectId

from extensions import mongo


data_bp = Blueprint("data", __name__)


@data_bp.get("/my-results")
@jwt_required()
def my_results():
    user_id = get_jwt_identity()
    cursor = mongo.db.test_results.find({"studentId": ObjectId(user_id)})
    results = []
    for r in cursor:
        r["_id"] = str(r["_id"])
        if "studentId" in r:
            r["studentId"] = str(r["studentId"])
        
        # Ensure nested ObjectIds are converted if any
        if "questionId" in r:
             r["questionId"] = str(r["questionId"])
        if "history" in r:
            for h in r["history"]:
                if "questionId" in h:
                    h["questionId"] = str(h["questionId"])
                    
        results.append(r)
    return jsonify(results)


@data_bp.get("/batch-analytics")
@jwt_required()
def batch_analytics():
    claims = get_jwt()
    role = claims.get("role")
    if role not in ["TPO", "Faculty", "Admin"]:
        return jsonify({"error": "Forbidden"}), 403

    scope = (request.args.get("scope") or "college").lower()  # college | department | division
    department = (request.args.get("department") or "").strip()
    division = (request.args.get("division") or "").strip()
    year_of_study = (request.args.get("yearOfStudy") or "").strip()

    pipeline = []
    # If filtering by department/division or role is Faculty, we need user info
    need_user_join = (scope in ["department", "division"]) or (role == "Faculty") or bool(department or division or year_of_study)
    if need_user_join:
        pipeline.append({
            "$lookup": {
                "from": "users",
                "localField": "studentId",
                "foreignField": "_id",
                "as": "student"
            }
        })
        pipeline.append({"$unwind": "$student"})
        # If Faculty, restrict to their department
        if role == "Faculty":
            fac = mongo.db.users.find_one({"_id": ObjectId(get_jwt_identity())})
            fac_dept = (fac or {}).get("department")
            if fac_dept:
                pipeline.append({"$match": {"student.department": fac_dept}})
        # TPO or Admin can optionally filter by dept/division
        match = {}
        if department:
            match["student.department"] = department
        if division:
            match["student.division"] = division
        if year_of_study:
            match["student.yearOfStudy"] = year_of_study
        if match:
            pipeline.append({"$match": match})

    pipeline.append({
        "$group": {
            "_id": None,
            "avgScore": {"$avg": "$score"},
            "tests": {"$sum": 1},
            "avgCorrect": {"$avg": "$correctQuestions"},
            "avgTotal": {"$avg": "$totalQuestions"},
        }
    })
    agg = list(mongo.db.test_results.aggregate(pipeline))
    if agg:
        out = agg[0]
        out.pop("_id", None)
        return jsonify(out)
    else:
        return jsonify({"avgScore": 0, "tests": 0, "avgCorrect": 0, "avgTotal": 0})


# Average score by topic for current student
@data_bp.get("/my-topic-averages")
@jwt_required()
def my_topic_averages():
    user_id = get_jwt_identity()
    pipeline = [
        {"$match": {"studentId": ObjectId(user_id)}},
        {"$unwind": {"path": "$history", "preserveNullAndEmptyArrays": False}},
        {"$lookup": {"from": "questions", "localField": "history.questionId", "foreignField": "_id", "as": "q"}},
        {"$unwind": "$q"},
        {"$group": {"_id": "$q.topic", "avgScore": {"$avg": "$score"}, "tests": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]
    data = list(mongo.db.test_results.aggregate(pipeline))
    out = [{"topic": d.get("_id"), "avgScore": d.get("avgScore", 0), "tests": d.get("tests", 0)} for d in data]
    return jsonify(out)


@data_bp.get("/student-stats")
@jwt_required()
def student_stats():
    claims = get_jwt()
    role = claims.get("role")
    if role not in ["TPO", "Faculty", "Admin"]:
        return jsonify({"error": "Forbidden"}), 403

    # Optional filters for TPO/Admin
    department = (request.args.get("department") or "").strip()
    division = (request.args.get("division") or "").strip()
    year_of_study = (request.args.get("yearOfStudy") or "").strip()

    pipeline = []
    pipeline.append({
        "$lookup": {
            "from": "users",
            "localField": "studentId",
            "foreignField": "_id",
            "as": "student"
        }
    })
    pipeline.append({"$unwind": "$student"})
    match = {}
    if role == "Faculty":
        fac = mongo.db.users.find_one({"_id": ObjectId(get_jwt_identity())})
        fac_dept = (fac or {}).get("department")
        if fac_dept:
            match["student.department"] = fac_dept
    else:
        if department:
            match["student.department"] = department
        if division:
            match["student.division"] = division
    if year_of_study:
        match["student.yearOfStudy"] = year_of_study
    if match:
        pipeline.append({"$match": match})

    pipeline.extend([
        {"$group": {
            "_id": "$studentId",
            "tests": {"$sum": 1},
            "avgScore": {"$avg": "$score"},
            "lastCompleted": {"$max": "$completedAt"},
        }},
        {"$sort": {"avgScore": -1}},
    ])
    rows = list(mongo.db.test_results.aggregate(pipeline))
    # Attach user names/emails
    out = []
    for r in rows:
        sid = r.get("_id")
        user = mongo.db.users.find_one({"_id": sid}) if sid else None
        out.append({
            "studentId": str(sid) if sid else None,
            "name": user.get("name") if user else None,
            "email": user.get("email") if user else None,
            "yearOfStudy": user.get("yearOfStudy") if user else None,
            "tests": r.get("tests", 0),
            "avgScore": r.get("avgScore", 0),
            "lastCompleted": r.get("lastCompleted"),
        })
    return jsonify(out)


@data_bp.get("/skill-gaps")
@jwt_required()
def skill_gaps():
    """
    Analyze student performance by topic to identify strong/weak areas.
    """
    user_id = get_jwt_identity()
    
    # Aggregation to get accuracy per topic
    pipeline = [
        {"$match": {"studentId": ObjectId(user_id)}},
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
    
    stats = list(mongo.db.test_results.aggregate(pipeline))
    
    skills = []
    for s in stats:
        topic = s["_id"] or "General"
        score = (s["totalCorrect"] / s["totalAttempted"]) * 100 if s["totalAttempted"] > 0 else 0
        
        status = "Average"
        if score >= 80: status = "Strong"
        elif score < 50: status = "Weak"
        
        skills.append({
            "topic": topic,
            "accuracy": round(score, 1),
            "questions": s["totalAttempted"],
            "difficulty": round(s.get("avgDifficulty", 0), 1),
            "status": status
        })
        
    return jsonify(skills)


@data_bp.get("/recommendations")
@jwt_required()
def recommendations():
    """
    Generate personalized learning recommendations based on recent performance.
    """
    user_id = get_jwt_identity()
    
    # 1. Get recent skills data (reuse logic or simple aggregation)
    # We'll do a quick check of last 5 tests
    recent_tests = list(mongo.db.test_results.find(
        {"studentId": ObjectId(user_id)}
    ).sort("completedAt", -1).limit(5))
    
    recommendations = []
    
    if not recent_tests:
        return jsonify([{
            "type": "general",
            "message": "Start by taking a diagnostic test to assess your skills.",
            "action": "/test"
        }])
        
    # Check for weak topics
    # (Simplified aggregation for recommendations)
    topic_performance = {}
    for t in recent_tests:
        # If granular history exists, use it
        if "history" in t:
            for h in t["history"]:
                # We need topic from question... this is slow without lookup. 
                # Optimization: Infer from test Type if granular missing, 
                # or fetch question details. For MVP, use Test Type.
                topic = t.get("type", "General") or "General"
                if topic not in topic_performance:
                     topic_performance[topic] = {"correct": 0, "total": 0}
                topic_performance[topic]["total"] += 1
                if h.get("isCorrect"):
                     topic_performance[topic]["correct"] += 1
    
    for topic, stats in topic_performance.items():
        accuracy = (stats["correct"] / stats["total"]) * 100
        if accuracy < 50:
            recommendations.append({
                "type": "weakness",
                "topic": topic,
                "message": f"Your performance in {topic} is below 50%. Focus on foundational concepts.",
                "action": f"/learn/{topic.lower().replace(' ', '-')}" # Placeholder link
            })
        elif accuracy > 85:
             recommendations.append({
                "type": "strength",
                "topic": topic,
                "message": f"You're doing great in {topic}! Try advanced difficulty questions.",
                "action": "/test"
            })

    # Check for consistency
    if len(recent_tests) >= 3:
        avg_score = sum(t.get("score", 0) for t in recent_tests) / len(recent_tests)
        if avg_score < 40:
             recommendations.append({
                "type": "general",
                "message": "Your recent scores average below 40%. Consider reviewing the study material.",
                "action": "/student/general"
            })
    
    # If no specific recommendations
    if not recommendations:
         recommendations.append({
            "type": "general",
            "message": "Maintain your streak! Take a daily practice test.",
            "action": "/test"
        })
        
    return jsonify(recommendations)
