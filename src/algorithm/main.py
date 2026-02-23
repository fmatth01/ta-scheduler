from data.context import SchedulerContext
from helpers.constraints import *
from simulated_annealing import *
from helpers.scoring import *
from reducer import *
from data.parsers import *
from data.db_connection import *
from helpers.data_access import init_lookups

# ============================================================
# BUILD CONTEXT AND RUN SCHEDULER
# ============================================================

print("="*60)
print("[MAIN] Starting TA Scheduler Algorithm")
print("="*60)

# Step 1: Fetch data from backend (schedule_id is now dynamic)
raw_tas, raw_schedule, SCHEDULE_ID = fetch_schedule()

print(f"\n[MAIN] Using SCHEDULE_ID = {SCHEDULE_ID} (from DB, not hardcoded)")

# Step 2: Parse into algorithm format
shift_metadata    = fetch_shifts(raw_schedule)
ta_metadata       = parse_tas(raw_tas)
preference_matrix = parse_preference_matrix(raw_tas, shift_metadata)

print(f"\n[MAIN] Parsed {len(shift_metadata)} shifts:")
for s in shift_metadata:
    print(f"  shift_id='{s['shift_id']}' day={s['day']} "
          f"{s['start'].strftime('%H:%M')}-{s['end'].strftime('%H:%M')} "
          f"is_lab={s['is_lab']} staffing={s['staffing']}")

print(f"\n[MAIN] Parsed {len(ta_metadata)} TAs:")
for ta in ta_metadata:
    print(f"  ta_id='{ta['ta_id']}' name='{ta['name']}' "
          f"lab_admin_status={ta['lab_admin_status']} is_tf={ta['is_tf']} "
          f"min_hours={ta['min_hours']} max_hours={ta['max_hours']}")

print(f"\n[MAIN] Preference matrix summary:")
for ta_id, prefs in preference_matrix.items():
    nonzero = {k: v for k, v in prefs.items() if v > 0}
    print(f"  TA '{ta_id}': {len(prefs)} total prefs, {len(nonzero)} available/preferred")
    if nonzero:
        for sid, score in nonzero.items():
            label = "PREFERRED" if score == 2 else "available"
            print(f"    shift '{sid}' -> {score} ({label})")

# Step 3: Build context and initialize lookups
ctx = SchedulerContext(ta_metadata, shift_metadata, preference_matrix)
init_lookups(ctx)

print(f"\n[MAIN] Context built. Applying fairness constraints...")
apply_fairness(ctx)

print(f"\n[MAIN] After fairness adjustment:")
for ta in ctx.ta_metadata:
    print(f"  TA '{ta['ta_id']}': min_hours={ta['min_hours']:.1f}, max_hours={ta['max_hours']:.1f}")

# Step 4: Run simulated annealing (includes greedy as starting point)
print(f"\n[MAIN] Running simulated annealing (includes greedy init)...")
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

print(f"\n--- POSTING SCHEDULE TO DB (schedule_id={SCHEDULE_ID}) ---")
try:
    serialized = serialize_schedule(ctx, schedule)
    result = post_schedule(SCHEDULE_ID, {
        **serialized,
        "score": score
    })
    print(f"[MAIN] Successfully posted schedule {SCHEDULE_ID} to DB")
except Exception as e:
    print(f"[MAIN] ERROR: Could not post schedule to DB: {e}")
    import traceback
    traceback.print_exc()
