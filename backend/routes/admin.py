from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from bson import ObjectId
from extensions import mongo
from datetime import datetime


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

    # Normalize legacy types
    # This is the line (around 41 in your original) that caused the error.
    # It's now correctly indented at the same level as the 'required' check.
    incoming_type = (data.get("type") or "").strip()
    legacy_map = {
        "Aptitude": "General Aptitude",
        "Technical": "Technical Aptitude",
    }
    qtype = legacy_map.get(incoming_type, incoming_type)
    if qtype not in ["General Aptitude", "Technical Aptitude"]:
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
        "type": qtype,
        "options": data.get("options", []),
        "answer": data.get("answer"),
    }
    res = mongo.db.questions.insert_one(question_doc)
    return jsonify({"_id": str(res.inserted_id)}), 201


@admin_bp.post("/questions/csv")
@jwt_required()
def upload_questions_csv():
    if not is_admin():
        return jsonify({"error": "Forbidden"}), 403

    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if not file or file.filename == "":
        return jsonify({"error": "Empty file"}), 400

    # Expect CSV header with columns: text,topic,difficulty,type,options,answer
    # options should be pipe-separated: opt1|opt2|opt3
    import csv, io
    try:
        stream = io.StringIO(file.stream.read().decode("utf-8"))
    except Exception:
        return jsonify({"error": "Unable to read CSV (expecting UTF-8)"}), 400

    reader = csv.DictReader(stream)
    required_cols = {"text", "topic", "difficulty", "type", "options", "answer"}
    if not required_cols.issubset(set([c.strip() for c in (reader.fieldnames or [])])):
        return jsonify({"error": "CSV must include columns: text, topic, difficulty, type, options, answer"}), 400

    legacy_map = {
        "Aptitude": "General Aptitude",
        "Technical": "Technical Aptitude",
    }
    inserted = 0
    errors = []
    for idx, row in enumerate(reader, start=2):  # start=2 accounting header row as 1
        try:
            text = (row.get("text") or "").strip()
            topic = (row.get("topic") or "").strip()
            raw_diff = (row.get("difficulty") or "").strip()
            raw_type = (row.get("type") or "").strip()
            options_raw = (row.get("options") or "").strip()
            answer = (row.get("answer") or "").strip()

            if not text or not topic or not raw_diff or not raw_type or not options_raw or not answer:
                raise ValueError("Missing required fields")

            try:
                difficulty = int(raw_diff)
            except Exception:
                raise ValueError("Invalid difficulty")
            if difficulty < 1 or difficulty > 5:
                raise ValueError("Invalid difficulty range (1-5)")

            qtype = legacy_map.get(raw_type, raw_type)
            if qtype not in ["General Aptitude", "Technical Aptitude"]:
                raise ValueError("Invalid type")

            options = [o.strip() for o in options_raw.split("|") if o.strip()]
            if len(options) < 2:
                raise ValueError("At least two options required")
            if answer not in options:
                raise ValueError("Answer must be match one of the options exactly")

            doc = {
                "text": text,
                "topic": topic,
                "difficulty": difficulty,
                "type": qtype,
                "options": options,
                "answer": answer,
            }
            mongo.db.questions.insert_one(doc)
            inserted += 1
        except Exception as e:
            errors.append({"row": idx, "error": str(e)})

    return jsonify({"inserted": inserted, "errors": errors}), 201


# --- Topics CRUD (Admin) ---
@admin_bp.get("/topics")
@jwt_required()
def list_topics_admin():
    if not is_admin():
        return jsonify({"error": "Forbidden"}), 403
    items = []
    for doc in mongo.db.topics.find({}).sort("name", 1):
        doc["_id"] = str(doc["_id"])
        items.append(doc)
    return jsonify(items)


@admin_bp.post("/topics")
@jwt_required()
def create_topic():
    if not is_admin():
        return jsonify({"error": "Forbidden"}), 403
    data = request.get_json(force=True)
    name = (data.get("name") or "").strip()
    category = (data.get("category") or "").strip()
    if category not in ["General Aptitude", "Technical Aptitude"]:
        return jsonify({"error": "Invalid category"}), 400
    if not name:
        return jsonify({"error": "Name required"}), 400
    doc = {
        "name": name,
        "category": category,
        "theory": data.get("theory", ""),
        "shortcuts": data.get("shortcuts", ""),
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
    }
    res = mongo.db.topics.insert_one(doc)
    return jsonify({"_id": str(res.inserted_id)}), 201


@admin_bp.put("/topics/<topic_id>")
@jwt_required()
def update_topic(topic_id: str):
    if not is_admin():
        return jsonify({"error": "Forbidden"}), 403
    try:
        oid = ObjectId(topic_id)
    except Exception:
        return jsonify({"error": "Bad topic id"}), 400
    data = request.get_json(force=True)
    updates = {}
    if "name" in data:
        updates["name"] = (data.get("name") or "").strip()
    if "category" in data:
        cat = (data.get("category") or "").strip()
        if cat not in ["General Aptitude", "Technical Aptitude"]:
            return jsonify({"error": "Invalid category"}), 400
        updates["category"] = cat
    if "theory" in data:
        updates["theory"] = data.get("theory") or ""
    if "shortcuts" in data:
        updates["shortcuts"] = data.get("shortcuts") or ""
    updates["updatedAt"] = datetime.utcnow()
    res = mongo.db.topics.update_one({"_id": oid}, {"$set": updates})
    if res.matched_count == 0:
        return jsonify({"error": "Not found"}), 404
    return jsonify({"ok": True})


@admin_bp.delete("/topics/<topic_id>")
@jwt_required()
def delete_topic(topic_id: str):
    if not is_admin():
        return jsonify({"error": "Forbidden"}), 403
    try:
        oid = ObjectId(topic_id)
    except Exception:
        return jsonify({"error": "Bad topic id"}), 400
    mongo.db.topics.delete_one({"_id": oid})
    return jsonify({"ok": True})


# Update user role (admin only)
@admin_bp.put("/users/<user_id>/role")
@jwt_required()
def update_user_role(user_id: str):
    if not is_admin():
        return jsonify({"error": "Forbidden"}), 403

    data = request.get_json(force=True)
    new_role = (data.get("role") or "").strip()
    
    # Debug logging
    print(f"[DEBUG] Received role change request: role='{new_role}', type={type(new_role)}")
    
    if new_role not in ["Student", "Faculty", "TPO", "Admin"]:
        print(f"[DEBUG] Role validation failed. Received: '{new_role}'")
        return jsonify({"error": f"Invalid role: '{new_role}'"}), 400

    try:
        res = mongo.db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"role": new_role}})
    except Exception as e:
        print(f"[DEBUG] Database error: {e}")
        return jsonify({"error": "Bad user id"}), 400

    if res.matched_count == 0:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"ok": True})


# Update user department (admin only)
@admin_bp.put("/users/<user_id>/department")
@jwt_required()
def update_user_department(user_id: str):
    if not is_admin():
        return jsonify({"error": "Forbidden"}), 403

    data = request.get_json(force=True)
    dept = (data.get("department") or "").strip()
    if not dept:
        return jsonify({"error": "Department required"}), 400
    try:
        res = mongo.db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"department": dept, "updatedAt": datetime.utcnow()}})
    except Exception:
        return jsonify({"error": "Bad user id"}), 400
    if res.matched_count == 0:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"ok": True})


# --- AI Generation ---
from services.ai_generator import QuestionGenerator

@admin_bp.post("/generate-questions")
@jwt_required()
def generate_questions():
    if not is_admin():
        return jsonify({"error": "Forbidden"}), 403

    data = request.get_json(force=True)
    topic = (data.get("topic") or "").strip()
    try:
        difficulty = int(data.get("difficulty", 3))
        count = int(data.get("count", 5))
    except:
        return jsonify({"error": "Invalid numbers"}), 400

    if not topic:
        return jsonify({"error": "Topic required"}), 400

    # Cap count
    count = max(1, min(count, 10))

    try:
        questions = QuestionGenerator.generate_batch(topic, difficulty, count)
        
        inserted_ids = []
        for q in questions:
            res = mongo.db.questions.insert_one(q)
            inserted_ids.append(str(res.inserted_id))
            
        return jsonify({
            "ok": True, 
            "generated": len(questions),
            "ids": inserted_ids
        })
    except Exception as e:
        print(f"Generation error: {e}")
        return jsonify({"error": str(e)}), 500
