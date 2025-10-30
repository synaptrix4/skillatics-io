from datetime import datetime, timedelta
import random
import hashlib
import os
import smtplib
from email.mime.text import MIMEText
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from extensions import mongo
from bson import ObjectId

auth_bp = Blueprint("auth", __name__)

def send_otp_email(to, otp):
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "465"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASS")
    if not smtp_user or not smtp_pass:
        # Optionally log missing config but no demo OTP print
        return
    body = f"Your Skillatics OTP is: {otp}\n\nThis code is valid for 5 minutes."
    msg = MIMEText(body)
    msg['Subject'] = "Your OTP for Skillatics"
    msg['From'] = smtp_user
    msg['To'] = to
    try:
        with smtplib.SMTP_SSL(smtp_server, smtp_port) as smtp:
            smtp.login(smtp_user, smtp_pass)
            smtp.sendmail(smtp_user, [to], msg.as_string())
        # Optionally log success
    except Exception as e:
        print(f"[Skillatics-Error] Failed to send OTP email: {e}")

# --- Helpers for OTP ---
def random_otp():
    return str(random.randint(100000, 999999))

def hash_otp(otp: str):
    return hashlib.sha256(otp.encode('utf-8')).hexdigest()

def is_profile_complete(user):
    # Require name, mobile, gender, department
    return all(user.get(k) for k in ["name", "mobile", "gender", "department"])

# --- REQUEST OTP ---
@auth_bp.post("/request-otp")
def request_otp():
    data = request.get_json(force=True)
    email = (data.get("email") or "").strip().lower()
    name = (data.get("name") or "").strip() if "name" in data else None
    purpose = data.get("purpose") or "login"  # or "register"
    if not email:
        return jsonify({"error": "Email required"}), 400

    user = mongo.db.users.find_one({"email": email})
    if purpose == "register":
        if user:
            return jsonify({"error": "Email already registered"}), 409
        if not name:
            return jsonify({"error": "Name required for registration"}), 400
    else:
        if not user:
            return jsonify({"error": "Email not registered"}), 404
    otp = random_otp()
    otp_hash = hash_otp(otp)
    expires = datetime.utcnow() + timedelta(minutes=5)

    mongo.db.otps.delete_many({"email": email})  # Invalidate previous OTPs
    mongo.db.otps.insert_one({
        "email": email,
        "otp_hash": otp_hash,
        "expires": expires,
        "attempts": 0,
        "purpose": purpose,
        "createdAt": datetime.utcnow()
    })
    # Send OTP via SMTP email (or print if config missing)
    send_otp_email(email, otp)
    return jsonify({"ok": True, "message": "OTP sent"})

# --- VERIFY OTP ---
@auth_bp.post("/verify-otp")
def verify_otp():
    data = request.get_json(force=True)
    email = (data.get("email") or "").strip().lower()
    otp = (data.get("otp") or "").strip()
    if not email or not otp:
        return jsonify({"error": "Email and OTP required"}), 400
    rec = mongo.db.otps.find_one({"email": email})
    if not rec:
        return jsonify({"error": "No OTP requested"}), 400
    if rec["expires"] < datetime.utcnow():
        mongo.db.otps.delete_one({"_id": rec["_id"]})
        return jsonify({"error": "OTP expired"}), 400
    if rec["attempts"] >= 5:
        mongo.db.otps.delete_one({"_id": rec["_id"]})
        return jsonify({"error": "Too many attempts"}), 400
    hash_input = hash_otp(otp)
    if hash_input != rec["otp_hash"]:
        mongo.db.otps.update_one({"_id": rec["_id"]}, {"$inc": {"attempts": 1}})
        return jsonify({"error": "Invalid OTP"}), 401
    # Success: login or register user
    user = mongo.db.users.find_one({"email": email})
    profile_complete = False
    role = "Student"
    if rec["purpose"] == "register" and not user:
        # Registration
        name = (data.get("name") or "").strip() or ""
        user_doc = {
            "email": email,
            "name": name,
            "role": role,
            "createdAt": datetime.utcnow(),
            # profile fields may be completed later
        }
        result = mongo.db.users.insert_one(user_doc)
        user = mongo.db.users.find_one({"_id": result.inserted_id})
    elif user:
        role = user.get("role", "Student")
    profile_complete = bool(user and is_profile_complete(user))
    mongo.db.otps.delete_one({"_id": rec["_id"]})
    access_token = create_access_token(identity=str(user["_id"]), additional_claims={"role": role})
    resp = {
        "token": access_token,
        "user": {"_id": str(user["_id"]), "email": user["email"], "name": user.get("name", ""), "role": role,
                  "profile_complete": profile_complete},
    }
    return jsonify(resp)

# --- Update Profile ---
@auth_bp.post("/update-profile")
@jwt_required()
def update_profile():
    uid = get_jwt_identity()
    data = request.get_json(force=True)
    allowed = ["name", "mobile", "gender", "department"]
    updates = {k: data[k].strip() if isinstance(data[k], str) else data[k] for k in allowed if k in data}
    if not updates:
        return jsonify({"error": "No profile fields provided"}), 400
    result = mongo.db.users.update_one({"_id": ObjectId(uid)}, {"$set": updates})
    user = mongo.db.users.find_one({"_id": ObjectId(uid)})
    profile_complete = is_profile_complete(user)
    return jsonify({
        "ok": True,
        "user": {"_id": str(user["_id"]), "email": user["email"], "name": user.get("name", ""), "role": user.get("role"),
                  "profile_complete": profile_complete}
    })


