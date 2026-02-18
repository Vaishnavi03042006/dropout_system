from flask import Blueprint, jsonify
from services.feature_builder import build_all_student_features

feature_test_bp = Blueprint("feature_test", __name__)

@feature_test_bp.route("/test/features", methods=["GET"])
def test_features():
    features = build_all_student_features()
    return jsonify(features), 200
