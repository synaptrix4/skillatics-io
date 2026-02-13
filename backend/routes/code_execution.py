# Backend Routes - Code Execution
# Handles code execution for coding questions
# Updated to use Piston API for free code execution

import os
import requests
import time
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from bson import ObjectId
from datetime import datetime
from .code_wrapper import wrap_user_code_with_test_harness

from extensions import mongo

code_bp = Blueprint("code", __name__)

# Piston API Configuration (FREE - No signup needed!)
PISTON_API = os.getenv("CODE_EXECUTION_API", "https://emkc.org/api/v2/piston")

# Language mapping for Piston
LANGUAGE_MAP = {
    "python": "python",
    "java": "java",
    "cpp": "c++",
    "c": "c",
    "javascript": "javascript",
    "typescript": "typescript",
}


def execute_code_piston(source_code: str, language: str, stdin: str = ""):
    """
    Execute code using Piston API (completely free, no signup).
    Returns execution result with output, status.
    """
    piston_lang = LANGUAGE_MAP.get(language.lower())
    if not piston_lang:
        return {
            "error": f"Unsupported language: {language}",
            "success": False
        }
    
    url = f"{PISTON_API}/execute"
    
    payload = {
        "language": piston_lang,
        "version": "*",
        "files": [{"content": source_code}],
        "stdin": stdin,
        "compile_timeout": 10000,
        "run_timeout": 3000
    }
    
    print(f"[PISTON] Executing {piston_lang} code...")
    
    try:
        response = requests.post(url, json=payload, timeout=15)
        response.raise_for_status()
        result = response.json()
        
        # Parse Piston response
        run_result = result.get("run", {})
        compile_result = result.get("compile", {})
        
        stdout = (run_result.get("stdout") or "").strip()
        stderr = (run_result.get("stderr") or "").strip()
        compile_output = (compile_result.get("output") or "" if compile_result else "").strip()
        
        print(f"[PISTON] Result: {len(stdout)} bytes stdout, {len(stderr)} bytes stderr")
        
        # Determine success
        has_error = compile_output or (stderr and not stdout)
        success = not has_error
        
        if compile_output:
            status = "Compilation Error"
        elif stderr and not stdout:
            status = "Runtime Error"
        else:
            status = "Accepted"
        
        output = stdout if stdout else (stderr if stderr else compile_output)
        
        return {
            "success": success,
            "status": status,
            "stdout": stdout,
            "stderr": stderr,
            "compile_output": compile_output,
            "output": output,
            "language": result.get("language"),
            "version": result.get("version")
        }
        
    except requests.exceptions.Timeout:
        print("[PISTON] Timeout")
        return {
            "error": "Code execution timed out",
            "success": False,
            "status": "Timeout"
        }
    except Exception as e:
        print(f"[PISTON] ERROR: {e}")
        return {
            "error": f"Execution error: {str(e)}",
            "success": False
        }


@code_bp.post("/execute")
@jwt_required()
def execute_code():
    """
    Execute student's code submission.
    Expected payload:
    {
        "source_code": "print('Hello')",
        "language": "python",
        "stdin": "",  // optional
        "test_cases": [  // optional
            {"input": "5", "expected_output": "25"}
        ]
    }
    """
    print("[CODE_EXEC] Starting code execution...")
    
    claims = get_jwt()
    if claims.get("role") != "Student":
        print("[CODE_EXEC] Forbidden - not a student")
        return jsonify({"error": "Forbidden"}), 403
    
    data = request.get_json(force=True)
    source_code = data.get("source_code", "").strip()
    language = data.get("language", "python").lower()
    stdin = data.get("stdin", "")
    test_cases = data.get("test_cases", [])
    
    print(f"[CODE_EXEC] Language: {language}, Test cases: {len(test_cases)}")
    
    if not source_code:
        print("[CODE_EXEC] No source code provided")
        return jsonify({"error": "Source code is required"}), 400
    
    # If no test cases OR empty array, just run the code once and return output
    if not test_cases or len(test_cases) == 0:
        print("[CODE_EXEC] No test cases, running code directly")
        result = execute_code_piston(source_code, language, stdin)
        print(f"[CODE_EXEC] Result: {result.get('status', 'unknown')}")
        
        # Return direct output (not test_results format)
        return jsonify({
            "success": result.get("success", False),
            "status": result.get("status"),
            "output": result.get("output", ""),
            "stdout": result.get("stdout", ""),
            "stderr": result.get("stderr", ""),
            "error": result.get("error")
        })
    
    # Run against all test cases
    print(f"[CODE_EXEC] Running {len(test_cases)} test cases...")
    results = []
    all_passed = True
    
    for idx, test_case in enumerate(test_cases):
        test_input = test_case.get("input", "")
        expected_output = test_case.get("expected_output", "").strip()
        
        print(f"[CODE_EXEC] Test case {idx + 1}/{len(test_cases)}")
        
        # For function-style questions, wrap the code with test harness
        # This allows users to write just the function, not I/O logic
        # Function metadata should be passed from frontend or default to None
        wrapped_code = wrap_user_code_with_test_harness(
            source_code, 
            language, 
            test_input,
            data.get("function_name"),  # Optional: function name like "twoSum"
            data.get("input_format")     # Optional: how to parse input
        )
        
        result = execute_code_piston(wrapped_code, language, "")
        
        # Check if output matches expected
        actual_output = (result.get("stdout") or "").strip()
        passed = (actual_output == expected_output) and result.get("success", False)
        
        if not passed:
            all_passed = False
        
        results.append({
            "test_case": idx + 1,
            "input": test_input,
            "expected_output": expected_output,
            "actual_output": actual_output,
            "passed": passed,
            "status": result.get("status", "Unknown"),
            "time": result.get("time"),
            "memory": result.get("memory"),
            "error": result.get("stderr") or result.get("compile_output")
        })
    
    return jsonify({
        "success": all_passed,
        "test_results": results,
        "total_tests": len(test_cases),
        "passed_tests": sum(1 for r in results if r["passed"])
    })


@code_bp.post("/submit-coding-test")
@jwt_required()
def submit_coding_test():
    """
    Submit a coding test question with code execution.
    Similar to MCQ test submission but with code execution.
    """
    claims = get_jwt()
    if claims.get("role") != "Student":
        return jsonify({"error": "Forbidden"}), 403
    
    user_id = get_jwt_identity()
    data = request.get_json(force=True)
    
    question_id = data.get("questionId")
    source_code = data.get("source_code", "").strip()
    language = data.get("language", "python")
    
    if not question_id or not source_code:
        return jsonify({"error": "Missing required fields"}), 400
    
    # Get the question
    question = mongo.db.questions.find_one({"_id": ObjectId(question_id)})
    if not question:
        return jsonify({"error": "Question not found"}), 404
    
    if question.get("type") != "coding":
        return jsonify({"error": "This is not a coding question"}), 400
    
    # Get test cases from question
    test_cases = question.get("test_cases", [])
    
    # Execute code against test cases
    results = []
    all_passed = True
    
    for idx, test_case in enumerate(test_cases):
        test_input = test_case.get("input", "")
        expected_output = test_case.get("expected_output", "").strip()
        
        result = execute_code_piston(source_code, language, test_input)
        
        actual_output = (result.get("stdout") or "").strip()
        passed = (actual_output == expected_output) and result.get("success", False)
        
        if not passed:
            all_passed = False
        
        results.append({
            "test_case": idx + 1,
            "passed": passed,
            "hidden": test_case.get("hidden", False)  # Don't show hidden test case details
        })
    
    # Store submission
    submission_doc = {
        "studentId": ObjectId(user_id),
        "questionId": ObjectId(question_id),
        "source_code": source_code,
        "language": language,
        "test_results": results,
        "all_passed": all_passed,
        "passed_count": sum(1 for r in results if r["passed"]),
        "total_count": len(results),
        "submittedAt": datetime.utcnow()
    }
    
    mongo.db.code_submissions.insert_one(submission_doc)
    
    return jsonify({
        "success": all_passed,
        "passed_tests": sum(1 for r in results if r["passed"]),
        "total_tests": len(results),
        "test_results": results  # Only show pass/fail for hidden tests
    })


@code_bp.get("/question/random")
@jwt_required()
def get_random_coding_question():
    """Get a random coding question."""
    # optional: filter by difficulty or topic if query params provided
    pipeline = [
        {"$match": {"type": "coding"}},
        {"$sample": {"size": 1}}
    ]
    
    questions = list(mongo.db.questions.aggregate(pipeline))
    
    if not questions:
        return jsonify({"error": "No coding questions found"}), 404
    
    question = questions[0]
    question["_id"] = str(question["_id"])
    
    return jsonify(question)


@code_bp.get("/questions")
@jwt_required()
def list_coding_questions():
    """List all coding questions."""
    
    # Optional filtering
    difficulty = request.args.get("difficulty")
    status = request.args.get("status") # solved, unsolved (TODO)
    
    match = {"type": "coding"}
    if difficulty:
        match["difficulty"] = int(difficulty)
        
    cursor = mongo.db.questions.find(match).sort("difficulty", 1)
    
    questions = []
    user_id = get_jwt_identity()
    
    # Get user's solved questions to mark status
    solved_ids = set()
    user_subs = mongo.db.code_submissions.find({"studentId": ObjectId(user_id), "all_passed": True})
    for sub in user_subs:
        solved_ids.add(str(sub["questionId"]))
        
    for q in cursor:
        qid = str(q["_id"])
        questions.append({
            "_id": qid,
            "text": q.get("text", "Untitled"), # Title
            "difficulty": q.get("difficulty", 1),
            "status": "Solved" if qid in solved_ids else "Todo",
            "acceptance": "50%" # Placeholder for now
        })
        
    return jsonify(questions)


@code_bp.get("/question/<question_id>")
@jwt_required()
def get_coding_question(question_id):
    """Get a specific coding question by ID."""
    try:
        q = mongo.db.questions.find_one({"_id": ObjectId(question_id)})
        if not q or q.get("type") != "coding":
            return jsonify({"error": "Question not found"}), 404
            
        q["_id"] = str(q["_id"])
        return jsonify(q)
    except:
        return jsonify({"error": "Invalid ID"}), 400

@code_bp.get("/my-submissions")
@jwt_required()
def my_submissions():
    """Get student's coding submissions."""
    user_id = get_jwt_identity()
    
    cursor = mongo.db.code_submissions.find({"studentId": ObjectId(user_id)})
    submissions = []
    
    for sub in cursor:
        sub["_id"] = str(sub["_id"])
        sub["studentId"] = str(sub["studentId"])
        sub["questionId"] = str(sub["questionId"])
        # Remove source code from list view (only show in detail)
        sub.pop("source_code", None)
        submissions.append(sub)
    
    return jsonify(submissions)
