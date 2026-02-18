from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import pandas as pd

from extensions import db
from models.user import User
from models.students import Student
from models.attendance import Attendance
from models.result import Result
from models.fees import Fees


upload_bp = Blueprint("upload", __name__)


# =====================================================
# STUDENT UPLOAD (INSERT OR UPDATE)
# =====================================================
@upload_bp.route("/students", methods=["POST"])
@jwt_required()
def upload_students():

    current_user = User.query.get(int(get_jwt_identity()))

    if current_user.role not in ["admin", "mentor"]:
        return jsonify({"error": "Permission denied"}), 403

    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    df = pd.read_excel(file)

    try:
        for _, row in df.iterrows():

            # Check existing student using register number
            student = Student.query.filter_by(
                register_number=row["register_number"]
            ).first()

            # Link with User table automatically
            user = User.query.filter_by(
                register_number=row["register_number"],
                role="student"
            ).first()

            if student:
                # ---------- UPDATE ----------
                student.student_name = row["student_name"]
                student.department = row["department"]
                student.year = int(row["year"])
                student.semester = int(row["semester"])
                student.admission_date = pd.to_datetime(
                    row["admission_date"]
                ).date()

                if user:
                    student.user_id = user.user_id

            else:
                # ---------- INSERT ----------
                student = Student(
                    student_id=int(row["student_id"]),
                    user_id=user.user_id if user else None,
                    student_name=row["student_name"],
                    register_number=row["register_number"],
                    department=row["department"],
                    year=int(row["year"]),
                    semester=int(row["semester"]),
                    admission_date=pd.to_datetime(
                        row["admission_date"]
                    ).date()
                )

                db.session.add(student)

        db.session.commit()

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

    return jsonify({"message": "Students uploaded successfully"})
@upload_bp.route("/attendance", methods=["POST"])
@jwt_required()
def upload_attendance():

    current_user = User.query.get(int(get_jwt_identity()))

    if current_user.role not in ["admin", "mentor"]:
        return jsonify({"error": "Permission denied"}), 403

    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    df = pd.read_excel(file)

    try:
        for _, row in df.iterrows():

            # -------------------------------------------------
            # 1️⃣ Get student using register number
            # -------------------------------------------------
            student = Student.query.filter_by(
                register_number=row["register_number"]
            ).first()

            if not student:
                continue   # skip unknown students

            # -------------------------------------------------
            # 2️⃣ Calculate attendance %
            # -------------------------------------------------
            attendance_percentage = (
                row["attended_classes"] / row["total_classes"]
            ) * 100

            # -------------------------------------------------
            # 3️⃣ Check existing attendance
            # -------------------------------------------------
            attendance = Attendance.query.filter_by(
                register_number=row["register_number"]
            ).first()

            if attendance:
                # ---------- UPDATE ----------
                attendance.student_id = student.student_id
                attendance.total_classes = int(row["total_classes"])
                attendance.attended_classes = int(row["attended_classes"])
                attendance.attendance_percentage = attendance_percentage

            else:
                # ---------- INSERT ----------
                attendance = Attendance(
                    student_id=student.student_id,
                    register_number=row["register_number"],
                    total_classes=int(row["total_classes"]),
                    attended_classes=int(row["attended_classes"]),
                    attendance_percentage=attendance_percentage
                )
                db.session.add(attendance)

        db.session.commit()

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

    return jsonify({"message": "Attendance uploaded successfully"})

@upload_bp.route("/results", methods=["POST"])
@jwt_required()
def upload_results():

    current_user = User.query.get(int(get_jwt_identity()))

    if current_user.role not in ["admin", "mentor"]:
        return jsonify({"error": "Permission denied"}), 403

    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    df = pd.read_excel(file)

    try:
        for _, row in df.iterrows():

            # -------------------------------------------------
            # 1️⃣ Get student using register number
            # -------------------------------------------------
            student = Student.query.filter_by(
                register_number=row["register_number"]
            ).first()

            if not student:
                continue  # skip unknown students

            # -------------------------------------------------
            # 2️⃣ Check existing result (UPSERT)
            # -------------------------------------------------
            result = Result.query.filter_by(
                register_number=row["register_number"],
                subject_code=row["subject_code"],
                semester=int(row["semester"])
            ).first()

            if result:
                # ---------- UPDATE ----------
                result.student_id = student.student_id
                result.subject_name = row["subject_name"]
                result.internal1 = float(row["internal1"])
                result.internal2 = float(row["internal2"])
                result.internal3 = float(row["internal3"])
                result.attempts = int(row["attempts"])
                result.result_status = row["result_status"]
                result.sem_mark = row.get("sem_mark")

            else:
                # ---------- INSERT ----------
                result = Result(
                    student_id=student.student_id,
                    register_number=row["register_number"],
                    subject_code=row["subject_code"],
                    subject_name=row["subject_name"],
                    semester=int(row["semester"]),
                    internal1=float(row["internal1"]),
                    internal2=float(row["internal2"]),
                    internal3=float(row["internal3"]),
                    attempts=int(row["attempts"]),
                    result_status=row["result_status"],
                    sem_mark=row.get("sem_mark")
                )

                db.session.add(result)

        db.session.commit()

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

    return jsonify({"message": "Results uploaded successfully"})

@upload_bp.route("/fees", methods=["POST"])
@jwt_required()
def upload_fees():

    current_user = User.query.get(int(get_jwt_identity()))

    if current_user.role not in ["admin", "mentor"]:
        return jsonify({"error": "Permission denied"}), 403

    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    df = pd.read_excel(file)

    try:
        for _, row in df.iterrows():

            # -------------------------------------------------
            # 1️⃣ Get student using register number
            # -------------------------------------------------
            student = Student.query.filter_by(
                register_number=row["register_number"]
            ).first()

            if not student:
                continue   # skip unknown students

            # -------------------------------------------------
            # 2️⃣ Check existing fee record
            # -------------------------------------------------
            fee = Fees.query.filter_by(
                register_number=row["register_number"],
                semester=int(row["semester"])
            ).first()

            if fee:
                # ---------- UPDATE ----------
                fee.student_id = student.student_id
                fee.tuition_fee = float(row["tuition_fee"])
                fee.hostel_fee = row.get("hostel_fee")
                fee.payment_status = row["payment_status"]
                fee.deadline = pd.to_datetime(
                    row["deadline"]
                ).date() if "deadline" in row else None

            else:
                # ---------- INSERT ----------
                fee = Fees(
                    student_id=student.student_id,
                    register_number=row["register_number"],
                    semester=int(row["semester"]),
                    tuition_fee=float(row["tuition_fee"]),
                    hostel_fee=row.get("hostel_fee"),
                    payment_status=row["payment_status"],
                    deadline=pd.to_datetime(
                        row["deadline"]
                    ).date() if "deadline" in row else None
                )

                db.session.add(fee)

        db.session.commit()

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

    return jsonify({"message": "Fees uploaded successfully"})
