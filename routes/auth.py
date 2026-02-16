
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from models.user import User
from extensions import db

auth_bp = Blueprint("auth", __name__)

# Allowed roles in the system
ALLOWED_ROLES = ["admin", "mentor", "counsellor", "student", "parent"]


# ---------------- REGISTER ----------------
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    # Basic validation
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    required_fields = ["name", "email", "password", "role"]

    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    # Role validation
    if data["role"] not in ALLOWED_ROLES:
        return jsonify({"error": "Invalid role"}), 400

    # Check if email already exists
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already exists"}), 400

    # Create new user
    user = User(
        name=data["name"],
        email=data["email"],
        role=data["role"],
        department=data.get("department"),
        class_id=data.get("class_id")
    )

    # Set hashed password
    user.set_password(data["password"])

    db.session.add(user)
    db.session.commit()

    return jsonify({
        "message": "User registered successfully",
        "user": user.to_dict()
    }), 201


# ---------------- LOGIN ----------------
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No input data provided"}), 400

    if "email" not in data or "password" not in data:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=data["email"]).first()

    if not user or not user.check_password(data["password"]):
        return jsonify({"error": "Invalid credentials"}), 401

    # FIX: convert user_id to string
    access_token = create_access_token(identity=str(user.user_id))

    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": user.to_dict()
    }), 200
