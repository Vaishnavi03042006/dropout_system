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
    register_number = db.Column(db.String(50), unique=True, nullable=False)
    # Hybrid scores
    rule_score = db.Column(db.Float, nullable=False)
    ml_score = db.Column(db.Float, nullable=False)
    final_score = db.Column(db.Float, nullable=False)

    risk_level = db.Column(
        db.String(20),
        nullable=False
        # LOW / MEDIUM / HIGH
    )

    color_code = db.Column(db.String(20), nullable=False)

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    # optional relationship (safe)
    student = db.relationship("Student", backref="risk_records")

    # ---------- Safe Response ----------
    def to_dict(self):
        return {
            "risk_id": self.risk_id,
            "register_number": self.register_number,
            "student_id": self.student_id,
            "rule_score": self.rule_score,
            "ml_score": self.ml_score,
            "final_score": self.final_score,
            "risk_level": self.risk_level,
            "color_code": self.color_code,
            "created_at": self.created_at.isoformat()
        }
