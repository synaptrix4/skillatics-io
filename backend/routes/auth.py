from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from passlib.hash import bcrypt

from extensions import mongo


auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/register")
def register():
	data = request.get_json(force=True)
	email = (data.get("email") or "").strip().lower()
	password = data.get("password")
	name = (data.get("name") or "").strip()

	if not email or not password or not name:
		return jsonify({"error": "Missing required fields"}), 400

	# All signups default to Student; role changes are admin-only
	role = "Student"

	existing = mongo.db.users.find_one({"email": email})
	if existing:
		return jsonify({"error": "Email already registered"}), 409

	hashed = bcrypt.hash(password)
	user_doc = {
		"email": email,
		"password": hashed,
		"name": name,
		"role": role,
		"createdAt": datetime.utcnow(),
	}
	result = mongo.db.users.insert_one(user_doc)

	access_token = create_access_token(identity=str(result.inserted_id), additional_claims={"role": role})
	return jsonify({
		"token": access_token,
		"user": {"_id": str(result.inserted_id), "email": email, "name": name, "role": role}
	}), 201


@auth_bp.post("/login")
def login():
	data = request.get_json(force=True)
	email = (data.get("email") or "").strip().lower()
	password = data.get("password") or ""

	user = mongo.db.users.find_one({"email": email})
	if not user or not bcrypt.verify(password, user.get("password", "")):
		return jsonify({"error": "Invalid credentials"}), 401

	access_token = create_access_token(identity=str(user["_id"]), additional_claims={"role": user.get("role", "Student")})
	return jsonify({
		"token": access_token,
		"user": {"_id": str(user["_id"]), "email": user["email"], "name": user.get("name", ""), "role": user.get("role", "Student")}
	})


