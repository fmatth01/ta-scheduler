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

DAY_PREFIX_MAP = {
    "m":  Day.MONDAY,
    "tu": Day.TUESDAY,
    "w":  Day.WEDNESDAY,
    "th": Day.THURSDAY,
    "f":  Day.FRIDAY,
    "sa": Day.SATURDAY,
    "su": Day.SUNDAY,
}

def parse_time(hhmm):
    """Convert 'HH:MM' string to a Python time object."""
    if hhmm == "00:00":
        hhmm = "23:59"
    hh, mm = map(int, hhmm.split(":"))
    if hh == 24:
        hh = 23
        mm = 59
    return dt_time(hh, mm)

def parse_time_slot(time_slot):
    """
    Parse 'm:09:00-10:30' into (Day.MONDAY, time(9,0), time(10,30))
    """
    day_prefix, times = time_slot.split(":", 1)
    start_str, end_str = times.split("-")

    # Handle midnight edge case "24:00"
    def safe_parse_time(hhmm):
        hh, mm = map(int, hhmm.split(":"))
        if hh == 24:
            hh = 23
            mm = 59
        return dt_time(hh, mm)

    return (
        DAY_PREFIX_MAP[day_prefix],
        safe_parse_time(start_str),
        safe_parse_time(end_str)
    )

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
    Handles shifts where time is stored as 'time_slots' e.g. 'm:09:00-10:30'
    """
    shifts = []
    shift_counter = 1  # generate numeric shift_ids since DB has empty strings

    for day_str, day_shifts in raw_schedule.items():
        if day_str not in DAY_MAP:
            continue  # skip _id, schedule_id, score etc.
        if not day_shifts:
            continue

        for shift in day_shifts:
            # Handle both time_slots format and separate start_time/end_time
            if "time_slots" in shift:
                day, start, end = parse_time_slot(shift["time_slots"])
            else:
                day   = DAY_MAP[day_str]
                start = parse_time(shift["start_time"])
                end   = parse_time(shift["end_time"])

            # Use DB shift_id if populated, otherwise generate one
            shift_id = shift.get("shift_id") or shift_counter

            shifts.append({
                "shift_id": shift_id,
                "name":     f"{day_str.capitalize()} {start.strftime('%H:%M')}",
                "day":      day,
                "start":    start,
                "end":      end,
                "is_lab":   shift["is_lab"],
                "staffing": parse_staffing(shift["staffing_capacity"]),
            })

            shift_counter += 1

    return shifts

def parse_tas(raw_tas):
    """
    Convert array of TA documents from MongoDB into the format
    our scheduler expects.
    """
    tas = []
    for ta in raw_tas:
        tas.append({
            "ta_id":             ta["ta_id"],
            "name":              f"{ta['first_name']} {ta['last_name']}",
            "is_tf":             ta["is_tf"],
            "lab_admin_status":  ta["lab_perm"],

            # Fields not in schema yet — using defaults
            "experienced":       ta.get("experienced", False),
            "min_hours":         ta.get("min_hours", 2),
            "max_hours":         ta.get("max_hours", 6),
            "companions":        ta.get("companions", []),
        })
    return tas

def parse_preference_matrix(raw_tas, shift_metadata):
    """
    Build preference matrix by matching time_slot strings to shifts
    in shift_metadata by day + start time.
    Returns {ta_id: {shift_id: score}}
    """
    # Build a lookup from (day, start_time) -> shift_id
    shift_lookup = {
        (shift["day"], shift["start"]): shift["shift_id"]
        for shift in shift_metadata
    }

    matrix = {}
    for ta in raw_tas:
        ta_id = ta["ta_id"]
        matrix[ta_id] = {}
        for pref in ta.get("preferences", []):
            try:
                day, start, end = parse_time_slot(pref["time_slots"])
                shift_id = shift_lookup.get((day, start))
                if shift_id is not None:
                    matrix[ta_id][shift_id] = pref["preference"]
            except Exception as e:
                print(f"Could not parse time slot '{pref['time_slots']}' for TA {ta_id}: {e}")
                continue

    return matrix

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
    Converts our internal schedule dict into the MongoDB format.
    tas_scheduled is populated with full TA objects looked up from ctx.
    """
    # Build a lookup from ta_id -> full TA object
    ta_lookup = {ta["ta_id"]: ta for ta in ctx.ta_metadata}

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

        all_ta_ids = (
            assignment["leads"] +
            assignment["lab_tas"] +
            assignment["oh_tas"]
        )

        # Swap IDs for full TA objects
        tas_scheduled = [ta_lookup[ta_id] for ta_id in all_ta_ids if ta_id in ta_lookup]

        output[day_str].append({
            "shift_id":          shift_id,
            "start_time":        shift["start"].strftime("%H:%M"),
            "end_time":          shift["end"].strftime("%H:%M"),
            "is_lab":            shift["is_lab"],
            "is_empty":          len(tas_scheduled) == 0,
            "tas_scheduled":     tas_scheduled,
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