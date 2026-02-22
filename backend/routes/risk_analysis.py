# from flask import Blueprint, request, jsonify
# from flask_jwt_extended import jwt_required, get_jwt_identity
# from extensions import db

# from models.risk_analysis import RiskAnalysis
# from models.students import Student
# from models.user import User

# from services.feature_builder import build_features_for_student
# from services.rule_based import calculate_rule_score, assign_risk_level

# risk_bp = Blueprint("risk", __name__)

# # =====================================================
# # CREATE RISK (MANUAL OR RULE-BASED)
# # =====================================================
# @risk_bp.route("/create", methods=["POST"])
# @jwt_required()
# def create_risk():

#     data = request.get_json()

#     current_user = User.query.get(int(get_jwt_identity()))
#     if not current_user:
#         return jsonify({"error": "User not found"}), 404

#     # 🔐 Admin only
#     if current_user.role != "admin":
#         return jsonify({"error": "Permission denied"}), 403

#     if "student_id" not in data:
#         return jsonify({"error": "student_id is required"}), 400

#     student = Student.query.get(data["student_id"])
#     if not student:
#         return jsonify({"error": "Student not found"}), 404

#     # -------------------------------------------------
#     # OPTION 1️⃣ : MANUAL SCORE (POSTMAN / FRONTEND)
#     # -------------------------------------------------
#     if "rule_score" in data:

#         rule_score = data["rule_score"]
#         ml_score = data.get("ml_score", 0)
#         final_score = data.get("final_score", rule_score)
#         risk_level = data["risk_level"]
#         color_code = data["color_code"]

#     # -------------------------------------------------
#     # OPTION 2️⃣ : AUTO RULE-BASED (FROM FEATURES)
#     # -------------------------------------------------
#     else:
#         features = build_features_for_student(student.student_id)
#         if not features:
#             return jsonify({"error": "Feature generation failed"}), 400

#         rule_score = calculate_rule_score(features)
#         ml_score = 0
#         final_score = (0.6 * rule_score) + (0.4 * ml_score)
#         risk_level, color_code = assign_risk_level(final_score)

#     # -------------------------------------------------
#     # STORE IN DATABASE
#     # -------------------------------------------------
#     risk = RiskAnalysis(
#         student_id=student.student_id,
#         register_number=student.register_number,
#         rule_score=rule_score,
#         ml_score=ml_score,
#         final_score=final_score,
#         risk_level=risk_level,
#         color_code=color_code
#     )

#     db.session.add(risk)
#     db.session.commit()

#     return jsonify({
#         "message": "Risk analysis created successfully",
#         "risk": risk.to_dict()
#     }), 201


# # =====================================================
# # UPDATE RISK (RECALCULATE WHEN DATA CHANGES)
# # =====================================================
# @risk_bp.route("/update/<int:student_id>", methods=["PUT"])
# @jwt_required()
# def update_risk(student_id):

#     current_user = User.query.get(int(get_jwt_identity()))
#     if current_user.role != "admin":
#         return jsonify({"error": "Permission denied"}), 403

#     student = Student.query.get(student_id)
#     if not student:
#         return jsonify({"error": "Student not found"}), 404

#     risk = RiskAnalysis.query.filter_by(student_id=student_id).first()
#     if not risk:
#         return jsonify({"error": "Risk record not found"}), 404

#     # 🔁 Recalculate using updated data
#     features = build_features_for_student(student.student_id)
#     if not features:
#         return jsonify({"error": "Feature generation failed"}), 400

#     rule_score = calculate_rule_score(features)
#     ml_score = 0
#     final_score = rule_score
#     risk_level, color_code = assign_risk_level(final_score)

#     # Update DB
#     risk.rule_score = rule_score
#     risk.ml_score = ml_score
#     risk.final_score = final_score
#     risk.risk_level = risk_level
#     risk.color_code = color_code

#     db.session.commit()

#     return jsonify({
#         "message": "Risk analysis updated successfully",
#         "risk": risk.to_dict()
#     }), 200


# # =====================================================
# # GET RISK BY STUDENT
# # =====================================================
# @risk_bp.route("/student/<int:student_id>", methods=["GET"])
# @jwt_required()
# def get_risk_by_student(student_id):

#     current_user = User.query.get(int(get_jwt_identity()))
#     if not current_user:
#         return jsonify({"error": "User not found"}), 404

#     student = Student.query.get(student_id)
#     if not student:
#         return jsonify({"error": "Student not found"}), 404

#     # 🔐 Student can see only own data
#     if current_user.role == "student":
#         if student.user_id != current_user.id:
#             return jsonify({"error": "Unauthorized access"}), 403

#     risks = RiskAnalysis.query.filter_by(student_id=student_id).all()

#     if not risks:
#         return jsonify({"message": "No risk analysis found"}), 404

#     return jsonify([r.to_dict() for r in risks]), 200
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db

from models.risk_analysis import RiskAnalysis
from models.students import Student
from models.user import User

from services.feature_builder import build_features_for_student
from services.rule_based import calculate_rule_score, assign_risk_level

risk_bp = Blueprint("risk", __name__)


# =====================================================
# CREATE OR UPDATE RISK (RULE-BASED)
# =====================================================
@risk_bp.route("/create", methods=["POST"])
@jwt_required()
def create_risk():

    current_user = User.query.get(int(get_jwt_identity()))
    if not current_user or current_user.role != "admin":
        return jsonify({"error": "Permission denied"}), 403

    data = request.get_json()

    if not data or "student_id" not in data:
        return jsonify({"error": "student_id is required"}), 400

    student = Student.query.get(data["student_id"])
    if not student:
        return jsonify({"error": "Student not found"}), 404

    # Build features
    features = build_features_for_student(student.student_id)
    if not features:
        return jsonify({"error": "Feature generation failed"}), 400

    # Calculate rule score
    rule_score = calculate_rule_score(features)

    # Default ML score (future will update)
    ml_score = 0

    # Final combined score
    final_score = (0.6 * rule_score) + (0.4 * ml_score)

    risk_level, color_code = assign_risk_level(final_score)

    # Check if risk already exists
    existing_risk = RiskAnalysis.query.filter_by(
        student_id=student.student_id
    ).first()

    if existing_risk:
        # Update existing record
        existing_risk.rule_score = rule_score
        existing_risk.final_score = final_score
        existing_risk.risk_level = risk_level
        existing_risk.color_code = color_code

        db.session.commit()

        return jsonify({
            "message": "Risk analysis updated successfully",
            "risk": existing_risk.to_dict()
        }), 200

    else:
        # Create new record
        risk = RiskAnalysis(
            student_id=student.student_id,
            register_number=student.register_number,
            rule_score=rule_score,
            ml_score=ml_score,
            final_score=final_score,
            risk_level=risk_level,
            color_code=color_code
        )

        db.session.add(risk)
        db.session.commit()

        return jsonify({
            "message": "Risk analysis created successfully",
            "risk": risk.to_dict()
        }), 201


# =====================================================
# UPDATE RISK WHEN STUDENT DATA CHANGES
# =====================================================
@risk_bp.route("/recalculate/<int:student_id>", methods=["PUT"])
@jwt_required()
def recalculate_risk(student_id):

    current_user = User.query.get(int(get_jwt_identity()))
    if not current_user or current_user.role != "admin":
        return jsonify({"error": "Permission denied"}), 403

    student = Student.query.get(student_id)
    if not student:
        return jsonify({"error": "Student not found"}), 404

    risk = RiskAnalysis.query.filter_by(student_id=student_id).first()
    if not risk:
        return jsonify({"error": "Risk record not found"}), 404

    features = build_features_for_student(student.student_id)
    if not features:
        return jsonify({"error": "Feature generation failed"}), 400

    rule_score = calculate_rule_score(features)

    # Keep existing ML score
    ml_score = risk.ml_score

    final_score = (0.6 * rule_score) + (0.4 * ml_score)
    risk_level, color_code = assign_risk_level(final_score)

    risk.rule_score = rule_score
    risk.final_score = final_score
    risk.risk_level = risk_level
    risk.color_code = color_code

    db.session.commit()

    return jsonify({
        "message": "Risk recalculated successfully",
        "risk": risk.to_dict()
    }), 200


# =====================================================
# UPDATE ML SCORE (FUTURE ML INTEGRATION)
# =====================================================
@risk_bp.route("/ml-update/<int:student_id>", methods=["PUT"])
@jwt_required()
def update_ml_score(student_id):

    current_user = User.query.get(int(get_jwt_identity()))
    if not current_user or current_user.role != "admin":
        return jsonify({"error": "Permission denied"}), 403

    risk = RiskAnalysis.query.filter_by(student_id=student_id).first()
    if not risk:
        return jsonify({"error": "Risk record not found"}), 404

    data = request.get_json()

    if not data or "ml_score" not in data:
        return jsonify({"error": "ml_score is required"}), 400

    ml_score = float(data["ml_score"])

    risk.ml_score = ml_score

    final_score = (0.6 * risk.rule_score) + (0.4 * ml_score)
    risk.final_score = final_score

    risk_level, color_code = assign_risk_level(final_score)

    risk.risk_level = risk_level
    risk.color_code = color_code

    db.session.commit()

    return jsonify({
        "message": "ML score updated successfully",
        "risk": risk.to_dict()
    }), 200


# =====================================================
# GET RISK BY STUDENT
# =====================================================
@risk_bp.route("/student/<int:student_id>", methods=["GET"])
@jwt_required()
def get_risk_by_student(student_id):

    current_user = User.query.get(int(get_jwt_identity()))
    if not current_user:
        return jsonify({"error": "User not found"}), 404

    student = Student.query.get(student_id)
    if not student:
        return jsonify({"error": "Student not found"}), 404

    # Student can view only their own record
    if current_user.role == "student":
        if student.user_id != current_user.user_id:
            return jsonify({"error": "Unauthorized access"}), 403

    risk = RiskAnalysis.query.filter_by(student_id=student_id).first()

    if not risk:
        return jsonify({"message": "No risk analysis found"}), 404

    return jsonify(risk.to_dict()), 200