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


import subprocess
import tempfile
import os
import platform

def execute_code_piston(source_code: str, language: str, stdin: str = ""):
    """
    Execute code locally using subprocess.
    A reliable, free, offline alternative that acts exactly like Piston API.
    """
    piston_lang = LANGUAGE_MAP.get(language.lower())
    if not piston_lang:
        return {
            "error": f"Unsupported language: {language}",
            "success": False
        }
    
    # Configuration for local execution
    is_windows = platform.system() == "Windows"
    executor_map = {
        "python": {"ext": ".py", "cmd": ["python" if is_windows else "python3"]},
        "javascript": {"ext": ".js", "cmd": ["node"]},
        "java": {"ext": ".java", "cmd": ["java"]},
        "c++": {"ext": ".cpp", "cmd": ["g++", "-O2", "-o", "a.exe" if is_windows else "./a.out"]},
        "c": {"ext": ".c", "cmd": ["gcc", "-O2", "-o", "a.exe" if is_windows else "./a.out"]},
        "typescript": {"ext": ".ts", "cmd": ["npx", "ts-node"]},
    }
    
    config = executor_map.get(piston_lang)
    if not config:
        return {
            "error": f"Local executor not set up for {piston_lang}. Please use Python or JavaScript.",
            "success": False
        }
        
    print(f"[LOCAL EXEC] Executing {piston_lang} code locally...")
    
    try:
        # 1. Write source code
        with tempfile.NamedTemporaryFile(suffix=config["ext"], delete=False, mode="w", encoding="utf-8") as src_file:
            src_file.write(source_code)
            src_path = src_file.name
            
        # 2. Write stdin
        with tempfile.NamedTemporaryFile(delete=False, mode="w", encoding="utf-8") as in_file:
            in_file.write(stdin)
            in_path = in_file.name
            
        stdout, stderr, compile_output = "", "", ""
        success = False
        
        # 3. Compile step (if required)
        if piston_lang in ["c++", "c"]:
            compile_cmd = config["cmd"] + [src_path]
            compile_proc = subprocess.run(compile_cmd, capture_output=True, text=True, timeout=10)
            compile_output = compile_proc.stderr.strip() # GCC writes errors to stderr
            
            if compile_proc.returncode != 0:
                print(f"[LOCAL EXEC] Compilation failed")
                return {
                    "success": False,
                    "status": "Compilation Error",
                    "stdout": "",
                    "stderr": "",
                    "compile_output": compile_output,
                    "output": compile_output,
                    "language": piston_lang,
                    "version": "local"
                }
            
            # Update command for execution
            run_cmd = ["a.exe" if is_windows else "./a.out"]
        else:
            run_cmd = config["cmd"] + [src_path]
            
        # 4. Run step
        with open(in_path, "r", encoding="utf-8") as stdin_file:
            run_proc = subprocess.run(run_cmd, stdin=stdin_file, capture_output=True, text=True, timeout=5)
            
        stdout = run_proc.stdout.strip()
        stderr = run_proc.stderr.strip()
        
        print(f"[LOCAL EXEC] Result: {len(stdout)} bytes stdout, {len(stderr)} bytes stderr")
        
        has_error = run_proc.returncode != 0 or (stderr and not stdout)
        success = not has_error
        
        status = "Accepted" if success else "Runtime Error"
        output = stdout if stdout else stderr
        
        # Cleanup temp files
        os.remove(src_path)
        os.remove(in_path)
        if piston_lang in ["c++", "c"]:
            exe_path = "a.exe" if is_windows else "a.out"
            if os.path.exists(exe_path): os.remove(exe_path)
            
        return {
            "success": success,
            "status": status,
            "stdout": stdout,
            "stderr": stderr,
            "compile_output": compile_output,
            "output": output,
            "language": piston_lang,
            "version": "local"
        }
        
    except subprocess.TimeoutExpired:
        print("[LOCAL EXEC] Timeout")
        return {
            "error": "Code execution timed out",
            "success": False,
            "status": "Timeout"
        }
    except Exception as e:
        print(f"[LOCAL EXEC] ERROR: {e}")
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
        
        # Make boolean checking case-insensitive
        actual_lower = actual_output.lower()
        expected_lower = expected_output.lower()
        
        if expected_lower in ['true', 'false']:
            passed = (actual_lower == expected_lower) and result.get("success", False)
        else:
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


@code_bp.post("/run")
@jwt_required()
def run_against_question():
    """
    Run code against ALL test cases (including hidden) fetched from the DB.
    Does NOT save a submission. Used by the Run button.
    Returns full test results for visible cases, only pass/fail for hidden.
    """
    claims = get_jwt()
    if claims.get("role") != "Student":
        return jsonify({"error": "Forbidden"}), 403

    data = request.get_json(force=True)
    source_code = data.get("source_code", "").strip()
    language = data.get("language", "python").lower()
    question_id = data.get("questionId")

    if not source_code:
        return jsonify({"error": "Source code is required"}), 400

    # If no questionId, fall back to executing with test_cases passed directly
    if not question_id:
        test_cases = data.get("test_cases", [])
        if not test_cases:
            result = execute_code_piston(source_code, language, "")
            return jsonify({
                "success": result.get("success", False),
                "output": result.get("output", ""),
                "stdout": result.get("stdout", ""),
                "stderr": result.get("stderr", ""),
                "error": result.get("error")
            })
    else:
        # Fetch question and all its test cases from DB
        try:
            question = mongo.db.questions.find_one({"_id": ObjectId(question_id)})
        except Exception:
            return jsonify({"error": "Invalid question ID"}), 400

        if not question:
            return jsonify({"error": "Question not found"}), 404

        test_cases = question.get("test_cases", [])
        function_name = question.get("function_name") or data.get("function_name")
        input_format = question.get("input_format") or data.get("input_format")

    results = []
    all_passed = True

    for idx, test_case in enumerate(test_cases):
        test_input = test_case.get("input", "")
        expected_output = test_case.get("expected_output", "").strip()
        is_hidden = test_case.get("hidden", False)

        wrapped_code = wrap_user_code_with_test_harness(
            source_code,
            language,
            test_input,
            function_name if question_id else data.get("function_name"),
            input_format if question_id else data.get("input_format")
        )

        result = execute_code_piston(wrapped_code, language, "")

        actual_output = (result.get("stdout") or "").strip()
        actual_lower = actual_output.lower()
        expected_lower = expected_output.lower()

        if expected_lower in ['true', 'false']:
            passed = (actual_lower == expected_lower) and result.get("success", False)
        else:
            passed = (actual_output == expected_output) and result.get("success", False)

        if not passed:
            all_passed = False

        entry = {
            "test_case": idx + 1,
            "passed": passed,
            "hidden": is_hidden,
            "status": result.get("status", "Unknown"),
            "error": result.get("stderr") or result.get("compile_output") or result.get("error")
        }

        # Only expose input/output details for visible test cases
        if not is_hidden:
            entry["input"] = test_input
            entry["expected_output"] = expected_output
            entry["actual_output"] = actual_output

        results.append(entry)

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
        
        # Wrap user code with test harness for LeetCode-style execution
        wrapped_code = wrap_user_code_with_test_harness(
            source_code, 
            language, 
            test_input,
            question.get("function_name"),
            question.get("input_format")
        )
        
        result = execute_code_piston(wrapped_code, language, "")
        
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


def generate_starter_code(function_name, input_format=None):
    """
    Auto-generate starter code templates for each language based on
    the question's function_name and input_format.
    """
    fn = function_name or 'solution'
    fmt = input_format or 'array_int, int'

    # Determine param signature from input_format
    if fmt == 'string':
        py_params = 's: str'
        js_params = 's'
        java_params = 'String s'
        cpp_params = 'string s'
    elif fmt == 'int':
        py_params = 'n: int'
        js_params = 'n'
        java_params = 'int n'
        cpp_params = 'int n'
    else:  # default: array_int, int  (Two Sum style)
        py_params = 'nums, target'
        js_params = 'nums, target'
        java_params = 'int[] nums, int target'
        cpp_params = 'vector<int>& nums, int target'

    return {
        'python': f'def {fn}({py_params}):\n    # Write your solution here\n    pass\n',
        'javascript': f'/**\n * @return {{*}}\n */\nvar {fn} = function({js_params}) {{\n    // Write your solution here\n}};\n',
        'java': f'class Solution {{\n    public int[] {fn}({java_params}) {{\n        // Write your solution here\n    }}\n}}',
        'cpp': f'#include <vector>\nusing namespace std;\n\nclass Solution {{\npublic:\n    vector<int> {fn}({cpp_params}) {{\n        // Write your solution here\n    }}\n}};'
    }


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

    # Auto-inject starter_code if not stored
    if not question.get("starter_code"):
        question["starter_code"] = generate_starter_code(
            question.get("function_name"),
            question.get("input_format")
        )
    
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

        # Auto-inject starter_code if not stored in DB
        if not q.get("starter_code"):
            q["starter_code"] = generate_starter_code(
                q.get("function_name"),
                q.get("input_format")
            )

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
