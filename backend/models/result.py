from extensions import db

class Result(db.Model):
    __tablename__ = "results"

    # 🔥 ADD HERE (inside class, before columns)
    __table_args__ = (
        db.UniqueConstraint(
            "register_number",
            "subject_code",
            "semester",
            name="unique_result"
        ),
    )

    result_id = db.Column(db.Integer, primary_key=True)

    student_id = db.Column(
        db.Integer,
        db.ForeignKey("students.student_id"),
        nullable=False
    )

    register_number = db.Column(
        db.String(50),
        nullable=False      # ❗ remove unique=True
    )

    subject_code = db.Column(db.String(50), nullable=False)
    subject_name = db.Column(db.String(100), nullable=False)

    semester = db.Column(db.Integer, nullable=False)

    internal1 = db.Column(db.Float, nullable=False)
    internal2 = db.Column(db.Float, nullable=False)
    internal3 = db.Column(db.Float, nullable=False)

    attempts = db.Column(db.Integer, nullable=False)

    result_status = db.Column(db.String(20), nullable=False)
    sem_mark = db.Column(db.Float, nullable=True)

    # Relationship
    student = db.relationship("Student", backref="results")
