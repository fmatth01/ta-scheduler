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

    print("\n" + "="*60)
    print("[GREEDY] Starting greedy assignment")
    print("="*60)

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

        print(f"[GREEDY]   fill_role shift='{shift_id}' role='{role}' "
              f"needed={num_needed} eligible={len(eligible)} selected={len(selected)}")
        if eligible:
            for ta_id in eligible[:5]:  # show top 5
                score = candidate_score(ta_id, shift_id)
                pref = get_pref(ctx, ta_id, shift_id)
                print(f"[GREEDY]     candidate '{ta_id}': score={score:.2f} pref={pref}")

        role_key = role + "s"  # "leads", "lab_tas", "oh_tas"
        for ta_id in selected:
            schedule[shift_id][role_key].append(ta_id)
            assign_ta(ctx, ta_id, shift_id, current_assignments, hours_assigned)
            print(f"[GREEDY]     -> assigned '{ta_id}' as {role}")

        # Unable to schedule enough TAs
        if len(selected) < num_needed:
            schedule[shift_id]["unschedulable"] = True
            schedule[shift_id]["error"] = (
                f"Could only fill {len(selected)}/{num_needed} {role} slots"
            )
            print(f"[GREEDY]     WARNING: UNSCHEDULABLE - {schedule[shift_id]['error']}")

    lab_shifts = sorted(
        [s for s in ctx.shift_metadata if s["is_lab"]],
        key=lambda s: sum(
            1 for ta in ctx.ta_metadata
            if ta["lab_admin_status"] >= 2
            and get_pref(ctx, ta["ta_id"], s["shift_id"]) > 0
        )
    )
    oh_shifts = sorted(
        [s for s in ctx.shift_metadata if not s["is_lab"]],
        key=lambda s: (s["day"].value, s["start"])
    )

    print(f"\n[GREEDY] {len(lab_shifts)} lab shifts, {len(oh_shifts)} OH shifts")
    print(f"[GREEDY] Lab shifts: {[s['shift_id'] for s in lab_shifts]}")
    print(f"[GREEDY] OH shifts: {[s['shift_id'] for s in oh_shifts]}")

    # Pass 1 — all leads across all labs
    print(f"\n[GREEDY] === PASS 1: Assigning LEADS to lab shifts ===")
    for shift in lab_shifts:
        print(f"\n[GREEDY] Lab shift '{shift['shift_id']}' staffing={shift['staffing']}")
        fill_role(shift, "lead", shift["staffing"][2])

    # Pass 2 — all lab TAs across all labs
    print(f"\n[GREEDY] === PASS 2: Assigning LAB_TAs to lab shifts ===")
    for shift in lab_shifts:
        fill_role(shift, "lab_ta", shift["staffing"][1])

    # Pass 3 — all OH shifts
    print(f"\n[GREEDY] === PASS 3: Assigning OH_TAs to OH shifts ===")
    for shift in oh_shifts:
        fill_role(shift, "oh_ta", shift["staffing"][0])

    # Summary
    print(f"\n[GREEDY] === ASSIGNMENT SUMMARY ===")
    total_assigned = 0
    total_unschedulable = 0
    for shift_id, assignment in schedule.items():
        assigned = len(assignment["leads"]) + len(assignment["lab_tas"]) + len(assignment["oh_tas"])
        total_assigned += assigned
        if assignment["unschedulable"]:
            total_unschedulable += 1
        if assigned > 0 or assignment["unschedulable"]:
            print(f"[GREEDY] shift '{shift_id}': leads={assignment['leads']} "
                  f"lab_tas={assignment['lab_tas']} oh_tas={assignment['oh_tas']} "
                  f"unschedulable={assignment['unschedulable']}")

    print(f"\n[GREEDY] Total TAs assigned: {total_assigned}")
    print(f"[GREEDY] Unschedulable shifts: {total_unschedulable}")
    print(f"[GREEDY] Hours assigned: {dict(hours_assigned)}")

    return schedule, current_assignments, hours_assigned
