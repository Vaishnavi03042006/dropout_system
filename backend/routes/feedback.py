# from flask import Blueprint, request, jsonify
# from flask_jwt_extended import jwt_required, get_jwt_identity
# from extensions import db

# from models.feedback import Feedback
# from models.students import Student
# from models.user import User

# feedback_bp = Blueprint("feedback", __name__)

# # =====================================================
# # SUBMIT FEEDBACK (STUDENT ONLY)
# # =====================================================
# @feedback_bp.route("/", methods=["POST"])
# @jwt_required()
# def submit_feedback():

#     current_user = User.query.get(int(get_jwt_identity()))
#     if not current_user:
#         return jsonify({"error": "User not found"}), 404

#     if current_user.role != "student":
#         return jsonify({"error": "Only students can submit feedback"}), 403

#     student = Student.query.filter_by(user_id=current_user.user_id).first()
#     if not student:
#         return jsonify({"error": "Student record not found"}), 404

#     data = request.get_json()
#     if not data:
#         return jsonify({"error": "Invalid request body"}), 400

#     def validate_scale(value):
#         if value is None:
#             return 0
#         if not isinstance(value, int) or value < 0 or value > 10:
#             return 0
#         return value

#     feedback = Feedback(
#         student_id=student.student_id,
#         register_number=student.register_number,
#         stress_level=validate_scale(data.get("stress_level")),
#         academic_difficulty=validate_scale(data.get("academic_difficulty")),
#         financial_stress=validate_scale(data.get("financial_stress")),
#         notes=data.get("notes"),
#         action_taken=data.get("action_taken"),
#         risk_level=data.get("risk_level")  # optional pre-set risk
#     )

#     # Calculate risk score and level automatically
#     feedback.calculate_risk()

#     db.session.add(feedback)
#     db.session.commit()

#     return jsonify({
#         "message": "Feedback submitted successfully",
#         "feedback": feedback.to_dict()
#     }), 201


# # =====================================================
# # UPDATE FEEDBACK (STUDENT OR ADMIN)
# # =====================================================
# @feedback_bp.route("/<int:feedback_id>", methods=["PUT"])
# @jwt_required()
# def update_feedback(feedback_id):

#     current_user = User.query.get(int(get_jwt_identity()))
#     if not current_user:
#         return jsonify({"error": "User not found"}), 404

#     feedback = Feedback.query.get(feedback_id)
#     if not feedback:
#         return jsonify({"error": "Feedback not found"}), 404

#     # Students can only update their own feedback
#     if current_user.role == "student":
#         student = Student.query.filter_by(user_id=current_user.user_id).first()
#         if not student or feedback.student_id != student.student_id:
#             return jsonify({"error": "Unauthorized access"}), 403

#     data = request.get_json()
#     if not data:
#         return jsonify({"error": "Invalid request body"}), 400

#     def validate_scale(value):
#         if value is None:
#             return feedback.stress_level
#         if not isinstance(value, int) or value < 0 or value > 10:
#             return feedback.stress_level
#         return value

#     feedback.stress_level = validate_scale(data.get("stress_level"))
#     feedback.academic_difficulty = validate_scale(data.get("academic_difficulty"))
#     feedback.financial_stress = validate_scale(data.get("financial_stress"))
#     feedback.notes = data.get("notes", feedback.notes)
#     feedback.action_taken = data.get("action_taken", feedback.action_taken)
#     feedback.risk_level = data.get("risk_level", feedback.risk_level)

#     feedback.calculate_risk()

#     db.session.commit()

#     return jsonify({
#         "message": "Feedback updated successfully",
#         "feedback": feedback.to_dict()
#     }), 200


# # =====================================================
# # GET FEEDBACK BY STUDENT
# # =====================================================
# @feedback_bp.route("/student/<int:student_id>", methods=["GET"])
# @jwt_required()
# def get_feedback_by_student(student_id):

#     current_user = User.query.get(int(get_jwt_identity()))
#     if not current_user:
#         return jsonify({"error": "User not found"}), 404

#     # Students can only view their own feedback
#     if current_user.role == "student":
#         student = Student.query.filter_by(user_id=current_user.user_id).first()
#         if not student or student.student_id != student_id:
#             return jsonify({"error": "Unauthorized access"}), 403

#     feedback_list = Feedback.query.filter_by(
#         student_id=student_id
#     ).order_by(Feedback.created_at.desc()).all()

#     if not feedback_list:
#         return jsonify({"message": "No feedback found"}), 404

#     return jsonify([f.to_dict() for f in feedback_list]), 200


# # =====================================================
# # GET ALL STUDENT FEEDBACKS (MENTOR/ADMIN)
# # =====================================================
# @feedback_bp.route("/all", methods=["GET"])
# @jwt_required()
# def get_all_feedbacks():

#     current_user = User.query.get(int(get_jwt_identity()))
#     if not current_user or current_user.role not in ["mentor", "admin"]:
#         return jsonify({"error": "Permission denied"}), 403

#     feedback_list = Feedback.query.order_by(Feedback.created_at.desc()).all()

#     return jsonify([f.to_dict() for f in feedback_list]), 200
# routes/feedback.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.feedback import Feedback
from models.students import Student
from models.user import User
from models.alerts import Alert

feedback_bp = Blueprint("feedback", __name__)

# -------------------------
# SUBMIT FEEDBACK (Student)
# -------------------------
@feedback_bp.route("/", methods=["POST"])
@jwt_required()
def submit_feedback():
    current_user = User.query.get(int(get_jwt_identity()))
    if not current_user or current_user.role != "student":
        return jsonify({"error": "Only students can submit feedback"}), 403

    student = Student.query.filter_by(user_id=current_user.user_id).first()
    if not student:
        return jsonify({"error": "Student record not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request body"}), 400

    # Validate 0-10 scale values
    def validate_scale(v):
        if v is None:
            return 0
        try:
            v = int(v)
        except:
            return 0
        return max(0, min(10, v))

    feedback = Feedback(
        student_id=student.student_id,
        register_number=student.register_number,
        stress_level=validate_scale(data.get("stress_level")),
        academic_difficulty=validate_scale(data.get("academic_difficulty")),
        financial_stress=validate_scale(data.get("financial_stress")),
        notes=data.get("notes"),
        action_taken=data.get("action_taken")
    )

    feedback.calculate_risk()
    db.session.add(feedback)
    db.session.commit()

    # Optional: create alert for mentor if risk is Medium/High
    if feedback.risk_level in ["Medium", "High"]:
        mentor_id = data.get("mentor_id")
        if mentor_id:
            alert = Alert(
                student_id=student.student_id,
                mentor_id=mentor_id,
                feedback_id=feedback.feedback_id,
                message=f"Student {student.register_number} risk is {feedback.risk_level}. Check feedback."
            )
            db.session.add(alert)
            db.session.commit()

    return jsonify({
        "message": "Feedback submitted successfully",
        "feedback": feedback.to_dict()
    }), 201

# -------------------------
# UPDATE FEEDBACK (Student or Mentor/Admin)
# -------------------------
@feedback_bp.route("/<int:feedback_id>", methods=["PUT"])
@jwt_required()
def update_feedback(feedback_id):
    current_user = User.query.get(int(get_jwt_identity()))
    if not current_user:
        return jsonify({"error": "User not found"}), 404

    feedback = Feedback.query.get(feedback_id)
    if not feedback:
        return jsonify({"error": "Feedback not found"}), 404

    # Students can only update their own feedback
    if current_user.role == "student":
        student = Student.query.filter_by(user_id=current_user.user_id).first()
        if not student or feedback.student_id != student.student_id:
            return jsonify({"error": "Unauthorized access"}), 403
    elif current_user.role not in ["mentor", "admin"]:
        return jsonify({"error": "Permission denied"}), 403

    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request body"}), 400

    def validate_scale(value, prev):
        if value is None:
            return prev
        try:
            value = int(value)
        except:
            return prev
        return max(0, min(10, value))

    feedback.stress_level = validate_scale(data.get("stress_level"), feedback.stress_level)
    feedback.academic_difficulty = validate_scale(data.get("academic_difficulty"), feedback.academic_difficulty)
    feedback.financial_stress = validate_scale(data.get("financial_stress"), feedback.financial_stress)
    feedback.notes = data.get("notes", feedback.notes)
    feedback.action_taken = data.get("action_taken", feedback.action_taken)

    feedback.calculate_risk()
    db.session.commit()

    return jsonify({
        "message": "Feedback updated successfully",
        "feedback": feedback.to_dict()
    }), 200

# -------------------------
# GET FEEDBACK BY STUDENT
# -------------------------
@feedback_bp.route("/student/<int:student_id>", methods=["GET"])
@jwt_required()
def get_feedback_by_student(student_id):
    current_user = User.query.get(int(get_jwt_identity()))
    student = Student.query.get(student_id)
    if not student:
        return jsonify({"error": "Student not found"}), 404

    if current_user.role == "student" and current_user.user_id != student.user_id:
        return jsonify({"error": "Unauthorized access"}), 403

    feedback_list = Feedback.query.filter_by(student_id=student_id).order_by(Feedback.created_at.desc()).all()
    if not feedback_list:
        return jsonify({"message": "No feedback found"}), 404

    return jsonify([f.to_dict() for f in feedback_list]), 200

# -------------------------
# GET ALL FEEDBACKS (Mentor/Admin)
# -------------------------
@feedback_bp.route("/all", methods=["GET"])
@jwt_required()
def get_all_feedbacks():
    current_user = User.query.get(int(get_jwt_identity()))
    if not current_user or current_user.role not in ["mentor", "admin"]:
        return jsonify({"error": "Permission denied"}), 403

    feedback_list = Feedback.query.order_by(Feedback.created_at.desc()).all()
    return jsonify([f.to_dict() for f in feedback_list]), 200

# -------------------------
# GET ALERTS FOR MENTOR
# -------------------------
@feedback_bp.route("/alerts/<int:mentor_id>", methods=["GET"])
@jwt_required()
def get_alerts(mentor_id):
    current_user = User.query.get(int(get_jwt_identity()))
    if not current_user or current_user.role != "mentor":
        return jsonify({"error": "Permission denied"}), 403

    alerts = Alert.query.filter_by(mentor_id=mentor_id, read=False).all()
    return jsonify([a.to_dict() for a in alerts]), 200
@feedback_bp.route("/alerts/<int:alert_id>/read", methods=["PUT"])
@jwt_required()
def mark_alert_read(alert_id):
    alert = Alert.query.get(alert_id)
    if not alert:
        return jsonify({"error": "Alert not found"}), 404
    alert.read = True
    db.session.commit()
    return jsonify({"message": "Alert marked as read"}), 200