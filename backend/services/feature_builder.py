from models.students import Student
from models.attendance import Attendance
from models.result import Result
from models.fees import Fees


def build_features_for_student(student_id):
    """
    Build ML-ready features for ONE student
    """

    # ---------- STUDENT ----------
    student = Student.query.get(student_id)

    if not student:
        return None

    register_number = student.register_number

    # ---------- ATTENDANCE ----------
    attendance_record = Attendance.query.filter_by(
        student_id=student_id
    ).first()

    attendance_percentage = (
        attendance_record.attendance_percentage
        if attendance_record else 0
    )

    # ---------- RESULTS ----------
    results = Result.query.filter_by(
        student_id=student_id
    ).all()

    if results:

        subject_scores = []

        for r in results:

            i1 = r.internal1 if r.internal1 else 0
            i2 = r.internal2 if r.internal2 else 0
            i3 = r.internal3 if r.internal3 else 0
            sem = r.sem_mark if r.sem_mark else 0

            # internal average
            internal_avg = (i1 + i2 + i3) / 3

            # weighted final score
            final_score = (internal_avg * 0.4) + (sem * 0.6)

            subject_scores.append(final_score)

        avg_score = sum(subject_scores) / len(subject_scores)

        attempts_used = max(
            r.attempts if r.attempts else 0
            for r in results
        )

    else:
        avg_score = 0
        attempts_used = 0

    # ---------- FEES ----------
    fee_record = Fees.query.filter_by(
        student_id=student_id
    ).first()

    fee_pending = 1 if (
        fee_record and fee_record.payment_status != "PAID"
    ) else 0

    # ---------- FINAL FEATURE VECTOR ----------
    features = {
        "student_id": student_id,
        "register_number": register_number,   # ⭐ ADDED
        "attendance_percentage": attendance_percentage,
        "avg_score": round(avg_score, 2),
        "attempts_used": attempts_used,
        "fee_pending": fee_pending
    }

    return features


def build_all_student_features():
    """
    Build features for ALL students
    """
    students = Student.query.all()

    feature_list = []

    for student in students:
        features = build_features_for_student(
            student.student_id
        )

        if features:
            feature_list.append(features)

    return feature_list
