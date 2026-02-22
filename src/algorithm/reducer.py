from copy import deepcopy
from data_access import *
from scoring import *

# ============================================================
# READJUST MIN HOURS TO ENABLE REDUCTION
# ============================================================

def apply_reduced_fairness_floor(ctx, target_budget, threshold=0.9):
    """
    Recalculates min_hours for each TA based on what's affordable
    at the target budget rather than the full schedule cost.
    Should be called before reduce_schedule.
    """
    # Figure out total affordable hours at target budget
    # Use a blended rate across TAs as an approximation
    total_tas  = len(ctx.ta_metadata)
    num_tfs    = sum(1 for ta in ctx.ta_metadata if ta["is_tf"])
    num_tas    = total_tas - num_tfs
    blended_rate = (num_tfs * TF_HOURLY_RATE + num_tas * TA_HOURLY_RATE) / total_tas

    affordable_hours = target_budget / blended_rate
    fair_share       = affordable_hours / total_tas
    fairness_floor   = fair_share * threshold

    for ta in ctx.ta_metadata:
        new_min = min(ta["min_hours"], int(fairness_floor))  # only lower, never raise
        if new_min != ta["min_hours"]:
            ta["min_hours"] = new_min

# ============================================================
# SCHEDULE REDUCER
# ============================================================

def reduce_schedule(ctx, schedule, hours_assigned, target_budget):
    """
    Takes an existing schedule and removes shifts until total cost
    is under target_budget.
    Removes lowest priority shifts first.
    Within the same priority, removes shifts whose removal brings
    the hours distribution closest to even.
    Never removes a shift that would drop a TA below min_hours.
    Returns the reduced schedule and updated hours_assigned.
    """
    schedule       = deepcopy(schedule)
    hours_assigned = deepcopy(hours_assigned)

    # --------------------------------------------------------
    # INNER HELPERS
    # --------------------------------------------------------

    def current_cost():
        return calculate_cost(ctx, hours_assigned)

    def hours_std_dev():
        """Lower std dev = more even distribution."""
        hours    = [hours_assigned[ta["ta_id"]] for ta in ctx.ta_metadata]
        mean     = sum(hours) / len(hours)
        variance = sum((h - mean) ** 2 for h in hours) / len(hours)
        return variance ** 0.5

    def all_tas_on_shift(shift_id):
        assignment = schedule[shift_id]
        return (
            assignment["leads"] +
            assignment["lab_tas"] +
            assignment["oh_tas"]
        )

    def can_remove(shift_id):
        """
        A shift can only be removed if no TA assigned to it
        would drop below their min_hours as a result.
        """
        shift    = get_shift(ctx, shift_id)
        duration = shift_duration_hours(shift)
        for ta_id in all_tas_on_shift(shift_id):
            ta = get_ta(ctx, ta_id)
            if hours_assigned[ta_id] - duration < ta["min_hours"]:
                return False
        return True

    def removal_score(shift_id):
        """
        Simulate removing this shift and return the resulting std dev.
        Lower is better — prefer the removal that evens out hours most.
        """
        shift    = get_shift(ctx, shift_id)
        duration = shift_duration_hours(shift)
        tas      = all_tas_on_shift(shift_id)

        for ta_id in tas:
            hours_assigned[ta_id] -= duration
        std = hours_std_dev()
        for ta_id in tas:
            hours_assigned[ta_id] += duration

        return std

    def remove_shift(shift_id):
        shift    = get_shift(ctx, shift_id)
        duration = shift_duration_hours(shift)
        for ta_id in all_tas_on_shift(shift_id):
            hours_assigned[ta_id] -= duration
        schedule[shift_id]["leads"]   = []
        schedule[shift_id]["lab_tas"] = []
        schedule[shift_id]["oh_tas"]  = []

    # --------------------------------------------------------
    # REDUCTION LOOP
    # --------------------------------------------------------

    # Reduce min hours
    apply_reduced_fairness_floor(ctx, target_budget)

    iterations = 0
    while current_cost() > target_budget:

        # All filled, non-error shifts that can be removed without
        # violating anyone's min_hours
        removable = [
            shift_id for shift_id, assignment in schedule.items()
            if (assignment["leads"] or assignment["lab_tas"] or assignment["oh_tas"])
            and not assignment["unschedulable"]
            and can_remove(shift_id)
        ]

        if not removable:
            print("Cannot reduce further — all remaining shifts are protected by min_hours constraints.")
            break

        # Sort ascending by priority (least important first)
        # then by removal_score ascending (prefer removals that even out hours)
        removable.sort(key=lambda s_id: (
            shift_priority(ctx, s_id),
            removal_score(s_id)
        ))

        shift_to_remove = removable[0]
        shift_name      = get_shift(ctx, shift_to_remove)["name"]

        remove_shift(shift_to_remove)

        iterations += 1
        if iterations > 100:
            print("Stopping after 100 removals — check your target budget.")
            break

    print(f"\nFinal cost: ${current_cost():.2f} after {iterations} shift removals")
    return schedule, hours_assigned