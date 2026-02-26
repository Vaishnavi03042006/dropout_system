from extensions import db
from datetime import datetime


class Feedback(db.Model):
    __tablename__ = "feedback"

    feedback_id = db.Column(db.Integer, primary_key=True)

    student_id = db.Column(
        db.Integer,
        db.ForeignKey("students.student_id"),
        nullable=False
    )

    register_number = db.Column(db.String(50), nullable=False)

    stress_level = db.Column(db.Integer, nullable=False)
    academic_difficulty = db.Column(db.Integer, nullable=False)
    financial_stress = db.Column(db.Integer, nullable=False)

    risk_score = db.Column(db.Float, nullable=True)
    risk_level = db.Column(db.String(20), nullable=True)

    notes = db.Column(db.Text, nullable=True)
    action_taken = db.Column(db.Text, nullable=True)

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    student = db.relationship("Student", backref="feedback_records")

    # ----------------------------
    # Risk Calculation Method
    # ----------------------------
    def calculate_risk(self):
        score = (
            self.stress_level +
            self.academic_difficulty +
            self.financial_stress
        ) / 3

        self.risk_score = round(score, 2)

        if score >= 7:
            self.risk_level = "High"
        elif score >= 4:
            self.risk_level = "Medium"
        else:
            self.risk_level = "Low"

    # ----------------------------
    # Convert to Dictionary
    # ----------------------------
    def to_dict(self):
        return {
            "feedback_id": self.feedback_id,
            "student_id": self.student_id,
            "register_number": self.register_number,
            "stress_level": self.stress_level,
            "academic_difficulty": self.academic_difficulty,
            "financial_stress": self.financial_stress,
            "risk_score": self.risk_score,
            "risk_level": self.risk_level,
            "notes": self.notes,
            "action_taken": self.action_taken,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }