from flask import Blueprint, jsonify
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
	if claims.get("role") not in ["TPO/Faculty", "Admin"]:
		return jsonify({"error": "Forbidden"}), 403

	pipeline = [
		{"$group": {
			"_id": None,
			"avgScore": {"$avg": "$score"},
			"tests": {"$sum": 1},
			"avgCorrect": {"$avg": "$correctQuestions"},
			"avgTotal": {"$avg": "$totalQuestions"},
		}},
	]
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

