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

    try:
        df = pd.read_excel(file)
    except Exception as e:
        return jsonify({"error": f"Invalid Excel file: {str(e)}"}), 400

    inserted, updated, skipped = 0, 0, 0

    try:
        with db.session.no_autoflush:
            for _, row in df.iterrows():
                try:
                    register_number = str(row["register_number"]).strip()

                    # Link with User table if exists
                    user = User.query.filter_by(
                        register_number=register_number,
                        role="student"
                    ).first()

                    student = Student.query.filter_by(
                        register_number=register_number
                    ).first()

                    if student:
                        # UPDATE — never touch student_id
                        student.student_name = str(row["student_name"]).strip()
                        student.department = str(row["department"]).strip()
                        student.year = int(row["year"])
                        student.semester = int(row["semester"])
                        student.admission_date = pd.to_datetime(row["admission_date"]).date()
                        if user:
                            student.user_id = user.user_id
                        updated += 1
                    else:
                        # INSERT — let DB auto-generate student_id
                        student = Student(
                            user_id=user.user_id if user else None,
                            student_name=str(row["student_name"]).strip(),
                            register_number=register_number,
                            department=str(row["department"]).strip(),
                            year=int(row["year"]),
                            semester=int(row["semester"]),
                            admission_date=pd.to_datetime(row["admission_date"]).date()
                        )
                        db.session.add(student)
                        inserted += 1
                except Exception:
                    skipped += 1
                    continue

        db.session.commit()

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

    return jsonify({
        "message": f"Students uploaded — {inserted} inserted, {updated} updated, {skipped} skipped"
    }), 200
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
        with db.session.no_autoflush:
            for _, row in df.iterrows():
                student = Student.query.filter_by(
                    register_number=row["register_number"]
                ).first()
                if not student:
                    continue

                attendance_percentage = (row["attended_classes"] / row["total_classes"]) * 100

                attendance = Attendance.query.filter_by(
                    register_number=row["register_number"]
                ).first()

                if attendance:
                    attendance.student_id = student.student_id
                    attendance.total_classes = int(row["total_classes"])
                    attendance.attended_classes = int(row["attended_classes"])
                    attendance.attendance_percentage = attendance_percentage
                else:
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
        with db.session.no_autoflush:
            for _, row in df.iterrows():
                student = Student.query.filter_by(
                    register_number=row["register_number"]
                ).first()
                if not student:
                    continue

                result = Result.query.filter_by(
                    register_number=row["register_number"],
                    subject_code=row["subject_code"],
                    semester=int(row["semester"])
                ).first()

                if result:
                    result.student_id = student.student_id
                    result.subject_name = row["subject_name"]
                    result.internal1 = float(row["internal1"])
                    result.internal2 = float(row["internal2"])
                    result.internal3 = float(row["internal3"])
                    result.attempts = int(row["attempts"])
                    result.result_status = row["result_status"]
                    result.sem_mark = row.get("sem_mark")
                else:
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
        with db.session.no_autoflush:
            for _, row in df.iterrows():
                student = Student.query.filter_by(
                    register_number=row["register_number"]
                ).first()
                if not student:
                    continue

                fee = Fees.query.filter_by(
                    register_number=row["register_number"],
                    semester=int(row["semester"])
                ).first()

                if fee:
                    fee.student_id = student.student_id
                    fee.tuition_fee = float(row["tuition_fee"])
                    fee.hostel_fee = row.get("hostel_fee")
                    fee.payment_status = row["payment_status"]
                    fee.deadline = pd.to_datetime(row["deadline"]).date() if "deadline" in row and pd.notna(row["deadline"]) else None
                else:
                    fee = Fees(
                        student_id=student.student_id,
                        register_number=row["register_number"],
                        semester=int(row["semester"]),
                        tuition_fee=float(row["tuition_fee"]),
                        hostel_fee=row.get("hostel_fee"),
                        payment_status=row["payment_status"],
                        deadline=pd.to_datetime(row["deadline"]).date() if "deadline" in row and pd.notna(row["deadline"]) else None
                    )
                    db.session.add(fee)

        db.session.commit()

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

    return jsonify({"message": "Fees uploaded successfully"})
