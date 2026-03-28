from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.students import Student
from models.user import User
from extensions import db
from datetime import datetime

student_bp = Blueprint("students", __name__)


# ---------------- CREATE STUDENT ----------------
@student_bp.route("/create", methods=["POST"])
@jwt_required()
def create_student():

    data = request.get_json()

    if not data:
        return jsonify({"error": "No input data provided"}), 400

    # Check if user exists
    user = User.query.get(data["user_id"])

    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.role != "student":
        return jsonify({"error": "User must have student role"}), 400

    if Student.query.filter_by(user_id=user.user_id).first():
        return jsonify({"error": "Student profile already exists"}), 400

    student = Student(
        user_id=user.user_id,
        register_number=data["register_number"],
        department=data["department"],
        year=data["year"],
        semester=data["semester"],
        admission_date=datetime.strptime(
            data["admission_date"], "%Y-%m-%d"
        )
    )

    db.session.add(student)
    db.session.commit()

    return jsonify({
        "message": "Student profile created successfully",
        "student": student.to_dict()
    }), 201


# ---------------- GET STUDENT ----------------
@student_bp.route("/<int:student_id>", methods=["GET"])
@jwt_required()
def get_student(student_id):

    student = Student.query.get(student_id)

    if not student:
        return jsonify({"error": "Student not found"}), 404

    return jsonify(student.to_dict()), 200

@student_bp.route("/me", methods=["GET"])
@jwt_required()
def get_my_profile():

    user_id = int(get_jwt_identity())

    student = Student.query.filter_by(user_id=user_id).first()

    if not student:
        return jsonify({"error": "Student profile not found"}), 404

    return jsonify(student.to_dict()), 200


# ---------------- GET ALL STUDENTS (Mentor/Admin/Counsellor) ----------------
@student_bp.route("/all", methods=["GET"])
@jwt_required()
def get_all_students():
    current_user = User.query.get(int(get_jwt_identity()))
    if not current_user or current_user.role not in ["admin", "mentor", "counsellor"]:
        return jsonify({"error": "Permission denied"}), 403

    students = Student.query.all()
    return jsonify([s.to_dict() for s in students]), 200