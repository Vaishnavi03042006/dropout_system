from extensions import db

class Result(db.Model):
    __tablename__ = "results"

    result_id = db.Column(db.Integer, primary_key=True)

    student_id = db.Column(
        db.Integer,
        db.ForeignKey("students.student_id"),
        nullable=False
    )

    subject_code = db.Column(db.String(50), nullable=False)
    subject_name = db.Column(db.String(100), nullable=False)

    semester = db.Column(db.Integer, nullable=False)

    internal1 = db.Column(db.Float, nullable=False)
    internal2 = db.Column(db.Float, nullable=False)
    internal3 = db.Column(db.Float, nullable=False)

    attempts = db.Column(db.Integer, nullable=False)

    result_status = db.Column(
        db.String(20),
        nullable=False
        # PASS / FAIL / PENDING
    )
    sem_mark = db.Column(db.Float, nullable=True)
    # Relationship
    student = db.relationship("Student", backref="results")

    # ---------- Safe Response ----------
    def to_dict(self):
        return {
            "result_id": self.result_id,
            "student_id": self.student_id,
            "subject_code": self.subject_code,
            "subject_name": self.subject_name,
            "semester": self.semester,
            "internal1": self.internal1,
            "internal2": self.internal2,
            "internal3": self.internal3,
            "attempts": self.attempts,
            "result_status": self.result_status,
            "sem_mark": self.sem_mark
        }
