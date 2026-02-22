# ============================================================
# DATA ACCESS HELPERS
# ============================================================

def get_pref(ctx, ta_id, shift_id):
    """Get a TA's preference score for a shift. 0 means unavailable."""
    return ctx.preference_matrix.get(ta_id, {}).get(shift_id, 0)

def is_available(ctx, ta_id, shift_id):
    """A TA is available for a shift if their preference score is > 0."""
    return get_pref(ctx, ta_id, shift_id) > 0

def get_ta(ctx, ta_id):
    """Get TA metadata by ta_id."""
    return ctx.ta_metadata[ta_id - 1]

def get_shift(ctx, shift_id):
    """Get shift metadata by shift_id."""
    return ctx.shift_metadata[shift_id - 1]

def get_available_tas(ctx, shift_id):
    """Get all TAs who marked themselves available for a shift."""
    return [ta["ta_id"] for ta in ctx.ta_metadata if is_available(ctx, ta["ta_id"], shift_id)]

def get_eligible_leads(ctx, shift_id):
    """Get all TAs available for a shift who can be a lab lead."""
    return [ta_id for ta_id in get_available_tas(ctx, shift_id) if (get_ta(ctx, ta_id)["lab_admin_status"] == 3)]

def get_eligible_lab_tas(ctx, shift_id):
    """Get all TAs available for a shift who can be a lab TA."""
    return [ta_id for ta_id in get_available_tas(ctx, shift_id) if (get_ta(ctx, ta_id)["lab_admin_status"] >= 2)]

def get_shifts_for_ta(ctx, ta_id):
    """Get all shifts a TA marked themselves available for."""
    return [s["shift_id"] for s in ctx.shift_metadata if is_available(ctx, ta_id, s["shift_id"])]

def ta_id_to_name(ctx, ta_id):
    return get_ta(ctx, ta_id)["name"]

def shift_id_to_name(ctx, shift_id):
    return get_shift(ctx, shift_id)["name"]

def shift_duration_hours(shift):
    """Returns duration of a shift in hours as a float."""
    start_mins = shift["start"].hour * 60 + shift["start"].minute
    end_mins   = shift["end"].hour   * 60 + shift["end"].minute
    return (end_mins - start_mins) / 60

# ============================================================
# ASSIGNMENT HELPERS
# ============================================================

def assign_ta(ctx, ta_id, shift_id, current_assignments, hours_assigned):
    """Assign TA to shift."""
    current_assignments[ta_id].append(shift_id)
    hours_assigned[ta_id] += shift_duration_hours(get_shift(ctx, shift_id))

def remove_ta(ctx, ta_id, shift_id, current_assignments, hours_assigned):
    """Remove TA from shift."""
    current_assignments[ta_id].remove(shift_id)
    hours_assigned[ta_id] -= shift_duration_hours(get_shift(ctx, shift_id))