from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.fees import Fees
from models.students import Student
from models.user import User
from datetime import datetime

fees_bp = Blueprint("fees", __name__)

# ---------------- CREATE FEE RECORD ----------------
@fees_bp.route("/create", methods=["POST"])
@jwt_required()
def create_fee():
    data = request.get_json()
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)

    if not current_user:
        return jsonify({"error": "User not found"}), 404

    # 🔐 ROLE CHECK: only admin or mentor can add fees
    if current_user.role not in ["admin", "mentor"]:
        return jsonify({"error": "Permission denied"}), 403

    required_fields = ["student_id", "semester", "tuition_fee", "payment_status"]

    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    student = Student.query.get(data["student_id"])
    if not student:
        return jsonify({"error": "Student not found"}), 404

    # Parse deadline if provided
    deadline = None
    if "deadline" in data and data["deadline"]:
        try:
            deadline = datetime.fromisoformat(data["deadline"]).date()
        except ValueError:
            return jsonify({"error": "Invalid date format for deadline. Use YYYY-MM-DD."}), 400

    fee = Fees(
        student_id=data["student_id"],
        semester=data["semester"],
        tuition_fee=data["tuition_fee"],
        hostel_fee=data.get("hostel_fee"),
        payment_status=data["payment_status"],
        deadline=deadline
    )

    db.session.add(fee)
    db.session.commit()

    return jsonify({
        "message": "Fee record added successfully",
        "fee": fee.to_dict()
    }), 201


# ---------------- GET FEES BY STUDENT ----------------
@fees_bp.route("/student/<int:student_id>", methods=["GET"])
@jwt_required()
def get_fees_by_student(student_id):
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)

    if not current_user:
        return jsonify({"error": "User not found"}), 404

    student = Student.query.get(student_id)
    if not student:
        return jsonify({"error": "Student not found"}), 404

    # 🔐 ACCESS RULES
    if current_user.role == "student":
        if student.user_id != current_user_id:
            return jsonify({"error": "Unauthorized access"}), 403

    fees_records = Fees.query.filter_by(student_id=student_id).all()
    if not fees_records:
        return jsonify({"message": "No fees records found"}), 404

    return jsonify([f.to_dict() for f in fees_records]), 200
