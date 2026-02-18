from extensions import db
from datetime import datetime

class Student(db.Model):
    __tablename__ = "students"

    student_id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.user_id"),
        nullable=True,
        unique=True
    )

    # ⭐ ADD THIS
    student_name = db.Column(db.String(100), nullable=False)

    register_number = db.Column(db.String(50), unique=True, nullable=False)

    department = db.Column(db.String(100), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    semester = db.Column(db.Integer, nullable=False)

    admission_date = db.Column(db.Date, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # ---------- Safe Response ----------
    def to_dict(self):
        return {
            "student_id": self.student_id,
            "user_id": self.user_id,
            "student_name": self.student_name,
            "register_number": self.register_number,
            "department": self.department,
            "year": self.year,
            "semester": self.semester,
            "admission_date": self.admission_date,
            "created_at": self.created_at
        }
