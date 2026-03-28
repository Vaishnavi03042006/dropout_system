from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.attendance import Attendance
from models.students import Student


attendance_bp = Blueprint("attendance", __name__)


@attendance_bp.route("/create", methods=["POST"])
@jwt_required()
def create_attendance():
    data = request.get_json()
    current_user_id = int(get_jwt_identity())

    student_id = data.get("student_id")
    total_classes = data.get("total_classes")
    attended_classes = data.get("attended_classes")

    # Validate input
    if not student_id or total_classes is None or attended_classes is None:
        return jsonify({"msg": "All fields are required"}), 400

    if total_classes <= 0 or attended_classes < 0:
        return jsonify({"msg": "Invalid attendance values"}), 400

    if attended_classes > total_classes:
        return jsonify({"msg": "Attended classes cannot exceed total classes"}), 400

    student = Student.query.get(student_id)
    if not student:
        return jsonify({"msg": "Student not found"}), 404

    # 🔐 SECURITY: Only that student can create their attendance
    if student.user_id != current_user_id:
        return jsonify({"msg": "Unauthorized access"}), 403

    attendance_percentage = (attended_classes / total_classes) * 100

    new_attendance = Attendance(
        student_id=student_id,
        total_classes=total_classes,
        attended_classes=attended_classes,
        attendance_percentage=attendance_percentage
    )

    db.session.add(new_attendance)
    db.session.commit()

    return jsonify({"msg": "Attendance created successfully"}), 201


# ✅ Get All Attendance (Only Admin Later)
@attendance_bp.route("/", methods=["GET"])
@jwt_required()
def get_all_attendance():
    current_user_id = int(get_jwt_identity())

    # 🔐 Only allow if needed — for now restrict
    return jsonify({"msg": "Access restricted"}), 403


# ✅ Get Attendance By Student (Secure)
@attendance_bp.route("/student/<int:student_id>", methods=["GET"])
@jwt_required()
def get_student_attendance(student_id):
    current_user_id = int(get_jwt_identity())
    from models.user import User
    current_user = User.query.get(current_user_id)

    student = Student.query.get(student_id)
    if not student:
        return jsonify({"msg": "Student not found"}), 404

    # Mentor/Admin can view any student; student can only view own
    if current_user.role == "student" and student.user_id != current_user_id:
        return jsonify({"msg": "Unauthorized access"}), 403

    records = Attendance.query.filter_by(student_id=student_id).all()

    if not records:
        return jsonify({"msg": "No attendance records found"}), 404

    return jsonify([record.to_dict() for record in records]), 200


# ✅ Mentor: Add attendance for any student
@attendance_bp.route("/mentor/create", methods=["POST"])
@jwt_required()
def mentor_create_attendance():
    from models.user import User
    current_user = User.query.get(int(get_jwt_identity()))
    if not current_user or current_user.role not in ["admin", "mentor"]:
        return jsonify({"msg": "Permission denied"}), 403

    data = request.get_json()
    student_id = data.get("student_id")
    total_classes = data.get("total_classes")
    attended_classes = data.get("attended_classes")

    if not student_id or total_classes is None or attended_classes is None:
        return jsonify({"msg": "All fields are required"}), 400
    if total_classes <= 0 or attended_classes < 0 or attended_classes > total_classes:
        return jsonify({"msg": "Invalid attendance values"}), 400

    student = Student.query.get(student_id)
    if not student:
        return jsonify({"msg": "Student not found"}), 404

    attendance_percentage = (attended_classes / total_classes) * 100
    new_attendance = Attendance(
        student_id=student_id,
        register_number=student.register_number,
        total_classes=total_classes,
        attended_classes=attended_classes,
        attendance_percentage=attendance_percentage
    )
    db.session.add(new_attendance)
    db.session.commit()
    return jsonify({"msg": "Attendance added successfully"}), 201
