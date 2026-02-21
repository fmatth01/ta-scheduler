from context import SchedulerContext
from constraints import apply_fairness_floor
from simulated_annealing import *

from dummy_data_big import ta_metadata, shift_metadata, preference_matrix

# Build context
ctx = SchedulerContext(ta_metadata, shift_metadata, preference_matrix)

# Apply fairness floor (mutates ctx.ta_metadata in place)
apply_fairness_floor(ctx)

# Run scheduler
schedule, hours_assigned, score = simulated_annealing(ctx)
display_results(ctx, schedule, hours_assigned, score)