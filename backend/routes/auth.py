from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from models.user import User
from extensions import db

auth_bp = Blueprint("auth", __name__)

# Allowed roles
ALLOWED_ROLES = ["admin", "mentor", "counsellor", "student", "parent"]


# =====================================================
# 🔥 REGISTER NUMBER GENERATOR
# =====================================================
def generate_register_number(department):

    dept_codes = {
        "CSE": "eucs",
        "IT": "euit"
    }

    code = dept_codes.get(department.upper())

    if not code:
        raise ValueError("Invalid department")

    # Find last student from same department
    last_student = User.query.filter(
        User.role == "student",
        User.department == department,
        User.register_number != None
    ).order_by(User.user_id.desc()).first()

    if last_student:
        last_num = int(last_student.register_number[-3:])
        next_num = last_num + 1
    else:
        next_num = 1

    return f"727723{code}{next_num:03}"


# =====================================================
# ---------------- REGISTER ----------------
# =====================================================
@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    if not data:
        return jsonify({"error": "No input data provided"}), 400

    required_fields = ["name", "email", "password", "role"]

    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    # Role validation
    if data["role"] not in ALLOWED_ROLES:
        return jsonify({"error": "Invalid role"}), 400

    # Email check
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already exists"}), 400

    # Create user
    user = User(
        name=data["name"],
        email=data["email"],
        role=data["role"],
        department=data.get("department"),
        class_id=data.get("class_id")
    )

    # Set password
    user.set_password(data["password"])

    # 🔥 AUTO-GENERATE REGISTER NUMBER FOR STUDENTS
    if user.role == "student":

        if not user.department:
            return jsonify({"error": "Department required for students"}), 400

        try:
            user.register_number = generate_register_number(
                user.department
            )
        except ValueError as e:
            return jsonify({"error": str(e)}), 400

    db.session.add(user)
    db.session.commit()

    return jsonify({
        "message": "User registered successfully",
        "user": user.to_dict()
    }), 201


# =====================================================
# ---------------- LOGIN ----------------
# =====================================================
@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    if not data:
        return jsonify({"error": "No input data provided"}), 400

    if "email" not in data or "password" not in data:
        return jsonify({"error": "Email and password required"}), 400

    user = User.query.filter_by(email=data["email"]).first()

    if not user or not user.check_password(data["password"]):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(identity=str(user.user_id))

    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": user.to_dict()
    }), 200
