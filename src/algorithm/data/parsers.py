from datetime import time as dt_time
from data.context import Day

# ============================================================
# PARSE INPUT
# ============================================================

DAY_MAP = {
    "monday":    Day.MONDAY,
    "tuesday":   Day.TUESDAY,
    "wednesday": Day.WEDNESDAY,
    "thursday":  Day.THURSDAY,
    "friday":    Day.FRIDAY,
    "saturday":  Day.SATURDAY,
    "sunday":    Day.SUNDAY,
}

def parse_time(hhmm):
    """Convert 'HH:MM' string to a Python time object."""
    hh, mm = map(int, hhmm.split(":"))
    return dt_time(hh, mm)

def parse_staffing(staffing_capacity):
    """
    Convert [lab_perm, num_tas] to our (oh_tas, lab_tas, leads) tuple.
    Assumes same num_tas for each role in a lab shift.
    lab_perm: 0 = OH only, 1 = lab TA, 2 = lab lead (also has lab TAs)
    """
    lab_perm, num_tas = staffing_capacity
    if lab_perm == 0:
        return (num_tas, 0, 0)       # OH shift
    elif lab_perm == 1:
        return (0, num_tas, 0)       # lab TAs only
    elif lab_perm == 2:
        return (0, num_tas, num_tas) # leads + equal number of lab TAs
    else:
        raise ValueError(f"Unknown lab_perm value: {lab_perm}")

def parse_shifts(raw_schedule):
    """
    Flatten the day-keyed schedule document into a list of shift dicts
    matching the format our scheduler expects.
    """
    shifts = []
    for day_str, day_shifts in raw_schedule.items():
        if day_str not in DAY_MAP:
            continue  # skip _id, schedule_id etc.
        if not day_shifts:
            continue

        for shift in day_shifts:
            shifts.append({
                "shift_id":  shift["shift_id"],
                "name":      f"{day_str.capitalize()} {shift['start_time']}",
                "day":       DAY_MAP[day_str],
                "start":     parse_time(shift["start_time"]),
                "end":       parse_time(shift["end_time"]),
                "is_lab":    shift["is_lab"],
                "staffing":  parse_staffing(shift["staffing_capacity"]),
            })

    return shifts

# ============================================================
# PARSE OUTPUT
# ============================================================

DAY_REVERSE_MAP = {
    Day.MONDAY:    "monday",
    Day.TUESDAY:   "tuesday",
    Day.WEDNESDAY: "wednesday",
    Day.THURSDAY:  "thursday",
    Day.FRIDAY:    "friday",
    Day.SATURDAY:  "saturday",
    Day.SUNDAY:    "sunday",
}

def serialize_schedule(ctx, schedule):
    """
    Converts our internal schedule dict into the MongoDB format,
    grouping shifts back under their day keys and populating
    tas_scheduled for each shift.
    """
    output = {
        "monday":    [],
        "tuesday":   [],
        "wednesday": [],
        "thursday":  [],
        "friday":    [],
        "saturday":  [],
        "sunday":    [],
    }

    for shift in ctx.shift_metadata:
        shift_id   = shift["shift_id"]
        assignment = schedule[shift_id]
        day_str    = DAY_REVERSE_MAP[shift["day"]]

        all_tas = (
            assignment["leads"] +
            assignment["lab_tas"] +
            assignment["oh_tas"]
        )

        output[day_str].append({
            "shift_id":         shift_id,
            "start_time":       shift["start"].strftime("%H:%M"),
            "end_time":         shift["end"].strftime("%H:%M"),
            "is_lab":           shift["is_lab"],
            "is_empty":         len(all_tas) == 0,
            "tas_scheduled":    all_tas,
            "staffing_capacity": serialize_staffing(shift["staffing"]),
        })

    return output

def serialize_staffing(staffing_tuple):
    """
    Convert our (oh_tas, lab_tas, leads) tuple back to [lab_perm, num_tas].
    Reverses parse_staffing.
    """
    oh_tas, lab_tas, leads = staffing_tuple
    if leads > 0:
        return [2, leads]
    elif lab_tas > 0:
        return [1, lab_tas]
    else:
        return [0, oh_tas]