from datetime import datetime
from typing import Optional
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from bson import ObjectId

from extensions import mongo


def _find_next_question(difficulty: int, exclude_ids: list[str], qtype: Optional[str] = None):
    query = {"difficulty": difficulty}
    if qtype:
        query["type"] = qtype
    if exclude_ids:
        query["_id"] = {"$nin": [ObjectId(_id) for _id in exclude_ids]}
    q = mongo.db.questions.find_one(query)
    if not q:
        return None
    q["_id"] = str(q["_id"])
    return q


test_bp = Blueprint("test", __name__)


@test_bp.post("/start")
@jwt_required()
def start_test():
    claims = get_jwt()
    if claims.get("role") != "Student":
        return jsonify({"error": "Forbidden"}), 403
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}
    # Normalize legacy type values
    legacy_map = {
        "Aptitude": "General Aptitude",
        "Technical": "Technical Aptitude",
    }
    raw_type = (data.get("type") or "").strip()
    normalized = legacy_map.get(raw_type, raw_type)
    type_filter = normalized if normalized in ["General Aptitude", "Technical Aptitude"] else None

    # Create session doc
    session_doc = {
        "userId": ObjectId(user_id),
        "currentDifficulty": 2,
        "history": [],
        "adaptivePath": [2],
        "askedQuestionIds": [],
        "type": type_filter,
        "startedAt": datetime.utcnow(),
    }

    first_question = _find_next_question(2, [], type_filter)
    if not first_question:
        return jsonify({"error": "No questions available for difficulty 2"}), 404

    session_doc["askedQuestionIds"].append(first_question["_id"])
    res = mongo.db.test_sessions.insert_one(session_doc)

    return jsonify({
        "sessionId": str(res.inserted_id),
        "question": first_question,
    })


@test_bp.post("/submit")
@jwt_required()
def submit_answer():
    claims = get_jwt()
    if claims.get("role") != "Student":
        return jsonify({"error": "Forbidden"}), 403
    user_id = get_jwt_identity()
    data = request.get_json(force=True)
    session_id = data.get("sessionId")
    question_id = data.get("questionId")
    selected = data.get("selectedOption")

    if not session_id or not question_id or selected is None:
        return jsonify({"error": "Missing fields"}), 400

    session = mongo.db.test_sessions.find_one({"_id": ObjectId(session_id), "userId": ObjectId(user_id)})
    if not session:
        return jsonify({"error": "Session not found"}), 404

    q = mongo.db.questions.find_one({"_id": ObjectId(question_id)})
    if not q:
        return jsonify({"error": "Question not found"}), 404

    is_correct = (selected == q.get("answer"))
    current_diff = int(session.get("currentDifficulty", 2))
    new_diff = max(1, min(5, current_diff + (1 if is_correct else -1)))

    # Update session history
    history_item = {
        "questionId": question_id,
        "isCorrect": is_correct,
        "newDifficulty": new_diff,
    }
    adaptive_path = list(session.get("adaptivePath", [])) + [new_diff]
    asked = list(session.get("askedQuestionIds", []))
    if question_id not in asked:
        asked.append(question_id)

    # Get next question at new difficulty
    next_question = _find_next_question(new_diff, asked, session.get("type"))

    # Simple stopping rule: stop after 10 questions or if no next question
    finished = (len(asked) >= 10) or (next_question is None)

    if finished:
        correct_count = sum(1 for h in session.get("history", []) if h.get("isCorrect")) + (1 if is_correct else 0)
        total = len(session.get("history", [])) + 1
        score = round(100.0 * correct_count / max(1, total), 2)

        # Persist final result
        result_doc = {
            "studentId": ObjectId(user_id),
            "score": score,
            "totalQuestions": total,
            "correctQuestions": correct_count,
            "adaptivePath": adaptive_path,
            "history": list(session.get("history", [])) + [history_item],
            "completedAt": datetime.utcnow(),
            "type": session.get("type") # Also save the type of test
        }
        mongo.db.test_results.insert_one(result_doc)

        # Cleanup session
        mongo.db.test_sessions.delete_one({"_id": ObjectId(session["_id"])})

        return jsonify({
            "status": "complete",
            "score": score,
            "totalQuestions": total,
            "correctQuestions": correct_count,
        })

    # Otherwise continue test
    mongo.db.test_sessions.update_one(
        {"_id": ObjectId(session["_id"])},
        {"$set": {"currentDifficulty": new_diff, "adaptivePath": adaptive_path},
         "$push": {"history": history_item}},
    )

    # Mark next question as asked in session state
    # We must do this *after* finding the next question, but before returning it
    if next_question:
        asked.append(next_question["_id"])
        mongo.db.test_sessions.update_one(
            {"_id": ObjectId(session["_id"])},
            {"$set": {"askedQuestionIds": asked}},
        )

    return jsonify({
        "status": "continue",
        "question": next_question,
        "nextDifficulty": new_diff,
    })
