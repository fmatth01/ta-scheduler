from data_access import *
from dummy_data_big import Day # TODO change this!

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
# ENFORCE FAIRNESS FLOOR TO EVEN OUT SHIFTS
# ============================================================

def apply_fairness_floor(ctx, threshold=0.9):
    """
    Calculates a fair share of hours for each TA and raises their
    min_hours to threshold * fair_share if it's currently lower.
    Caps the floor at each TA's actual available hours so we don't
    create an impossible constraint.
    Mutates ta_metadata in place.
    """

    # Total TA-hours needed across all shifts
    total_hours_needed = sum(
        shift_duration_hours(shift) * sum(shift["staffing"])
        for shift in ctx.shift_metadata
    )

    fair_share = total_hours_needed / len(ctx.ta_metadata)
    fairness_floor = fair_share * threshold

    for i, ta in enumerate(ctx.ta_metadata):
        # How many hours is this TA actually available for?
        available_hours = sum(
            shift_duration_hours(shift)
            for j, shift in enumerate(ctx.shift_metadata)
            if get_pref(ctx, i, j) > 0
        )

        # Don't set a floor higher than what they can actually work
        adjusted_floor = min(fairness_floor, available_hours)

        # Only raise the floor, never lower an existing min
        new_min = max(ta["min_hours"], int(adjusted_floor))

        if new_min != ta["min_hours"]:
            ta["min_hours"] = new_min

# ============================================================
# PENALIZES MULTIPLE INEXPERIENCED TAS TOGETHER
# ============================================================

def experience_penalty(ctx, ta_id, shift_id, schedule):
    """
    Returns a penalty if this TA is inexperienced and there's
    already an inexperienced TA on this shift.
    """
    if get_ta(ctx, ta_id)["experienced"]:
        return 0  # experienced TAs never penalized

    # Count inexperienced TAs already on this shift
    assignment = schedule[shift_id]
    all_tas = (
        assignment["leads"] +
        assignment["lab_tas"] +
        assignment["oh_tas"]
    )
    num_inexperienced = sum(
        1 for t in all_tas
        if not get_ta(ctx, t)["experienced"]
    )

    return -1.5 * num_inexperienced  # penalty scales with how many are already there

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