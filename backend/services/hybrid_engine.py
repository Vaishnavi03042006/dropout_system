def combine_scores(rule_score, ml_score, rule_weight=0.5, ml_weight=0.5):

    final_score = (rule_weight * rule_score) + (ml_weight * ml_score)

    if final_score >= 7:
        level = "HIGH"
    elif final_score >= 4:
        level = "MEDIUM"
    else:
        level = "LOW"

    return round(final_score, 2), level
