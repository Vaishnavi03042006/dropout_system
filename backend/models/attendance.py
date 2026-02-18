from extensions import db
from datetime import datetime

class Attendance(db.Model):
    __tablename__ = "attendance"

    attendance_id = db.Column(db.Integer, primary_key=True)

    student_id = db.Column(
        db.Integer,
        db.ForeignKey("students.student_id"),
        nullable=False
    )
    register_number = db.Column(db.String(50), nullable=False)
    total_classes = db.Column(db.Integer, nullable=False)
    attended_classes = db.Column(db.Integer, nullable=False)
    attendance_percentage = db.Column(db.Float, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship
    student = db.relationship("Student", backref="attendance_records")

    # ---------- Safe Response ----------
    def to_dict(self):
        return {
            "attendance_id": self.attendance_id,
            "student_id": self.student_id,
            "register_number": self.register_number,
            "total_classes": self.total_classes,
            "attended_classes": self.attended_classes,
            "attendance_percentage": self.attendance_percentage,
            "created_at": self.created_at
        }
