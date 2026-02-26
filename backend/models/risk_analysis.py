from extensions import db
from datetime import datetime

class RiskAnalysis(db.Model):
    __tablename__ = "risk_analysis"

    risk_id = db.Column(db.Integer, primary_key=True)

    student_id = db.Column(
        db.Integer,
        db.ForeignKey("students.student_id"),
        nullable=False
    )

    register_number = db.Column(db.String(50), nullable=False)

    # -----------------------
    # STAGE (Early/Mid/Final)
    # -----------------------
    stage = db.Column(
        db.String(20),
        default="early"
    )

    # -----------------------
    # HYBRID SCORES
    # -----------------------
    rule_score = db.Column(db.Float, nullable=False)
    ml_score = db.Column(db.Float, nullable=False)
    final_score = db.Column(db.Float, nullable=False)

    # -----------------------
    # RISK CLASSIFICATION
    # -----------------------
    risk_level = db.Column(
        db.String(20),
        nullable=False   # LOW / MEDIUM / HIGH
    )

    color_code = db.Column(db.String(20), nullable=False)

    # -----------------------
    # EXPLAINABLE AI STORAGE
    # -----------------------
    top_factors = db.Column(
        db.JSON,
        nullable=True
    )

    # -----------------------
    # MULTI-LABEL READY (Future)
    # -----------------------
    academic_risk = db.Column(db.String(20), nullable=True)
    attendance_risk = db.Column(db.String(20), nullable=True)
    financial_risk = db.Column(db.String(20), nullable=True)

    # -----------------------
    # INTERVENTION TRACKING
    # -----------------------
    recommended_action = db.Column(db.String(255), nullable=True)
    intervention_status = db.Column(db.String(50), default="pending")
    # pending / in_progress / completed

    # -----------------------
    # TIMESTAMP
    # -----------------------
    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    # -----------------------
    # RELATIONSHIP
    # -----------------------
    student = db.relationship("Student", backref="risk_records")

    # -----------------------
    # SAFE RESPONSE
    # -----------------------
    def to_dict(self):
        return {
            "risk_id": self.risk_id,
            "register_number": self.register_number,
            "student_id": self.student_id,
            "stage": self.stage,
            "rule_score": self.rule_score,
            "ml_score": self.ml_score,
            "final_score": self.final_score,
            "risk_level": self.risk_level,
            "color_code": self.color_code,
            "top_factors": self.top_factors,
            "academic_risk": self.academic_risk,
            "attendance_risk": self.attendance_risk,
            "financial_risk": self.financial_risk,
            "recommended_action": self.recommended_action,
            "intervention_status": self.intervention_status,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }
