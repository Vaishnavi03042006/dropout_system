from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db

from models.risk_analysis import RiskAnalysis
from models.students import Student
from models.user import User

from services.feature_builder import build_features_for_student
from services.rule_based import calculate_rule_score, assign_risk_level
from services.ml_model import predict_risk_level, train_ml_model

risk_bp = Blueprint("risk", __name__)


# =====================================================
# TRAIN ML MODEL
# =====================================================
@risk_bp.route("/train-model", methods=["POST"])
@jwt_required()
def train_model():

    current_user = User.query.get(int(get_jwt_identity()))
    if not current_user or current_user.role != "admin":
        return jsonify({"error": "Permission denied"}), 403

    success = train_ml_model()

    if success:
        return jsonify({"message": "ML model trained successfully"}), 200
    else:
        return jsonify({"error": "Failed to train model"}), 400


# =====================================================
# CREATE OR UPDATE RISK (HYBRID)
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

    # ---------------- FEATURE BUILD ----------------
    features = build_features_for_student(student.student_id)
    if not features:
        return jsonify({"error": "Feature generation failed"}), 400

    # ---------------- RULE SCORE ----------------
    rule_score = calculate_rule_score(features)

    # ---------------- ML SCORE ----------------
    try:
        ml_score, ml_risk_level, top_factors = predict_risk_level(features)
    except Exception as e:
        print("ML Prediction Error:", str(e))
        ml_score = 0.0
        ml_risk_level = "LOW"
        top_factors = []

    # ---------------- FINAL HYBRID ----------------
    final_score = (0.6 * rule_score) + (0.4 * ml_score)
    risk_level, color_code = assign_risk_level(final_score)

    # ---------------- UPSERT ----------------
    risk = RiskAnalysis.query.filter_by(
        student_id=student.student_id
    ).first()

    if not risk:
        risk = RiskAnalysis(
            student_id=student.student_id,
            register_number=student.register_number
        )
        db.session.add(risk)

    # Update values
    risk.rule_score = rule_score
    risk.ml_score = ml_score
    risk.final_score = final_score
    risk.risk_level = risk_level
    risk.color_code = color_code
    risk.top_factors = top_factors

    db.session.commit()

    return jsonify({
        "message": "Risk analysis processed successfully",
        "risk": risk.to_dict()
    }), 200


# =====================================================
# RECALCULATE RISK
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

    # Rule score
    rule_score = calculate_rule_score(features)

    # ML score
    try:
        ml_score, ml_risk_level, top_factors = predict_risk_level(features)
    except Exception as e:
        print("ML Prediction Error:", str(e))
        ml_score = risk.ml_score
        top_factors = risk.top_factors

    # Final hybrid
    final_score = (0.6 * rule_score) + (0.4 * ml_score)
    risk_level, color_code = assign_risk_level(final_score)

    # Update
    risk.rule_score = rule_score
    risk.ml_score = ml_score
    risk.final_score = final_score
    risk.risk_level = risk_level
    risk.color_code = color_code
    risk.top_factors = top_factors

    db.session.commit()

    return jsonify({
        "message": "Risk recalculated successfully",
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

    if current_user.role == "student":
        if student.user_id != current_user.user_id:
            return jsonify({"error": "Unauthorized access"}), 403

    risk = RiskAnalysis.query.filter_by(student_id=student_id).first()
    if not risk:
        return jsonify({"message": "No risk analysis found"}), 404

    return jsonify(risk.to_dict()), 200