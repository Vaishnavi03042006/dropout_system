from extensions import db
from datetime import date

class Fees(db.Model):
    __tablename__ = "fees"
    __table_args__ = (
    db.UniqueConstraint(
        "register_number",
        "semester",
        name="unique_fee"
    ),
)


    fee_id = db.Column(db.Integer, primary_key=True)

    student_id = db.Column(
        db.Integer,
        db.ForeignKey("students.student_id"),
        nullable=False
    )
    register_number = db.Column(db.String(50),nullable=False)
    semester = db.Column(db.Integer, nullable=False)
    tuition_fee = db.Column(db.Float, nullable=False)
    hostel_fee = db.Column(db.Float, nullable=True)
    payment_status = db.Column(
        db.String(20),
        nullable=False
        # PAID / UNPAID / PARTIAL
    )
    deadline = db.Column(db.Date, nullable=True)

    # Relationship
    student = db.relationship("Student", backref="fees")

    # ---------- Safe Response ----------
    def to_dict(self):
        return {
            "fee_id": self.fee_id,
            "student_id": self.student_id,
            "register_number": self.register_number,
            "semester": self.semester,
            "tuition_fee": self.tuition_fee,
            "hostel_fee": self.hostel_fee,
            "payment_status": self.payment_status,
            "deadline": self.deadline.isoformat() if self.deadline else None
        }
