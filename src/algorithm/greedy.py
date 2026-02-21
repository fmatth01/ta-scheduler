from data_access import *
from constraints import *

# ============================================================
# INITIAL SCHEDULE - GREEDY APPROACH
# ============================================================

def greedy_assign(ctx):
    """
    Produce an initial valid schedule by filling shifts greedily.
    Labs first (most constrained), then OH shifts.
    Within each shift, fills roles most constrained first: leads, lab_tas, oh_tas.
    Returns schedule, current_assignments, hours_assigned.
    """

    # Schedule output: shift_id -> assigned TAs by role + error info
    schedule = {
        s["shift_id"]: {
            "leads":   [],
            "lab_tas": [],
            "oh_tas":  [],
            "unschedulable": False,
            "error": None
        }
        for s in ctx.shift_metadata
    }

    current_assignments = {ta["ta_id"]: [] for ta in ctx.ta_metadata}
    hours_assigned      = {ta["ta_id"]: 0  for ta in ctx.ta_metadata}

    # Give preference to better TAs with better "fit"
    def candidate_score(ta_id, shift_id):
        ta = get_ta(ctx, ta_id)
        pref = get_pref(ctx, ta_id, shift_id)
        hours_below_min = max(0, ta["min_hours"] - hours_assigned[ta_id])
        balance_boost   = hours_below_min / ta["min_hours"] if ta["min_hours"] > 0 else 0
        
        return pref + balance_boost 

    # Assign correct number of TAs to the shift, role
    def fill_role(shift, role, num_needed):
        shift_id = shift["shift_id"]
        
        eligible = get_eligible_tas_for_role(
            ctx, shift_id, role, current_assignments, hours_assigned
        )
        # Sort by candidate score descending
        ranked = sorted(eligible, key=lambda ta_id: candidate_score(ta_id, shift_id), reverse=True)
        selected = ranked[:num_needed]

        role_key = role + "s"  # "leads", "lab_tas", "oh_tas"
        for ta_id in selected:
            schedule[shift_id][role_key].append(ta_id)
            assign_ta(ctx, ta_id, shift_id, current_assignments, hours_assigned)

        # Unable to schedule enough TAs
        if len(selected) < num_needed:
            schedule[shift_id]["unschedulable"] = True
            schedule[shift_id]["error"] = (
                f"Could only fill {len(selected)}/{num_needed} {role} slots"
            )

    # Labs first, then OH
    sorted_shifts = sorted(ctx.shift_metadata, key=lambda s: not s["is_lab"])

    for shift in sorted_shifts:
        if shift["is_lab"]:
            fill_role(shift, "lead",   shift["staffing"][2])
            fill_role(shift, "lab_ta", shift["staffing"][1])
        else:
            fill_role(shift, "oh_ta",  shift["staffing"][0])

    return schedule, current_assignments, hours_assigned