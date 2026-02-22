from helpers.data_access import *
from helpers.scoring import *
from greedy import *

# ============================================================
# SIMULATED ANNEALING
# ============================================================

import math
import random
from copy import deepcopy

def get_random_filled_shift(ctx, schedule):
    filled_shifts = [
        shift_id for shift_id, assignment in schedule.items()
        if assignment["leads"] or assignment["lab_tas"] or assignment["oh_tas"]
    ]

    # Weight by shift priority so important shifts get more improvement attempts
    weights = [shift_priority(ctx, shift_id) for shift_id in filled_shifts]

    shift_id   = random.choices(filled_shifts, weights=weights, k=1)[0]
    assignment = schedule[shift_id]

    nonempty_roles = []
    if assignment["leads"]:
        nonempty_roles.append(("lead", "leads"))
    if assignment["lab_tas"]:
        nonempty_roles.append(("lab_ta", "lab_tas"))
    if assignment["oh_tas"]:
        nonempty_roles.append(("oh_ta", "oh_tas"))

    role, role_key = random.choice(nonempty_roles)
    ta_out = random.choice(assignment[role_key])

    return ta_out, shift_id, role

def simulated_annealing(ctx, initial_temp=10.0, cooling_rate=0.995, num_iterations=10000):
    
    # Start from a greedy schedule
    schedule, current_assignments, hours_assigned = greedy_assign(ctx)
    current_score = score_schedule(ctx, schedule, hours_assigned)

    best_schedule            = deepcopy(schedule)
    best_hours_assigned      = deepcopy(hours_assigned)
    best_score               = current_score

    temperature = initial_temp

    for iteration in range(num_iterations):

        # --------------------------------------------------------
        # PICK A RANDOM FILLED (shift, role) SLOT TO MUTATE
        # --------------------------------------------------------
        ta_out, shift_id, role = get_random_filled_shift(ctx, schedule)
        role_key = role + "s"

        # --------------------------------------------------------
        # TEMPORARILY REMOVE THE TA
        # --------------------------------------------------------
        schedule[shift_id][role_key].remove(ta_out)
        remove_ta(ctx, ta_out, shift_id, current_assignments, hours_assigned)

        # --------------------------------------------------------
        # FIND AN ELIGIBLE REPLACEMENT (excluding already assigned TAs on this shift)
        # --------------------------------------------------------
        already_on_shift = (
            schedule[shift_id]["leads"] +
            schedule[shift_id]["lab_tas"] +
            schedule[shift_id]["oh_tas"]
        )
        eligible = [
            ta_id for ta_id in get_eligible_tas_for_role(
                ctx, shift_id, role, current_assignments, hours_assigned
            )
            if ta_id not in already_on_shift
        ]

        if not eligible:
            # No replacement found — restore and move on
            schedule[shift_id][role_key].append(ta_out)
            assign_ta(ctx, ta_out, shift_id, current_assignments, hours_assigned)
            temperature *= cooling_rate
            continue

        ta_in = random.choice(eligible)  # random, not greedy — important for annealing

        # --------------------------------------------------------
        # APPLY THE SWAP AND SCORE
        # --------------------------------------------------------
        schedule[shift_id][role_key].append(ta_in)
        assign_ta(ctx, ta_in, shift_id, current_assignments, hours_assigned)

        new_score = score_schedule(ctx, schedule, hours_assigned)
        delta     = new_score - current_score

        # --------------------------------------------------------
        # ACCEPT OR REJECT
        # --------------------------------------------------------
        accept = False
        if delta > 0:
            accept = True
        else:
            probability = math.exp(delta / temperature)
            accept = random.random() < probability

        if accept:
            current_score = new_score
            if current_score > best_score:
                best_score               = current_score
                best_schedule            = deepcopy(schedule)
                best_hours_assigned      = deepcopy(hours_assigned)
        else:
            # Revert the swap
            schedule[shift_id][role_key].remove(ta_in)
            remove_ta(ctx, ta_in,  shift_id, current_assignments, hours_assigned)
            schedule[shift_id][role_key].append(ta_out)
            assign_ta(ctx, ta_out, shift_id, current_assignments, hours_assigned)

        temperature *= cooling_rate

    return best_schedule, best_hours_assigned, best_score

# ============================================================
# PRINT RESULTS FOR TESTING
# ============================================================

def display_results(ctx, schedule, hours_assigned, score):
    print(f"Total Score: {score:.2f}\n")
    for shift_id, assignment in schedule.items():
        shift = get_shift(ctx, shift_id)
        print(f"{shift['name']}")
        if assignment["unschedulable"]:
            print(f"  ⚠ UNSCHEDULABLE: {assignment['error']}")
        if assignment["leads"]:
            print(f"  Leads:   {[get_ta(ctx, t)['name'] for t in assignment['leads']]}")
        if assignment["lab_tas"]:
            print(f"  Lab TAs: {[get_ta(ctx, t)['name'] for t in assignment['lab_tas']]}")
        if assignment["oh_tas"]:
            print(f"  OH TAs:  {[get_ta(ctx, t)['name'] for t in assignment['oh_tas']]}")
        print()

    print("Hours per TA:")
    for ta in ctx.ta_metadata:
        h = hours_assigned[ta["ta_id"]]
        print(f"  {ta['name']:8}: {h:.2f}h  (min: {ta['min_hours']}, max: {ta['max_hours']})")