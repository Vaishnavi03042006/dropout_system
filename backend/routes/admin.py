from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.user import User
from models.students import Student
from models.attendance import Attendance
from models.result import Result
from models.fees import Fees
from models.risk_analysis import RiskAnalysis
from models.feedback import Feedback

admin_bp = Blueprint("admin", __name__)

def require_admin():
    user = User.query.get(int(get_jwt_identity()))
    if not user or user.role != "admin":
        return None, jsonify({"error": "Permission denied"}), 403
    return user, None, None

# ── System Stats ──────────────────────────────────────────
@admin_bp.route("/stats", methods=["GET"])
@jwt_required()
def get_stats():
    user, err, code = require_admin()
    if err: return err, code

    total_students = Student.query.count()
    total_users    = User.query.count()
    high_risk      = RiskAnalysis.query.filter_by(risk_level="HIGH").count()
    medium_risk    = RiskAnalysis.query.filter_by(risk_level="MEDIUM").count()
    low_risk       = RiskAnalysis.query.filter_by(risk_level="LOW").count()
    total_feedback = Feedback.query.count()
    low_att        = db.session.query(Attendance).filter(Attendance.attendance_percentage < 75).count()

    roles = {}
    for role in ["admin", "mentor", "counsellor", "student", "parent"]:
        roles[role] = User.query.filter_by(role=role).count()

    return jsonify({
        "total_students": total_students,
        "total_users": total_users,
        "high_risk": high_risk,
        "medium_risk": medium_risk,
        "low_risk": low_risk,
        "total_feedback": total_feedback,
        "low_attendance": low_att,
        "users_by_role": roles
    }), 200

# ── All Users ─────────────────────────────────────────────
@admin_bp.route("/users", methods=["GET"])
@jwt_required()
def get_all_users():
    user, err, code = require_admin()
    if err: return err, code
    users = User.query.order_by(User.user_id.desc()).all()
    return jsonify([u.to_dict() for u in users]), 200

# ── Delete User ───────────────────────────────────────────
@admin_bp.route("/users/<int:user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):
    user, err, code = require_admin()
    if err: return err, code
    target = User.query.get(user_id)
    if not target:
        return jsonify({"error": "User not found"}), 404
    db.session.delete(target)
    db.session.commit()
    return jsonify({"message": "User deleted"}), 200

# ── Update User Role ──────────────────────────────────────
@admin_bp.route("/users/<int:user_id>/role", methods=["PUT"])
@jwt_required()
def update_user_role(user_id):
    user, err, code = require_admin()
    if err: return err, code
    target = User.query.get(user_id)
    if not target:
        return jsonify({"error": "User not found"}), 404
    data = request.get_json()
    new_role = data.get("role")
    if new_role not in ["admin", "mentor", "counsellor", "student", "parent"]:
        return jsonify({"error": "Invalid role"}), 400
    target.role = new_role
    db.session.commit()
    return jsonify({"message": "Role updated", "user": target.to_dict()}), 200

# ── All Students ──────────────────────────────────────────
@admin_bp.route("/students", methods=["GET"])
@jwt_required()
def get_all_students():
    user, err, code = require_admin()
    if err: return err, code
    students = Student.query.all()
    return jsonify([s.to_dict() for s in students]), 200


# ── Create Student (User + Student profile) ───────────────
@admin_bp.route("/students", methods=["POST"])
@jwt_required()
def create_student():
    user, err, code = require_admin()
    if err: return err, code

    data = request.get_json()
    required = ["name", "email", "password", "student_name", "department", "year", "semester", "admission_date"]
    for f in required:
        if not data.get(f):
            return jsonify({"error": f"{f} is required"}), 400

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already exists"}), 400

    # Auto-generate register number
    dept_codes = {"CSE": "eucs", "IT": "euit"}
    code_str = dept_codes.get(data["department"].upper())
    if not code_str:
        return jsonify({"error": "Invalid department. Use CSE or IT"}), 400

    last = User.query.filter(
        User.role == "student",
        User.department == data["department"],
        User.register_number != None
    ).order_by(User.user_id.desc()).first()
    next_num = (int(last.register_number[-3:]) + 1) if last else 1
    register_number = f"727723{code_str}{next_num:03}"

    # Create User
    new_user = User(
        name=data["name"],
        email=data["email"],
        role="student",
        department=data["department"],
        register_number=register_number
    )
    new_user.set_password(data["password"])
    db.session.add(new_user)
    db.session.flush()  # get user_id before commit

    # Create Student profile
    from datetime import datetime
    student = Student(
        user_id=new_user.user_id,
        student_name=data["student_name"],
        register_number=register_number,
        department=data["department"],
        year=int(data["year"]),
        semester=int(data["semester"]),
        admission_date=datetime.strptime(data["admission_date"], "%Y-%m-%d").date()
    )
    db.session.add(student)
    db.session.commit()

    return jsonify({
        "message": f"Student created with register number {register_number}",
        "register_number": register_number,
        "student": student.to_dict()
    }), 201

# ── Run Risk for ALL students ─────────────────────────────
@admin_bp.route("/risk/run-all", methods=["POST"])
@jwt_required()
def run_risk_all():
    user, err, code = require_admin()
    if err: return err, code

    from services.feature_builder import build_features_for_student
    from services.rule_based import calculate_rule_score, assign_risk_level
    from services.ml_model import predict_risk_level

    students = Student.query.all()
    success, failed = 0, 0

    for student in students:
        try:
            features = build_features_for_student(student.student_id)
            if not features:
                failed += 1
                continue

            rule_score = calculate_rule_score(features)
            try:
                ml_score, _, top_factors = predict_risk_level(features)
            except Exception:
                ml_score, top_factors = 0.0, []

            final_score = (0.6 * rule_score) + (0.4 * ml_score)
            risk_level, color_code = assign_risk_level(final_score)

            risk = RiskAnalysis.query.filter_by(student_id=student.student_id).first()
            if not risk:
                risk = RiskAnalysis(student_id=student.student_id, register_number=student.register_number)
                db.session.add(risk)

            risk.rule_score = rule_score
            risk.ml_score   = ml_score
            risk.final_score = final_score
            risk.risk_level  = risk_level
            risk.color_code  = color_code
            risk.top_factors = top_factors
            success += 1
        except Exception:
            failed += 1

    db.session.commit()
    return jsonify({"message": f"Risk analysis complete — {success} success, {failed} failed"}), 200

# ── All Risk Records ──────────────────────────────────────
@admin_bp.route("/risk/all", methods=["GET"])
@jwt_required()
def get_all_risk():
    user, err, code = require_admin()
    if err: return err, code
    risks = RiskAnalysis.query.all()
    return jsonify([r.to_dict() for r in risks]), 200

# ── Train ML Model ────────────────────────────────────────
@admin_bp.route("/train-model", methods=["POST"])
@jwt_required()
def train_model():
    user, err, code = require_admin()
    if err: return err, code
    from services.ml_model import train_ml_model
    success = train_ml_model()
    if success:
        return jsonify({"message": "ML model trained successfully"}), 200
    return jsonify({"error": "Training failed"}), 400

# ── All Feedback ──────────────────────────────────────────
@admin_bp.route("/feedback", methods=["GET"])
@jwt_required()
def get_all_feedback():
    user, err, code = require_admin()
    if err: return err, code
    feedbacks = Feedback.query.order_by(Feedback.created_at.desc()).all()
    return jsonify([f.to_dict() for f in feedbacks]), 200

# ── Department Stats ──────────────────────────────────────
@admin_bp.route("/dept-stats", methods=["GET"])
@jwt_required()
def dept_stats():
    user, err, code = require_admin()
    if err: return err, code

    students = Student.query.all()
    dept_map = {}
    for s in students:
        d = s.department
        if d not in dept_map:
            dept_map[d] = {"department": d, "total": 0, "high": 0, "medium": 0, "low": 0}
        dept_map[d]["total"] += 1
        risk = RiskAnalysis.query.filter_by(student_id=s.student_id).first()
        if risk:
            dept_map[d][risk.risk_level.lower()] += 1

    return jsonify(list(dept_map.values())), 200
