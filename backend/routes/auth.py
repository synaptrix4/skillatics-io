from datetime import datetime, timedelta
import random
import hashlib
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import socket
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from extensions import mongo
from bson import ObjectId

auth_bp = Blueprint("auth", __name__)

# --- START: SMTP Email Logic ---
def send_otp_email(to, otp):
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")

    if not smtp_username or not smtp_password:
        print(f"[Skillatics-Warning] SMTP_USERNAME or SMTP_PASSWORD not configured. OTP: {otp} (for development only)")
        # If we are in dev mode, we might want to just return, the caller handles logging the OTP
        return

    subject = "Your OTP for Skillatics"
    
    html_content = f"""
    <html>
    <head>
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; }}
            .header {{ text-align: center; padding-bottom: 20px; border-bottom: 1px solid #edf2f7; margin-bottom: 20px; }}
            .brand {{ font-size: 24px; font-weight: 700; color: #7c3aed; text-decoration: none; }}
            .otp-box {{ background: linear-gradient(to right, #f5f3ff, #ede9fe); border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0; }}
            .otp-code {{ font-size: 32px; font-weight: 800; color: #5b21b6; letter-spacing: 6px; font-family: monospace; }}
            .expiry {{ font-size: 14px; color: #ef4444; font-weight: 500; margin-top: 8px; }}
            .footer {{ text-align: center; margin-top: 24px; font-size: 12px; color: #94a3b8; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <span class="brand">Skillatics</span>
            </div>
            <p style="font-size: 16px;">Hello,</p>
            <p>You requested a One-Time Password (OTP) to sign in to your account.</p>
            
            <div class="otp-box">
                <div class="otp-code">{otp}</div>
                <div class="expiry">Valid for 5 minutes</div>
            </div>
            
            <p>If you didn't request this, you can safely ignore this email.</p>
            
            <div class="footer">
                &copy; {datetime.now().year} Skillatics Learning Platform
            </div>
        </div>
    </body>
    </html>
    """

    msg = MIMEMultipart()
    msg['From'] = f"Skillatics <{smtp_username}>"
    msg['To'] = to
    msg['Subject'] = subject

    msg.attach(MIMEText(html_content, 'html'))

    try:
        # Connect to server
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.ehlo()
        server.starttls() # Secure the connection
        server.ehlo()
        server.login(smtp_username, smtp_password)
        server.sendmail(smtp_username, to, msg.as_string())
        server.close()
        print(f"[Skillatics-Success] OTP email sent to {to} via SMTP")
    except Exception as e:
        print(f"[Skillatics-Error] Failed to send SMTP email: {e}")
        raise e
# --- END: SMTP Email Logic ---

# --- Helpers for OTP ---
def random_otp():
    return str(random.randint(100000, 999999))

def hash_otp(otp: str):
    return hashlib.sha256(otp.encode('utf-8')).hexdigest()

def is_profile_complete(user):
    # Require name, mobile, gender, department, division, rollNo, yearOfStudy
    return all(user.get(k) for k in ["name", "mobile", "gender", "department", "division", "rollNo", "yearOfStudy"])


def serialize_user(user):
    """Return the user payload sent to clients."""
    if not user:
        return None
    base_fields = {
        "_id": str(user["_id"]),
        "email": user["email"],
        "name": user.get("name", ""),
        "role": user.get("role", "Student"),
        "profile_complete": is_profile_complete(user),
    }
    profile_fields = {k: user.get(k, "") for k in ["mobile", "gender", "department", "division", "rollNo", "yearOfStudy"]}
    return {**base_fields, **profile_fields}

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
    
    # --- START OF UPDATED CODE ---
    # Send OTP via SMTP email (or print if config missing)
    otp_sent = False
    try:
        send_otp_email(email, otp)
        otp_sent = True
    except Exception as e:
        # Catch the exception from send_otp_email
        print(f"[Skillatics-Error] Route /request-otp failed: {e}")
        # Only return 500 if not in dev mode
        if os.getenv("FLASK_ENV") != "development":
             return jsonify({
                "error": "Failed to send OTP. Check backend logs for details."
            }), 500

    response = {"ok": True, "message": "OTP sent"}
    
    # In Development Mode, inject the OTP into the response to avoid blockage
    if os.getenv("FLASK_ENV") == "development":
        response["dev_otp"] = otp
        response["message"] = f"OTP sent (Dev Mode: {otp})"
    
    return jsonify(response)
    # --- END OF UPDATED CODE ---

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
    mongo.db.otps.delete_one({"_id": rec["_id"]})
    access_token = create_access_token(identity=str(user["_id"]), additional_claims={"role": role})
    resp = {
        "token": access_token,
        "user": serialize_user(user),
    }
    return jsonify(resp)

# --- Update Profile ---
@auth_bp.post("/update-profile")
@jwt_required()
def update_profile():
    uid = get_jwt_identity()
    data = request.get_json(force=True)
    allowed = ["name", "mobile", "gender", "department", "division", "rollNo", "yearOfStudy"]
    updates = {k: data[k].strip() if isinstance(data[k], str) else data[k] for k in allowed if k in data}
    if not updates:
        return jsonify({"error": "No profile fields provided"}), 400
    result = mongo.db.users.update_one({"_id": ObjectId(uid)}, {"$set": updates})
    user = mongo.db.users.find_one({"_id": ObjectId(uid)})
    return jsonify({
        "ok": True,
        "user": serialize_user(user)
    })


# --- Refresh Token (to get updated role) ---
@auth_bp.post("/refresh-token")
@jwt_required()
def refresh_token():
    """
    Refresh the user's JWT token with their current role from the database.
    This is useful when an admin changes a user's role.
    """
    uid = get_jwt_identity()
    user = mongo.db.users.find_one({"_id": ObjectId(uid)})
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    role = user.get("role", "Student")
    
    # Create new token with updated role
    access_token = create_access_token(identity=str(user["_id"]), additional_claims={"role": role})
    
    return jsonify({
        "token": access_token,
        "user": serialize_user(user)
    })