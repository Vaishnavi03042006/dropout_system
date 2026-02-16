from extensions import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = "users"

    user_id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(100), nullable=False)

    email = db.Column(db.String(120), unique=True, nullable=False)

    password_hash = db.Column(db.String(200), nullable=False)

    role = db.Column(
        db.String(20),
        nullable=False
        # admin, mentor, counsellor, student, parent
    )

    department = db.Column(db.String(100), nullable=True)

    class_id = db.Column(db.String(50), nullable=True)

    # ---------- Security Methods ----------

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    # ---------- Safe Response ----------

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "department": self.department,
            "class_id": self.class_id
        }
