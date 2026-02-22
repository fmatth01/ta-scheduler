from data_access import *
from dummy_data_big import Day # TODO change this!

# ============================================================
# SHIFT PRIORITY
# Higher score = more important = remove last
# ============================================================

DAY_PRIORITY = {
    Day.TUESDAY:   3,
    Day.WEDNESDAY: 3,
    Day.THURSDAY:  3,
    Day.MONDAY:    2,
    Day.FRIDAY:    2,
    Day.SATURDAY:  1,
    Day.SUNDAY:    1,
}

def time_priority(shift):
    """
    Later shifts get higher priority since more students attend afternoon/evening OH.
    Bucketed into three tiers based on start time.
    """
    hour = shift["start"].hour
    if hour >= 17:
        return 3   # evening
    elif hour >= 12:
        return 2   # afternoon
    else:
        return 1   # morning

def shift_priority(ctx, shift_id):
    """
    Combined priority score for a shift.
    Higher = more important = should be removed last during reduction.
    Labs always get a bonus since they're hardest to replace.
    """
    shift      = get_shift(ctx, shift_id)
    day_score  = DAY_PRIORITY.get(shift["day"], 1)
    time_score = time_priority(shift)
    lab_bonus  = 2 if shift["is_lab"] else 0

    return day_score + time_score + lab_bonus

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
        for ta_id in assignment["leads"]:
            total += ROLE_WEIGHTS["lead"]   * get_pref(ctx, ta_id, shift_id)
        for ta_id in assignment["lab_tas"]:
            total += ROLE_WEIGHTS["lab_ta"] * get_pref(ctx, ta_id, shift_id)
        for ta_id in assignment["oh_tas"]:
            total += ROLE_WEIGHTS["oh_ta"]  * get_pref(ctx, ta_id, shift_id)
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