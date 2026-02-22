from helpers.data_access import *
from helpers.constraints import *

# ============================================================
# SCHEDULE SCORING
# ============================================================

# Better to schedule as lab lead if possible
ROLE_WEIGHTS = {
    "lead":   1.0,
    "lab_ta": 0.8,
    "oh_ta":  0.6,
}

EXPERIENCE_PENALTY = -0.1
COMPANION_BONUS = 0.1

def compute_candidate_score(ctx, ta_id, shift_id, schedule, hours_assigned):
    ta = get_ta(ctx, ta_id)
    pref = get_pref(ctx, ta_id, shift_id)
    hours_below_min = max(0, ta["min_hours"] - hours_assigned[ta_id])
    balance_boost   = (hours_below_min / ta["min_hours"]) * 2.0 if ta["min_hours"] > 0 else 0
    exp_penalty     = EXPERIENCE_PENALTY * experience_penalty(ctx, ta_id, shift_id, schedule)
    comp_boost      = companion_boost(ctx, ta_id, shift_id, schedule)
    return pref + balance_boost + exp_penalty + comp_boost

def score_schedule(ctx, schedule, hours_assigned):
    total = 0
    for shift_id, assignment in schedule.items():
        for role, role_key in [("lead", "leads"), ("lab_ta", "lab_tas"), ("oh_ta", "oh_tas")]:
            for ta_id in assignment[role_key]:
                total += ROLE_WEIGHTS[role] * compute_candidate_score(
                    ctx, ta_id, shift_id, schedule, hours_assigned
                )
    return total

# ============================================================
# COST CALCULATOR
# ============================================================

TA_HOURLY_RATE = 17.43
TF_HOURLY_RATE = 19.60

def calculate_cost(ctx, hours_assigned):
    """
    Calculates total budget cost of a schedule.
    TFs are paid at a higher rate than TAs.
    """
    total = 0
    for ta in ctx.ta_metadata:
        ta_id = ta["ta_id"]
        hours = hours_assigned[ta_id]
        rate  = TF_HOURLY_RATE if ta["is_tf"] else TA_HOURLY_RATE
        total += hours * rate

    return total