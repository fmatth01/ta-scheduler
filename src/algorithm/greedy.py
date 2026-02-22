from helpers.data_access import *
from helpers.constraints import *
from helpers.scoring import *

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
        return compute_candidate_score(ctx, ta_id, shift_id, schedule, hours_assigned)

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

    lab_shifts = sorted(
        [s for s in ctx.shift_metadata if s["is_lab"]],
        key=lambda s: sum(
            1 for ta in ctx.ta_metadata
            if ta["lab_admin_status"] >= 3
            and get_pref(ctx, ta["ta_id"], s["shift_id"]) > 0
        )
    )
    oh_shifts = sorted(
        [s for s in ctx.shift_metadata if not s["is_lab"]],
        key=lambda s: (s["day"].value, s["start"])
    )

    # Pass 1 — all leads across all labs
    for shift in lab_shifts:
        fill_role(shift, "lead", shift["staffing"][2])

    # Pass 2 — all lab TAs across all labs
    for shift in lab_shifts:
        fill_role(shift, "lab_ta", shift["staffing"][1])

    # Pass 3 — all OH shifts
    for shift in oh_shifts:
        fill_role(shift, "oh_ta", shift["staffing"][0])

    return schedule, current_assignments, hours_assigned