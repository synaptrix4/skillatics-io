from datetime import datetime
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from bson import ObjectId

from extensions import mongo


topics_bp = Blueprint("topics", __name__)


def _require_student():
    claims = get_jwt()
    return claims.get("role") == "Student"


@topics_bp.get("/topics")
@jwt_required()
def list_topics():
    if not _require_student():
        return jsonify({"error": "Forbidden"}), 403

    cursor = mongo.db.topics.find({}).sort("name", 1)
    general = []
    technical = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"]) if doc.get("_id") else None
        cat = doc.get("category") or ""
        if cat == "General Aptitude":
            general.append(doc)
        elif cat == "Technical Aptitude":
            technical.append(doc)
    return jsonify({
        "generalAptitude": general,
        "technicalAptitude": technical,
    })


@topics_bp.get("/topics/<topic_id>")
@jwt_required()
def get_topic(topic_id: str):
    if not _require_student():
        return jsonify({"error": "Forbidden"}), 403

    try:
        obj_id = ObjectId(topic_id)
    except Exception:
        return jsonify({"error": "Bad topic id"}), 400

    doc = mongo.db.topics.find_one({"_id": obj_id})
    if not doc:
        return jsonify({"error": "Not found"}), 404
    # Serialize
    doc["_id"] = str(doc["_id"]) if doc.get("_id") else None
    return jsonify({
        "_id": doc.get("_id"),
        "name": doc.get("name"),
        "category": doc.get("category"),
        "theory": doc.get("theory", ""),
        "shortcuts": doc.get("shortcuts", ""),
    })


@topics_bp.get("/topics/<topic_id>/questions")
@jwt_required()
def get_topic_questions(topic_id: str):
    if not _require_student():
        return jsonify({"error": "Forbidden"}), 403

    try:
        obj_id = ObjectId(topic_id)
    except Exception:
        return jsonify({"error": "Bad topic id"}), 400

    topic = mongo.db.topics.find_one({"_id": obj_id})
    if not topic:
        return jsonify([])

    name = topic.get("name")
    rows = []
    for q in mongo.db.questions.find({"topic": name}):
        q["_id"] = str(q["_id"]) if q.get("_id") else None
        rows.append({
            "_id": q.get("_id"),
            "text": q.get("text"),
            "options": q.get("options", []),
            "answer": q.get("answer"),
            "topic": q.get("topic"),
        })
    return jsonify(rows)


