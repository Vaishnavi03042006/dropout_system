from extensions import db
from datetime import datetime

class Alert(db.Model):
    __tablename__ = "alerts"

    alert_id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("students.student_id"), nullable=False)
    mentor_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)
    feedback_id = db.Column(db.Integer, db.ForeignKey("feedback.feedback_id"), nullable=False)
    message = db.Column(db.String(255), nullable=False)
    read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "alert_id": self.alert_id,
            "student_id": self.student_id,
            "mentor_id": self.mentor_id,
            "feedback_id": self.feedback_id,
            "message": self.message,
            "read": self.read,
            "created_at": self.created_at.isoformat()
        }