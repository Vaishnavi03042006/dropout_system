# from extensions import db

# class Student(db.Model):
#     __tablename__ = "students"

#     student_id = db.Column(db.Integer, primary_key=True)

#     name = db.Column(db.String(100), nullable=False)

#     college_name = db.Column(db.String(150), nullable=False)

#     department = db.Column(db.String(100), nullable=False)

#     class_name = db.Column(db.String(50), nullable=False)

#     mentor_id = db.Column(db.Integer, nullable=True)
#     # refers to users.user_id (mentor)

#     user_id = db.Column(db.Integer, nullable=True)
#     # refers to users.user_id (student login)

#     parent_phone = db.Column(db.String(15), nullable=True)
