# Allows us to treat these data fields as "global"
class SchedulerContext:
    def __init__(self, ta_metadata, shift_metadata, preference_matrix):
        self.ta_metadata        = ta_metadata
        self.shift_metadata     = shift_metadata
        self.preference_matrix  = preference_matrix