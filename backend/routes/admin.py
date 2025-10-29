from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from bson import ObjectId

from extensions import mongo


admin_bp = Blueprint("admin", __name__)


def is_admin() -> bool:
	claims = get_jwt()
	return claims.get("role") == "Admin"


@admin_bp.get("/users")
@jwt_required()
def list_users():
	if not is_admin():
		return jsonify({"error": "Forbidden"}), 403

	users = []
	for u in mongo.db.users.find({}, {"password": 0}):
		u["_id"] = str(u["_id"])
		users.append(u)
	return jsonify(users)


@admin_bp.post("/questions")
@jwt_required()
def add_question():
	if not is_admin():
		return jsonify({"error": "Forbidden"}), 403

	data = request.get_json(force=True)
	required = ["text", "topic", "difficulty", "type", "options", "answer"]
	if any(k not in data for k in required):
		return jsonify({"error": "Missing fields"}), 400

	if data.get("type") not in ["Aptitude", "Technical"]:
		return jsonify({"error": "Invalid type"}), 400

	try:
		difficulty = int(data.get("difficulty", 1))
	except Exception:
		return jsonify({"error": "Invalid difficulty"}), 400

	if difficulty < 1 or difficulty > 5:
		return jsonify({"error": "Invalid difficulty"}), 400

	question_doc = {
		"text": data["text"],
		"topic": data["topic"],
		"difficulty": difficulty,
		"type": data["type"],
		"options": data.get("options", []),
		"answer": data.get("answer"),
	}
	res = mongo.db.questions.insert_one(question_doc)
	return jsonify({"_id": str(res.inserted_id)}), 201


# Update user role (admin only)
@admin_bp.put("/users/<user_id>/role")
@jwt_required()
def update_user_role(user_id: str):
    if not is_admin():
        return jsonify({"error": "Forbidden"}), 403

    data = request.get_json(force=True)
    new_role = (data.get("role") or "").strip()
    if new_role not in ["Student", "TPO/Faculty", "Admin"]:
        return jsonify({"error": "Invalid role"}), 400

    try:
        res = mongo.db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"role": new_role}})
    except Exception:
        return jsonify({"error": "Bad user id"}), 400

    if res.matched_count == 0:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"ok": True})

