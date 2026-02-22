from helpers.data_access import *
from data.context import Day

# ============================================================
# CONSTRAINT LOGIC HELPERS
# ============================================================

def shifts_overlap(shift_a, shift_b):
    """Two shifts conflict if they are on the same day and their times intersect."""
    if shift_a["day"] != shift_b["day"]:
        return False
    return shift_a["start"] < shift_b["end"] and shift_b["start"] < shift_a["end"]

def has_time_conflict(ctx, ta_id, shift_id, current_assignments):
    """Check if a TA is already assigned to any shift that overlaps with the candidate shift."""
    candidate = get_shift(ctx, shift_id)
    for assigned_shift_id in current_assignments[ta_id]:
        if shifts_overlap(candidate, get_shift(ctx, assigned_shift_id)):
            return True
    return False

def is_in_any_lab(ctx, ta_id, current_assignments):
    """Check if a TA is already assigned to any lab shift."""
    return any(get_shift(ctx, s_id)["is_lab"] for s_id in current_assignments[ta_id])

def would_exceed_max_hours(ctx, ta_id, shift_id, hours_assigned):
    """Check if assigning this shift would push the TA over their max hours."""
    ta = get_ta(ctx, ta_id)
    shift = get_shift(ctx, shift_id)
    return hours_assigned[ta_id] + shift_duration_hours(shift) > ta["max_hours"]

def has_min_status_for_role(ctx, ta_id, role):
    """Check if a TA's lab_admin_status meets the minimum required for a role."""
    min_status = {"oh_ta": 1, "lab_ta": 2, "lead": 3}
    return get_ta(ctx, ta_id)["lab_admin_status"] >= min_status[role]

# ============================================================
# COMBINED ELIGIBILITY
# ============================================================

def get_eligible_tas_for_role(ctx, shift_id, role, current_assignments, hours_assigned):
    """
    Returns list of ta_ids who are eligible for a given role on a given shift.
    Filters on: availability, role status, max hours, time conflicts, one-lab rule.
    """
    eligible = []
    for ta in ctx.ta_metadata:
        ta_id = ta["ta_id"]

        if not is_available(ctx, ta_id, shift_id):
            continue
        if is_overloaded(ta_id, hours_assigned):
            continue
        if not has_min_status_for_role(ctx, ta_id, role):
            continue
        if would_exceed_max_hours(ctx, ta_id, shift_id, hours_assigned):
            continue
        if has_time_conflict(ctx, ta_id, shift_id, current_assignments):
            continue
        if role in ("lead", "lab_ta") and is_in_any_lab(ctx, ta_id, current_assignments):
            continue

        eligible.append(ta_id)

    return eligible

# ============================================================
# ENFORCE FAIRNESS CONSTRAINTS TO EVEN OUT SHIFTS
# ============================================================

def apply_fairness(ctx, threshold=0.9, ceiling_threshold=1.1):
    """
    Raises min_hours and lowers max_hours toward the fair share,
    closing the range from both ends.
    threshold:         min_hours floor as a fraction of fair share
    ceiling_threshold: max_hours ceiling as a fraction of fair share
    """
    total_hours_needed = sum(
        shift_duration_hours(shift) * sum(shift["staffing"])
        for shift in ctx.shift_metadata
    )

    fair_share     = total_hours_needed / len(ctx.ta_metadata)
    fairness_floor = fair_share * threshold
    fairness_ceil  = fair_share * ceiling_threshold

    for i, ta in enumerate(ctx.ta_metadata):
        available_hours = sum(
            shift_duration_hours(shift)
            for j, shift in enumerate(ctx.shift_metadata)
            if get_pref(ctx, ta["ta_id"], shift["shift_id"]) > 0
        )

        # Floor — only raise, never lower
        adjusted_floor = min(fairness_floor, available_hours)
        new_min = max(ta["min_hours"], adjusted_floor)

        # Ceiling — only lower, never raise
        # Also never let ceiling drop below the new min
        adjusted_ceil = max(fairness_ceil, new_min + 1.5)
        new_max = min(ta["max_hours"], adjusted_ceil)

        if new_min != ta["min_hours"]:
            ta["min_hours"] = new_min

        if new_max != ta["max_hours"]:
            ta["max_hours"] = new_max

def is_overloaded(ta_id, hours_assigned):
    """
    A TA is overloaded if they're already significantly above the current average.
    This acts as a hard cap to prevent hours from stacking up on popular TAs.
    """
    avg_hours = sum(hours_assigned.values()) / len(hours_assigned)
    return hours_assigned[ta_id] > avg_hours + 1

# ============================================================
# PENALIZES MULTIPLE INEXPERIENCED TAS TOGETHER
# ============================================================

# Gets scaled in scoring
def experience_penalty(ctx, ta_id, shift_id, schedule):
    """
    Returns a penalty if this TA is inexperienced and there's
    already an inexperienced TA on this shift.
    """
    if get_ta(ctx, ta_id)["experienced"]:
        return 0

    assignment = schedule[shift_id]
    all_tas = (
        assignment["leads"] +
        assignment["lab_tas"] +
        assignment["oh_tas"]
    )
    already_inexperienced = any(
        not get_ta(ctx, t)["experienced"] for t in all_tas
    )

    return 1 if already_inexperienced else 0

# ============================================================
# REWARD PAIRING COMPANIONS 
# ============================================================

# Gets scaled in scoring
def companion_boost(ctx, ta_id, shift_id, schedule):
    """
    Returns a bonus if any of this TA's companions are already
    assigned to this shift.
    """
    ta = get_ta(ctx, ta_id)
    companions = ta.get("companions", [])
    if not companions:
        return 0

    assignment = schedule[shift_id]
    already_on_shift = set(
        assignment["leads"] +
        assignment["lab_tas"] +
        assignment["oh_tas"]
    )

    matches = sum(1 for c in companions if c in already_on_shift)
    return matches

# ============================================================
# SHIFT PRIORITIES FOR REDUCTION
# ============================================================

# Higher score = more important = remove last
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