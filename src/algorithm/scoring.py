from data_access import *
from constraints import *

# ============================================================
# SCHEDULE SCORING
# ============================================================

# Better to schedule as lab lead if possible
ROLE_WEIGHTS = {
    "lead":   1.0,
    "lab_ta": 0.8,
    "oh_ta":  0.6,
}

def score_schedule(ctx, schedule):
    total = 0
    for shift_id, assignment in schedule.items():
        for role, role_key in [("lead", "leads"), ("lab_ta", "lab_tas"), ("oh_ta", "oh_tas")]:
            for ta_id in assignment[role_key]:
                total += ROLE_WEIGHTS[role] * get_pref(ctx, ta_id, shift_id)
                total += experience_penalty(ctx, ta_id, shift_id, schedule)
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