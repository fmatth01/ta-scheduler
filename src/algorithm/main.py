from data.context import SchedulerContext
from helpers.constraints import *
from simulated_annealing import *
from helpers.scoring import *
from reducer import *
from data.parsers import *
from data.db_connection import *

# from dummy_data.realistic_dummy_data import ta_metadata, shift_metadata, preference_matrix
SCHEDULE_ID = 1

# ============================================================
# BUILD CONTEXT AND RUN SCHEDULER
# ============================================================

raw_tas, raw_schedule  = fetch_schedule()

print(raw_tas)
print(raw_schedule)
shift_metadata    = fetch_shifts(raw_schedule)
ta_metadata       = parse_tas(raw_tas)
preference_matrix = parse_preference_matrix(raw_tas, shift_metadata)
ctx = SchedulerContext(ta_metadata, shift_metadata, preference_matrix)

apply_fairness(ctx)

schedule, hours_assigned, score = simulated_annealing(ctx)
display_results(ctx, schedule, hours_assigned, score)

print("\n--- FULL SCHEDULE COST ---")
print(calculate_cost(ctx, hours_assigned))

# # ============================================================
# # REDUCE SCHEDULE
# # ============================================================

# print("\n--- REDUCED SCHEDULE ---")
# target_budget = calculate_cost(ctx, hours_assigned) * 0.8
# reduced_schedule, reduced_hours = reduce_schedule(ctx, schedule, hours_assigned, target_budget)

# print("\n--- REDUCED SCHEDULE ASSIGNMENTS ---")
# display_results(ctx, reduced_schedule, reduced_hours, score)

# print("\n--- REDUCED SCHEDULE COST ---")
# print(calculate_cost(ctx, reduced_hours))

# ============================================================
# POST FILLED SCHEDULE BACK TO DB
# ============================================================

print("\n--- POSTING SCHEDULE TO DB ---")
try:
    serialized = serialize_schedule(ctx, schedule)
    result = post_schedule(SCHEDULE_ID, {
        **serialized,
        "score": score
    })
    print(f"Successfully posted schedule {SCHEDULE_ID} to DB")
except Exception as e:
    print(f"Could not post schedule to DB: {e}")