from context import SchedulerContext
from constraints import *
from simulated_annealing import *
from scoring import *
from reducer import *

from realistic_dummy_data import ta_metadata, shift_metadata, preference_matrix

# Build context
ctx = SchedulerContext(ta_metadata, shift_metadata, preference_matrix)

# Apply fairness caps (mutates ctx.ta_metadata in place)
apply_fairness(ctx)

# Run scheduler
schedule, hours_assigned, score = simulated_annealing(ctx)
display_results(ctx, schedule, hours_assigned, score)

# Show cost of full schedule
print("\n--- FULL SCHEDULE COST ---")
print(calculate_cost(ctx, hours_assigned))

# Reduce to target budget
print("\n--- REDUCED SCHEDULE ---")
target_budget = calculate_cost(ctx, hours_assigned) * 0.8
reduced_schedule, reduced_hours = reduce_schedule(ctx, schedule, hours_assigned, target_budget)

# Show results of reduced schedule
print("\n--- REDUCED SCHEDULE ASSIGNMENTS ---")
display_results(ctx, reduced_schedule, reduced_hours, score)

print("\n--- REDUCED SCHEDULE COST ---")
print(calculate_cost(ctx, reduced_hours))