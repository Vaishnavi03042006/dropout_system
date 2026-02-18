from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.risk_analysis import RiskAnalysis
from models.students import Student
from models.user import User

risk_bp = Blueprint("risk", __name__)

# ---------------- CREATE RISK ANALYSIS ----------------
@risk_bp.route("/create", methods=["POST"])
@jwt_required()
def create_risk():

    data = request.get_json()

    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)

    if not current_user:
        return jsonify({"error": "User not found"}), 404

    # 🔐 ONLY ADMIN CAN RUN ANALYSIS
    if current_user.role != "admin":
        return jsonify({"error": "Permission denied"}), 403

    required_fields = [
        "student_id",
        "rule_score",
        "ml_score",
        "final_score",
        "risk_level",
        "color_code"
    ]

    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    student = Student.query.get(data["student_id"])
    if not student:
        return jsonify({"error": "Student not found"}), 404

    risk = RiskAnalysis(
        student_id=data["student_id"],
        rule_score=data["rule_score"],
        ml_score=data["ml_score"],
        final_score=data["final_score"],
        risk_level=data["risk_level"],
        color_code=data["color_code"]
    )

    db.session.add(risk)
    db.session.commit()

    return jsonify({
        "message": "Risk analysis created successfully",
        "risk": risk.to_dict()
    }), 201


# ---------------- GET RISK BY STUDENT ----------------
@risk_bp.route("/student/<int:student_id>", methods=["GET"])
@jwt_required()
def get_risk_by_student(student_id):

    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)

    if not current_user:
        return jsonify({"error": "User not found"}), 404

    student = Student.query.get(student_id)
    if not student:
        return jsonify({"error": "Student not found"}), 404

    # 🔐 ACCESS CONTROL
    if current_user.role == "student":
        if student.user_id != current_user_id:
            return jsonify({"error": "Unauthorized access"}), 403

    risks = RiskAnalysis.query.filter_by(student_id=student_id).all()

    if not risks:
        return jsonify({"message": "No risk analysis found"}), 404

    return jsonify([r.to_dict() for r in risks]), 200
