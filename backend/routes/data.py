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
        r["studentId"] = str(r["studentId"]) if r.get("studentId") else None
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

    pipeline = []
    # If filtering by department/division or role is Faculty, we need user info
    need_user_join = (scope in ["department", "division"]) or (role == "Faculty") or (department or division)
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
            "tests": r.get("tests", 0),
            "avgScore": r.get("avgScore", 0),
            "lastCompleted": r.get("lastCompleted"),
        })
    return jsonify(out)
