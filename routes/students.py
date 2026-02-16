from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
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
