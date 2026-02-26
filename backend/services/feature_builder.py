from models.students import Student
from models.attendance import Attendance
from models.result import Result
from models.fees import Fees


# =========================================================
# 🔥 CONFIGURABLE RISK THRESHOLDS (Modify Here Only)
# =========================================================

HIGH_ATTENDANCE_THRESHOLD = 50
MEDIUM_ATTENDANCE_THRESHOLD = 65

HIGH_MARKS_THRESHOLD = 45
MEDIUM_MARKS_THRESHOLD = 60

HIGH_ATTEMPT_THRESHOLD = 3


# =========================================================
# 🔥 BUILD FEATURES FOR ONE STUDENT
# =========================================================

def build_features_for_student(student_id, stage="final"):
    """
    Build ML-ready features for ONE student
    stage: "early" | "mid" | "final"
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
            i1 = r.internal1 or 0
            i2 = r.internal2 or 0
            i3 = r.internal3 or 0
            sem = r.sem_mark or 0

            # 🔥 Stage-based calculation
            if stage == "early":
                internal_avg = i1

            elif stage == "mid":
                internal_avg = (i1 + i2) / 2

            else:  # final
                internal_avg = (i1 + i2 + i3) / 3

            final_score = (internal_avg * 0.4) + (sem * 0.6)

            subject_scores.append(final_score)

        avg_score = sum(subject_scores) / len(subject_scores)

        attempts_used = max(
            r.attempts or 0 for r in results
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

    # =========================================================
    # 🔥 DERIVED MULTI-CLASS DROPOUT LABEL
    # 0 = LOW
    # 1 = MEDIUM
    # 2 = HIGH
    # =========================================================

    if (
        attendance_percentage < HIGH_ATTENDANCE_THRESHOLD or
        avg_score < HIGH_MARKS_THRESHOLD
    ):
        derived_dropout_status = 2  # HIGH

    elif (
        attendance_percentage < MEDIUM_ATTENDANCE_THRESHOLD or
        avg_score < MEDIUM_MARKS_THRESHOLD
    ):
        derived_dropout_status = 1  # MEDIUM

    else:
        derived_dropout_status = 0  # LOW

    # =========================================================
    # 🔥 MULTI-LABEL FLAGS
    # =========================================================

    low_attendance_flag = 1 if attendance_percentage < 65 else 0
    low_marks_flag = 1 if avg_score < 60 else 0
    high_attempt_flag = 1 if attempts_used >= HIGH_ATTEMPT_THRESHOLD else 0
    fee_issue_flag = fee_pending

    # =========================================================
    # 🔥 FINAL FEATURE VECTOR
    # =========================================================

    features = {
        "student_id": student_id,
        "register_number": register_number,

        # Core ML features
        "attendance_percentage": round(attendance_percentage, 2),
        "avg_score": round(avg_score, 2),
        "attempts_used": attempts_used,
        "fee_pending": fee_pending,

        # Multi-label signals
        "low_attendance_flag": low_attendance_flag,
        "low_marks_flag": low_marks_flag,
        "high_attempt_flag": high_attempt_flag,
        "fee_issue_flag": fee_issue_flag,

        # Multi-class target
        "dropout_status": derived_dropout_status
    }

    return features


# =========================================================
# 🔥 BUILD FEATURES FOR ALL STUDENTS
# =========================================================

def build_all_student_features(stage="final"):
    """
    Build ML-ready features for ALL students
    stage: "early" | "mid" | "final"
    """

    students = Student.query.all()
    feature_list = []

    for student in students:
        features = build_features_for_student(
            student.student_id,
            stage
        )

        if features:
            feature_list.append(features)

    return feature_list
