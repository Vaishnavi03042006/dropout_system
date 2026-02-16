from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.result import Result
from models.students import Student
from models.user import User

result_bp = Blueprint("results", __name__)


# ---------------- CREATE RESULT ----------------
@result_bp.route("/create", methods=["POST"])
@jwt_required()
def create_result():
    data = request.get_json()
    current_user_id = int(get_jwt_identity())

    # Get current user
    current_user = User.query.get(current_user_id)

    if not current_user:
        return jsonify({"error": "User not found"}), 404

    # 🔐 ROLE CHECK: only admin or mentor can add results
    if current_user.role not in ["admin", "mentor"]:
        return jsonify({"error": "Permission denied"}), 403

    required_fields = [
        "student_id",
        "subject_code",
        "subject_name",
        "semester",
        "internal1",
        "internal2",
        "internal3",
        "attempts",
        "result_status"
    ]

    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    student = Student.query.get(data["student_id"])

    if not student:
        return jsonify({"error": "Student not found"}), 404

    result = Result(
        student_id=data["student_id"],
        subject_code=data["subject_code"],
        subject_name=data["subject_name"],
        semester=data["semester"],
        internal1=data["internal1"],
        internal2=data["internal2"],
        internal3=data["internal3"],
        attempts=data["attempts"],
        result_status=data["result_status"],
        sem_mark=data.get("sem_mark")
    )

    db.session.add(result)
    db.session.commit()

    return jsonify({
        "message": "Result added successfully",
        "result": result.to_dict()
    }), 201


# ---------------- GET RESULTS BY STUDENT ----------------
@result_bp.route("/student/<int:student_id>", methods=["GET"])
@jwt_required()
def get_results_by_student(student_id):
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)

    if not current_user:
        return jsonify({"error": "User not found"}), 404

    student = Student.query.get(student_id)

    if not student:
        return jsonify({"error": "Student not found"}), 404

    # 🔐 ACCESS RULES
    # - Student → can view their own results
    # - Admin / Mentor → can view any student's results
    if current_user.role == "student":
        if student.user_id != current_user_id:
            return jsonify({"error": "Unauthorized access"}), 403

    results = Result.query.filter_by(student_id=student_id).all()

    if not results:
        return jsonify({"message": "No results found"}), 404

    return jsonify([r.to_dict() for r in results]), 200
