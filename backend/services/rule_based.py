def calculate_rule_score(features):
    """
    Calculate rule-based risk score
    based on features from feature_builder
    """

    score = 0

    attendance = features.get("attendance_percentage", 0)
    avg_score = features.get("avg_score", 0)
    attempts = features.get("attempts_used", 0)
    fee_pending = features.get("fee_pending", 0)

    # -------- ATTENDANCE --------
    if attendance < 50:
        score += 4
    elif attendance < 65:
        score += 3
    elif attendance < 75:
        score += 2

    # -------- ACADEMIC PERFORMANCE --------
    if avg_score < 45:
        score += 4
    elif avg_score < 60:
        score += 3
    elif avg_score < 70:
        score += 2

    # -------- ATTEMPTS --------
    if attempts >= 3:
        score += 3
    elif attempts == 2:
        score += 2

    # -------- FEES --------
    if fee_pending == 1:
        score += 2

    return round(score, 2)


def assign_risk_level(score):
    """
    Convert score to risk level and color
    """

    if score >= 7:
        return "HIGH", "RED"
    elif score >= 4:
        return "MEDIUM", "YELLOW"
    else:
        return "LOW", "GREEN"