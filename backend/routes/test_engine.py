from datetime import datetime
from typing import Optional
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from bson import ObjectId

from extensions import mongo
from services.ai_generator import QuestionGenerator
from services.gamification import (
    calculate_xp_reward,
    update_user_xp,
    check_and_award_achievements
)

test_bp = Blueprint("test", __name__)

def _get_adaptive_test_pool(user_id, topic: str) -> list[dict]:
    """
    Generates a pool of 10-15 questions, prioritizing existing DB questions 
    the user hasn't seen, and generating new ones via AI only if needed.
    """
    pool = []
    
    # Configuration: (Difficulty, Count)
    stages = [
        (1, 4), # Easy
        (2, 2), # Easy-Medium
        (3, 3), # Medium
        (4, 2), # Medium-Hard
        (5, 2)  # Hard
    ]
    # Total ~13 questions in pool to allow for adaptive paths
    
    # 1. Get IDs of questions user has already seen
    pipeline = [
        {"$match": {"studentId": ObjectId(user_id)}},
        {"$project": {"history.questionId": 1}},
        {"$unwind": "$history"}
    ]
    seen_cursor = mongo.db.test_results.aggregate(pipeline)
    seen_ids = {str(doc["history"]["questionId"]) for doc in seen_cursor}
    
    print(f"[Adaptive] User {user_id} has seen {len(seen_ids)} questions.")

    for diff, count in stages:
        # Try to fetch from DB first
        db_candidates = list(mongo.db.questions.aggregate([
            {"$match": {
                "topic": topic, 
                "difficulty": diff,
                "_id": {"$nin": [ObjectId(sid) for sid in seen_ids]}
            }},
            {"$sample": {"size": count}}
        ]))
        
        # Convert ObjectId to string for consistency
        for q in db_candidates:
            q["_id"] = str(q["_id"])
            if q["_id"] not in seen_ids: # Double check
                pool.append(q)
                seen_ids.add(q["_id"]) # Mark as seen for this session generation
        
        needed = count - len(db_candidates)
        
        if needed > 0:
            print(f"[Adaptive] Generating {needed} new questions for Diff {diff}...")
            try:
                new_batch = QuestionGenerator.generate_batch(topic, diff, count=needed)
                for q in new_batch:
                    # Insert new question
                    res = mongo.db.questions.insert_one(q)
                    q["_id"] = str(res.inserted_id)
                    pool.append(q)
            except Exception as e:
                print(f"[Adaptive] Generation failed: {e}")
                # We continue, hopefully we have enough other questions
    
    return pool

@test_bp.post("/start")
@jwt_required()
def start_test():
    claims = get_jwt()
    if claims.get("role") != "Student":
        return jsonify({"error": "Forbidden"}), 403
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}
    
    # 1. Determine Type/Topic
    legacy_map = {
        "Aptitude": "General Aptitude",
        "Technical": "Technical Aptitude",
    }
    raw_type = (data.get("type") or "").strip()
    normalized = legacy_map.get(raw_type, raw_type)
    type_filter = normalized if normalized in ["General Aptitude", "Technical Aptitude"] else None
    
    topic = type_filter if type_filter else "Mixed Aptitude"

    # 2. Get Adaptive Pool
    pool = _get_adaptive_test_pool(user_id, topic)
    
    if not pool:
         return jsonify({"error": "Failed to generate test questions. Please try again."}), 500

    pool_ids = [q["_id"] for q in pool]
    
    # 3. Select First Question (Lowest Difficulty)
    # Sort pool by difficulty to find easiest
    pool.sort(key=lambda x: x.get("difficulty", 1))
    first_question = pool[0]
    
    # 4. Create Session
    session_doc = {
        "userId": ObjectId(user_id),
        "currentDifficulty": first_question.get("difficulty", 1), 
        "history": [],
        "adaptivePath": [first_question.get("difficulty", 1)],
        "questionPool": pool_ids,     # Available questions for this session
        "usedQuestionIds": [first_question["_id"]], # Track what we've used in THIS session
        "currentQuestionId": first_question["_id"],
        "maxQuestions": 10,           # Fixed length test
        "type": type_filter,
        "startedAt": datetime.utcnow(),
    }

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

    # Validate Question
    q = mongo.db.questions.find_one({"_id": ObjectId(question_id)})
    if not q:
        return jsonify({"error": "Question not found"}), 404

    is_correct = (selected == q.get("answer"))
    
    # Update History
    history_item = {
        "questionId": question_id,
        "isCorrect": is_correct,
        "selected": selected,
        "difficulty": q.get("difficulty", 1)
    }
    
    # --- ADAPTIVE PROGRESSION LOGIC ---
    history = session.get("history", [])
    new_history = history + [history_item]
    
    questions_answered = len(new_history)
    max_questions = session.get("maxQuestions", 10)
    
    if questions_answered >= max_questions:
        session["history"] = new_history
        return _conclude_test_session(session, user_id)

    # 1. Update Difficulty
    current_diff = session.get("currentDifficulty", 1)
    if is_correct:
        next_diff = min(5, current_diff + 1)
    else:
        next_diff = max(1, current_diff - 1)
        
    # 2. Select Next Question from Pool or DB
    pool_ids = session.get("questionPool", [])
    used_ids = set(session.get("usedQuestionIds", []))
    used_ids.add(question_id) # Ensure current is marked used
    
    # Try to find in current pool first (fastest)
    # We need to fetch question docs for the pool IDs to check difficulty
    # Optimization: Maybe store simplified pool objects in session? 
    # For now, let's query DB for candidates in the pool
    
    candidate = mongo.db.questions.find_one({
        "_id": {"$in": [ObjectId(pid) for pid in pool_ids]},
        "difficulty": next_diff,
        "$and": [{"_id": {"$nin": [ObjectId(uid) for uid in used_ids]}}]
    })
    
    # Fallback 1: Relax difficulty (+/- 1)
    if not candidate:
        candidate = mongo.db.questions.find_one({
            "_id": {"$in": [ObjectId(pid) for pid in pool_ids]},
            "difficulty": {"$in": [next_diff - 1, next_diff + 1]},
            "$and": [{"_id": {"$nin": [ObjectId(uid) for uid in used_ids]}}]
        })
        
    # Fallback 2: Any unused from pool
    if not candidate:
        candidate = mongo.db.questions.find_one({
            "_id": {"$in": [ObjectId(pid) for pid in pool_ids]},
            "$and": [{"_id": {"$nin": [ObjectId(uid) for uid in used_ids]}}]
        })
        
    # Fallback 3: Global DB Search (if pool exhausted/malformed)
    if not candidate:
         candidate = mongo.db.questions.find_one({
            "topic": q.get("topic"), # Stick to same topic
            "difficulty": next_diff,
             "_id": {"$nin": [ObjectId(uid) for uid in used_ids]}
         })

    if not candidate:
        # Emergency exit if absolutely no questions left
        session["history"] = new_history
        return _conclude_test_session(session, user_id)

    # Prepare for next turn
    next_q_id = str(candidate["_id"])
    next_diff = candidate.get("difficulty", 3)
    
    mongo.db.test_sessions.update_one(
        {"_id": ObjectId(session["_id"])},
        {
            "$set": {
                "currentDifficulty": next_diff,
                "currentQuestionId": next_q_id
            },
            "$push": {
                "history": history_item,
                "adaptivePath": next_diff,
                "usedQuestionIds": next_q_id
            }
        }
    )

    return jsonify({
        "status": "continue",
        "question": {
            "_id": next_q_id,
            "text": candidate.get("text"),
            "options": candidate.get("options"),
            "difficulty": next_diff
        },
        "nextIndex": questions_answered, # 0-indexed count of completed
        "total": max_questions
    })


@test_bp.post("/finish")
@jwt_required()
def finish_test_early():
    claims = get_jwt()
    if claims.get("role") != "Student":
        return jsonify({"error": "Forbidden"}), 403
    user_id = get_jwt_identity()
    data = request.get_json(force=True, silent=True) or {}
    session_id = data.get("sessionId")
    
    if not session_id:
        return jsonify({"error": "Missing sessionId"}), 400

    try:
        session = mongo.db.test_sessions.find_one({"_id": ObjectId(session_id), "userId": ObjectId(user_id)})
    except Exception:
        return jsonify({"error": "Invalid Session ID format"}), 400

    if not session:
        return jsonify({"error": "Session not found"}), 404

    return _conclude_test_session(session, user_id)


def _conclude_test_session(session, user_id):
    history = session.get("history", [])
    total = len(history)
    correct_count = sum(1 for h in history if h.get("isCorrect"))
    score = round(100.0 * correct_count / max(1, total), 2) if total > 0 else 0

    # Build detailed review
    review_data = []
    avg_difficulty = 0
    for h_item in history:
        qid = h_item.get("questionId")
        if not qid: continue
        q_oid = ObjectId(qid) if isinstance(qid, str) else qid
        q_doc = mongo.db.questions.find_one({"_id": q_oid})
        if q_doc:
            avg_difficulty += q_doc.get("difficulty", 3)
            review_data.append({
                "text": q_doc.get("text"),
                "options": q_doc.get("options"),
                "correctAnswer": q_doc.get("answer"),
                "selectedAnswer": h_item.get("selected"),
                "isCorrect": h_item.get("isCorrect")
            })
    
    avg_difficulty = avg_difficulty / max(1, len(history))
    
    # Calculate test duration
    started_at = session.get("startedAt")
    time_taken_sec = 0
    if started_at:
        time_taken_sec = int((datetime.utcnow() - started_at).total_seconds())
    
    # 🎮 GAMIFICATION: Calculate XP Reward
    xp_earned = calculate_xp_reward(
        score=score,
        total_questions=total,
        difficulty_avg=avg_difficulty,
        time_taken_sec=time_taken_sec
    )
    
    # Award XP to user
    xp_update = update_user_xp(user_id, xp_earned)
    
    # Check for new achievements
    new_achievements = check_and_award_achievements(user_id)
    
    # Persist final result
    result_doc = {
        "studentId": ObjectId(user_id) if isinstance(user_id, str) else user_id,
        "score": score,
        "totalQuestions": total,
        "correctQuestions": correct_count,
        "adaptivePath": session.get("adaptivePath", []),
        "history": history,
        "questionsReview": review_data,
        "completedAt": datetime.utcnow(),
        "type": session.get("type"),
        "xpEarned": xp_earned,
        "timeTakenSeconds": time_taken_sec
    }
    mongo.db.test_results.insert_one(result_doc)
    mongo.db.test_sessions.delete_one({"_id": session["_id"]})

    return jsonify({
        "status": "complete",
        "score": score,
        "totalQuestions": total,
        "correctQuestions": correct_count,
        "questionsReview": review_data,
        "gamification": {
            "xp_earned": xp_earned,
            "new_xp": xp_update.get("new_xp", 0) if xp_update else 0,
            "new_level": xp_update.get("new_level", 1) if xp_update else 1,
            "leveled_up": xp_update.get("leveled_up", False) if xp_update else False,
            "xp_for_next_level": xp_update.get("xp_for_next_level", 100) if xp_update else 100,
            "new_achievements": new_achievements
        }
    })
