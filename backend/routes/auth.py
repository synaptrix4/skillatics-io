from datetime import datetime, timedelta
import random
import hashlib
import os
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from extensions import mongo
from bson import ObjectId

auth_bp = Blueprint("auth", __name__)

# --- START: Brevo API Email Logic ---
def send_otp_email(to, otp):
    api_key = os.environ.get("BREVO_API_KEY")
    if not api_key:
        print(f"[Skillatics-Warning] BREVO_API_KEY not configured. OTP: {otp} (for development only)")
        return

    # Configure Brevo API
    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key['api-key'] = api_key
    api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))

    subject = "Your OTP for Skillatics"
    html_content = f"""
    <html>
    <head>
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; }}
            .header {{ text-align: center; padding-bottom: 20px; border-bottom: 1px solid #edf2f7; margin-bottom: 20px; }}
            .brand {{ font-size: 24px; font-weight: 700; color: #7c3aed; }}
            .otp-box {{ background: linear-gradient(to right, #f5f3ff, #ede9fe); border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0; }}
            .otp-code {{ font-size: 32px; font-weight: 800; color: #5b21b6; letter-spacing: 6px; font-family: monospace; }}
            .expiry {{ font-size: 14px; color: #ef4444; font-weight: 500; margin-top: 8px; }}
            .footer {{ text-align: center; margin-top: 24px; font-size: 12px; color: #94a3b8; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header"><span class="brand">Skillatics</span></div>
            <p style="font-size: 16px;">Hello,</p>
            <p>You requested a One-Time Password (OTP) to sign in to your account.</p>
            <div class="otp-box">
                <div class="otp-code">{otp}</div>
                <div class="expiry">Valid for 5 minutes</div>
            </div>
            <p>If you didn't request this, you can safely ignore this email.</p>
            <div class="footer">&copy; {datetime.now().year} Skillatics Learning Platform</div>
        </div>
    </body>
    </html>
    """

    # Create Transactional Email object
    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=[{"email": to}],
        html_content=html_content,
        subject=subject,
        sender={"name": "Skillatics", "email": "synaptrix4@gmail.com"}
    )

    try:
        api_instance.send_transac_email(send_smtp_email)
        print(f"[Skillatics-Success] OTP email sent to {to} via Brevo API")
    except ApiException as e:
        print(f"[Skillatics-Error] Failed to send email via Brevo API: {e}")
        raise e
# --- END: Brevo API Email Logic ---

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
    is_dev = os.getenv("FLASK_ENV") == "development"

    # Send OTP via SendGrid SMTP relay
    email_sent = False
    try:
        send_otp_email(email, otp)
        email_sent = True
    except Exception as e:
        print(f"[Skillatics-Error] Route /request-otp email failed: {e}")
        if not is_dev:
            return jsonify({"error": "Failed to send OTP email. Please try again later."}), 500

    response = {"ok": True, "message": "OTP sent"}

    if is_dev:
        response["dev_otp"] = otp
        response["message"] = f"OTP {'emailed and' if email_sent else '(email skipped, dev mode)'}: {otp}"

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