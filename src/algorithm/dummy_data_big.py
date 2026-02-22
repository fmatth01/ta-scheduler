from enum import Enum
from datetime import time

class Day(Enum):
    MONDAY    = "Monday"
    TUESDAY   = "Tuesday"
    WEDNESDAY = "Wednesday"
    THURSDAY  = "Thursday"
    FRIDAY    = "Friday"

# ============================================================
# 25 TAs
# Status distribution:
#   Status 3 (lead+ta+oh): 8 TAs  — enough to cover 4 labs × 2 leads
#   Status 2 (ta+oh):      11 TAs — bulk of lab TA and OH coverage
#   Status 1 (oh only):    6 TAs  — OH coverage only
#
# Hours: experienced TAs tend to have higher max, new TAs lower
# Total available hours: ~230h
# Total hours needed across 50 shifts × 1.25h = ~62.5h of slot-hours
# With multiple TAs per shift, total TA-hours needed ≈ 130h — comfortably under 230h
# ============================================================

ta_metadata = [
    # Status 3 — can be lead, lab TA, or OH TA (8 TAs)
    {"ta_id":  1, "name": "Alice",   "experienced": True,  "lab_admin_status": 3, "min_hours": 5, "max_hours": 12, "is_tf": True },
    {"ta_id":  2, "name": "Bob",     "experienced": True,  "lab_admin_status": 3, "min_hours": 5, "max_hours": 12, "is_tf": True },
    {"ta_id":  3, "name": "Carol",   "experienced": True,  "lab_admin_status": 3, "min_hours": 4, "max_hours": 10, "is_tf": False},
    {"ta_id":  4, "name": "Dave",    "experienced": True,  "lab_admin_status": 3, "min_hours": 4, "max_hours": 10, "is_tf": False},
    {"ta_id":  5, "name": "Eve",     "experienced": False, "lab_admin_status": 3, "min_hours": 3, "max_hours": 8,  "is_tf": False},
    {"ta_id":  6, "name": "Frank",   "experienced": False, "lab_admin_status": 3, "min_hours": 3, "max_hours": 8,  "is_tf": False},
    {"ta_id":  7, "name": "Grace",   "experienced": True,  "lab_admin_status": 3, "min_hours": 4, "max_hours": 10, "is_tf": False},
    {"ta_id":  8, "name": "Hank",    "experienced": False, "lab_admin_status": 3, "min_hours": 3, "max_hours": 8,  "is_tf": False},

    # Status 2 — can be lab TA or OH TA (11 TAs)
    {"ta_id":  9, "name": "Iris",    "experienced": True,  "lab_admin_status": 2, "min_hours": 4, "max_hours": 10, "is_tf": False},
    {"ta_id": 10, "name": "Jack",    "experienced": True,  "lab_admin_status": 2, "min_hours": 4, "max_hours": 10, "is_tf": False},
    {"ta_id": 11, "name": "Karen",   "experienced": False, "lab_admin_status": 2, "min_hours": 2, "max_hours": 7,  "is_tf": False},
    {"ta_id": 12, "name": "Leo",     "experienced": False, "lab_admin_status": 2, "min_hours": 2, "max_hours": 7,  "is_tf": False},
    {"ta_id": 13, "name": "Mia",     "experienced": True,  "lab_admin_status": 2, "min_hours": 4, "max_hours": 10, "is_tf": False},
    {"ta_id": 14, "name": "Nathan",  "experienced": False, "lab_admin_status": 2, "min_hours": 2, "max_hours": 7,  "is_tf": False},
    {"ta_id": 15, "name": "Olivia",  "experienced": True,  "lab_admin_status": 2, "min_hours": 4, "max_hours": 10, "is_tf": False},
    {"ta_id": 16, "name": "Pete",    "experienced": False, "lab_admin_status": 2, "min_hours": 2, "max_hours": 7,  "is_tf": False},
    {"ta_id": 17, "name": "Quinn",   "experienced": False, "lab_admin_status": 2, "min_hours": 2, "max_hours": 7,  "is_tf": False},
    {"ta_id": 18, "name": "Rachel",  "experienced": True,  "lab_admin_status": 2, "min_hours": 4, "max_hours": 10, "is_tf": False},
    {"ta_id": 19, "name": "Sam",     "experienced": False, "lab_admin_status": 2, "min_hours": 2, "max_hours": 7,  "is_tf": False},

    # Status 1 — OH only (6 TAs)
    {"ta_id": 20, "name": "Tina",    "experienced": False, "lab_admin_status": 1, "min_hours": 2, "max_hours": 6,  "is_tf": False},
    {"ta_id": 21, "name": "Uma",     "experienced": False, "lab_admin_status": 1, "min_hours": 2, "max_hours": 6,  "is_tf": False},
    {"ta_id": 22, "name": "Victor",  "experienced": False, "lab_admin_status": 1, "min_hours": 2, "max_hours": 6,  "is_tf": False},
    {"ta_id": 23, "name": "Wendy",   "experienced": False, "lab_admin_status": 1, "min_hours": 2, "max_hours": 6,  "is_tf": False},
    {"ta_id": 24, "name": "Xavier",  "experienced": False, "lab_admin_status": 1, "min_hours": 2, "max_hours": 6,  "is_tf": False},
    {"ta_id": 25, "name": "Yara",    "experienced": True,  "lab_admin_status": 1, "min_hours": 2, "max_hours": 6,  "is_tf": False},
]

# ============================================================
# 50 SHIFTS
# Structure:
#   Monday:    8 OH shifts
#   Tuesday:   2 labs + 2 overlapping OH + 6 other OH = 10 shifts
#   Wednesday: 8 OH shifts
#   Thursday:  8 OH shifts
#   Friday:    8 OH shifts (lighter staffing)
#
# Staffing:
#   Most OH shifts need 2 TAs
#   Some evening/low-traffic shifts need 1 TA
#   Each lab needs 2 leads + 2 lab TAs
#
# Total TA-slot assignments needed:
#   OH: 40 shifts, mix of 1-2 TAs ≈ 70 OH assignments
#   Lab: 2 labs × 4 TAs = 8 lab assignments
#   Total ≈ 78 assignments × 1.25h = 97.5 TA-hours needed
#   Total available: ~230h — solvable with room to spare
# ============================================================

shift_metadata = [
    # -------------------------
    # MONDAY — 8 OH shifts
    # -------------------------
    {"shift_id":  1, "name": "Mon 9:00 OH",   "day": Day.MONDAY,    "start": time( 9,  0), "end": time(10, 15), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id":  2, "name": "Mon 10:30 OH",  "day": Day.MONDAY,    "start": time(10, 30), "end": time(11, 45), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id":  3, "name": "Mon 12:00 OH",  "day": Day.MONDAY,    "start": time(12,  0), "end": time(13, 15), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id":  4, "name": "Mon 13:30 OH",  "day": Day.MONDAY,    "start": time(13, 30), "end": time(14, 45), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id":  5, "name": "Mon 15:00 OH",  "day": Day.MONDAY,    "start": time(15,  0), "end": time(16, 15), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id":  6, "name": "Mon 16:30 OH",  "day": Day.MONDAY,    "start": time(16, 30), "end": time(17, 45), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id":  7, "name": "Mon 19:00 OH",  "day": Day.MONDAY,    "start": time(19,  0), "end": time(20, 15), "is_lab": False, "staffing": (1, 0, 0)},
    {"shift_id":  8, "name": "Mon 20:30 OH",  "day": Day.MONDAY,    "start": time(20, 30), "end": time(21, 45), "is_lab": False, "staffing": (1, 0, 0)},

    # -------------------------
    # TUESDAY — 2 labs + 2 overlapping OH + 6 other OH
    # -------------------------
    {"shift_id":  9, "name": "Tue 9:00 OH",   "day": Day.TUESDAY,   "start": time( 9,  0), "end": time(10, 15), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 10, "name": "Tue 10:30 OH",  "day": Day.TUESDAY,   "start": time(10, 30), "end": time(11, 45), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 11, "name": "Tue 12:00 Lab", "day": Day.TUESDAY,   "start": time(12,  0), "end": time(13, 15), "is_lab": True,  "staffing": (0, 2, 2)},
    {"shift_id": 12, "name": "Tue 12:00 OH",  "day": Day.TUESDAY,   "start": time(12,  0), "end": time(13, 15), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 13, "name": "Tue 13:30 OH",  "day": Day.TUESDAY,   "start": time(13, 30), "end": time(14, 45), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 14, "name": "Tue 15:00 Lab", "day": Day.TUESDAY,   "start": time(15,  0), "end": time(16, 15), "is_lab": True,  "staffing": (0, 2, 2)},
    {"shift_id": 15, "name": "Tue 15:00 OH",  "day": Day.TUESDAY,   "start": time(15,  0), "end": time(16, 15), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 16, "name": "Tue 16:30 OH",  "day": Day.TUESDAY,   "start": time(16, 30), "end": time(17, 45), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 17, "name": "Tue 19:00 OH",  "day": Day.TUESDAY,   "start": time(19,  0), "end": time(20, 15), "is_lab": False, "staffing": (1, 0, 0)},
    {"shift_id": 18, "name": "Tue 20:30 OH",  "day": Day.TUESDAY,   "start": time(20, 30), "end": time(21, 45), "is_lab": False, "staffing": (1, 0, 0)},

    # -------------------------
    # WEDNESDAY — 8 OH shifts
    # -------------------------
    {"shift_id": 19, "name": "Wed 9:00 OH",   "day": Day.WEDNESDAY, "start": time( 9,  0), "end": time(10, 15), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 20, "name": "Wed 10:30 OH",  "day": Day.WEDNESDAY, "start": time(10, 30), "end": time(11, 45), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 21, "name": "Wed 12:00 OH",  "day": Day.WEDNESDAY, "start": time(12,  0), "end": time(13, 15), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 22, "name": "Wed 13:30 OH",  "day": Day.WEDNESDAY, "start": time(13, 30), "end": time(14, 45), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 23, "name": "Wed 15:00 OH",  "day": Day.WEDNESDAY, "start": time(15,  0), "end": time(16, 15), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 24, "name": "Wed 16:30 OH",  "day": Day.WEDNESDAY, "start": time(16, 30), "end": time(17, 45), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 25, "name": "Wed 19:00 OH",  "day": Day.WEDNESDAY, "start": time(19,  0), "end": time(20, 15), "is_lab": False, "staffing": (1, 0, 0)},
    {"shift_id": 26, "name": "Wed 20:30 OH",  "day": Day.WEDNESDAY, "start": time(20, 30), "end": time(21, 45), "is_lab": False, "staffing": (1, 0, 0)},

    # -------------------------
    # THURSDAY — 8 OH shifts
    # -------------------------
    {"shift_id": 27, "name": "Thu 9:00 OH",   "day": Day.THURSDAY,  "start": time( 9,  0), "end": time(10, 15), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 28, "name": "Thu 10:30 OH",  "day": Day.THURSDAY,  "start": time(10, 30), "end": time(11, 45), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 29, "name": "Thu 12:00 OH",  "day": Day.THURSDAY,  "start": time(12,  0), "end": time(13, 15), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 30, "name": "Thu 12:00 OH",  "day": Day.THURSDAY,  "start": time(12,  0), "end": time(13, 15), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 31, "name": "Thu 13:30 OH",  "day": Day.THURSDAY,  "start": time(13, 30), "end": time(14, 45), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 32, "name": "Thu 15:00 OH",  "day": Day.THURSDAY,  "start": time(15,  0), "end": time(16, 15), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 33, "name": "Thu 15:00 OH",  "day": Day.THURSDAY,  "start": time(15,  0), "end": time(16, 15), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 34, "name": "Thu 16:30 OH",  "day": Day.THURSDAY,  "start": time(16, 30), "end": time(17, 45), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 35, "name": "Thu 19:00 OH",  "day": Day.THURSDAY,  "start": time(19,  0), "end": time(20, 15), "is_lab": False, "staffing": (1, 0, 0)},
    {"shift_id": 36, "name": "Thu 20:30 OH",  "day": Day.THURSDAY,  "start": time(20, 30), "end": time(21, 45), "is_lab": False, "staffing": (1, 0, 0)},

    # -------------------------
    # FRIDAY — 8 OH shifts (lighter)
    # -------------------------
    {"shift_id": 37, "name": "Fri 9:00 OH",   "day": Day.FRIDAY,    "start": time( 9,  0), "end": time(10, 15), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 38, "name": "Fri 10:30 OH",  "day": Day.FRIDAY,    "start": time(10, 30), "end": time(11, 45), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 39, "name": "Fri 12:00 OH",  "day": Day.FRIDAY,    "start": time(12,  0), "end": time(13, 15), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 40, "name": "Fri 13:30 OH",  "day": Day.FRIDAY,    "start": time(13, 30), "end": time(14, 45), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 41, "name": "Fri 15:00 OH",  "day": Day.FRIDAY,    "start": time(15,  0), "end": time(16, 15), "is_lab": False, "staffing": (1, 0, 0)},
    {"shift_id": 42, "name": "Fri 16:30 OH",  "day": Day.FRIDAY,    "start": time(16, 30), "end": time(17, 45), "is_lab": False, "staffing": (1, 0, 0)},
    {"shift_id": 43, "name": "Fri 19:00 OH",  "day": Day.FRIDAY,    "start": time(19,  0), "end": time(20, 15), "is_lab": False, "staffing": (1, 0, 0)},
    {"shift_id": 44, "name": "Fri 20:30 OH",  "day": Day.FRIDAY,    "start": time(20, 30), "end": time(21, 45), "is_lab": False, "staffing": (1, 0, 0)},
]

# ============================================================
# PREFERENCE MATRIX
# 25 TAs (rows) x 44 shifts (cols)
# 0 = unavailable, 1 = available, 2 = preferred
#
# Design principles:
#   - Each TA is available for roughly 40-60% of shifts
#   - Status 1 TAs have 0 for all lab shifts
#   - Preferences spread across days so no single day is over/under staffed
#   - A few TAs are night-shift-friendly (prefer 19:00/20:30 slots)
#   - A few TAs are morning-friendly (prefer 9:00/10:30 slots)
# ============================================================

preference_matrix = [
    # s:  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44
    #   M9 M10 M12 M13 M15 M16 M19 M20 T9 T10 T12L T12 T13 T15L T15 T16 T19 T20 W9 W10 W12 W13 W15 W16 W19 W20 H9 H10 H12L H12 H13 H15L H15 H16 H19 H20 F9 F10 F12 F13 F15 F16 F19 F20
    [2, 2, 1, 1, 0, 0, 0, 0,  2, 1, 2, 1, 1, 2, 0, 0, 0, 0,  1, 2, 1, 0, 0, 0, 0, 0,  2, 1, 2, 1, 0, 1, 0, 0, 0, 0,  2, 1, 0, 0, 0, 0, 0, 0],  # Alice   (status 3, morning)
    [1, 2, 2, 1, 0, 0, 0, 0,  1, 2, 2, 2, 1, 1, 1, 0, 0, 0,  2, 2, 1, 1, 0, 0, 0, 0,  1, 2, 1, 2, 1, 2, 1, 0, 0, 0,  1, 2, 1, 0, 0, 0, 0, 0],  # Bob     (status 3, morning)
    [0, 1, 2, 2, 1, 1, 0, 0,  0, 1, 1, 2, 2, 2, 2, 1, 0, 0,  0, 1, 2, 2, 1, 0, 0, 0,  0, 1, 2, 2, 2, 1, 1, 0, 0, 0,  0, 1, 2, 2, 1, 0, 0, 0],  # Carol   (status 3, midday)
    [0, 0, 1, 2, 2, 2, 1, 0,  0, 0, 2, 1, 2, 2, 2, 1, 0, 0,  0, 0, 1, 2, 2, 1, 0, 0,  0, 0, 1, 1, 2, 2, 2, 1, 0, 0,  0, 0, 1, 2, 2, 1, 0, 0],  # Dave    (status 3, afternoon)
    [0, 0, 0, 1, 2, 2, 2, 1,  0, 0, 1, 0, 1, 2, 2, 2, 1, 0,  0, 0, 0, 1, 2, 2, 1, 0,  0, 0, 2, 0, 1, 2, 2, 2, 1, 0,  0, 0, 0, 1, 2, 2, 1, 0],  # Eve     (status 3, afternoon)
    [0, 0, 0, 0, 1, 1, 2, 2,  0, 0, 0, 0, 0, 1, 1, 2, 2, 1,  0, 0, 0, 0, 1, 1, 2, 2,  0, 0, 0, 0, 0, 1, 1, 2, 2, 1,  0, 0, 0, 0, 0, 1, 2, 2],  # Frank   (status 3, evening)
    [1, 2, 2, 1, 0, 0, 0, 0,  2, 2, 2, 2, 1, 1, 0, 0, 0, 0,  2, 2, 1, 0, 0, 0, 0, 0,  2, 2, 2, 2, 1, 0, 0, 0, 0, 0,  2, 2, 1, 0, 0, 0, 0, 0],  # Grace   (status 3, morning)
    [0, 0, 1, 1, 2, 2, 1, 0,  0, 0, 2, 1, 2, 2, 2, 1, 0, 0,  0, 0, 1, 2, 2, 1, 0, 0,  0, 0, 1, 1, 2, 2, 2, 2, 1, 0,  0, 0, 1, 2, 2, 1, 0, 0],  # Hank    (status 3, afternoon)
    [2, 2, 1, 0, 0, 0, 0, 0,  2, 2, 0, 2, 1, 0, 0, 0, 0, 0,  2, 2, 1, 0, 0, 0, 0, 0,  2, 2, 0, 2, 1, 0, 0, 0, 0, 0,  2, 2, 1, 0, 0, 0, 0, 0],  # Iris    (status 2, morning)
    [1, 2, 2, 1, 0, 0, 0, 0,  1, 2, 0, 2, 2, 0, 1, 0, 0, 0,  1, 2, 2, 1, 0, 0, 0, 0,  1, 2, 0, 2, 2, 0, 1, 0, 0, 0,  1, 2, 2, 1, 0, 0, 0, 0],  # Jack    (status 2, morning)
    [0, 1, 2, 2, 1, 0, 0, 0,  0, 1, 0, 2, 2, 0, 2, 1, 0, 0,  0, 1, 2, 2, 1, 0, 0, 0,  0, 1, 0, 2, 2, 0, 2, 1, 0, 0,  0, 1, 2, 2, 1, 0, 0, 0],  # Karen   (status 2, midday)
    [0, 0, 1, 2, 2, 1, 0, 0,  0, 0, 0, 1, 2, 0, 2, 2, 0, 0,  0, 0, 1, 2, 2, 1, 0, 0,  0, 0, 0, 1, 2, 0, 2, 2, 0, 0,  0, 0, 1, 2, 2, 1, 0, 0],  # Leo     (status 2, afternoon)
    [0, 0, 0, 1, 2, 2, 1, 0,  0, 0, 0, 0, 1, 0, 2, 2, 1, 0,  0, 0, 0, 1, 2, 2, 1, 0,  0, 0, 0, 0, 1, 0, 2, 2, 1, 0,  0, 0, 0, 1, 2, 2, 1, 0],  # Mia     (status 2, afternoon)
    [0, 0, 0, 0, 1, 2, 2, 1,  0, 0, 0, 0, 0, 0, 1, 2, 2, 1,  0, 0, 0, 0, 1, 2, 2, 1,  0, 0, 0, 0, 0, 0, 1, 2, 2, 1,  0, 0, 0, 0, 1, 2, 2, 1],  # Nathan  (status 2, evening)
    [1, 2, 2, 1, 0, 0, 0, 0,  1, 2, 0, 2, 1, 0, 0, 0, 0, 0,  1, 2, 2, 1, 0, 0, 0, 0,  1, 2, 0, 2, 1, 0, 0, 0, 0, 0,  1, 2, 2, 1, 0, 0, 0, 0],  # Olivia  (status 2, morning)
    [0, 1, 2, 2, 1, 1, 0, 0,  0, 1, 0, 2, 2, 0, 1, 1, 0, 0,  0, 1, 2, 2, 1, 0, 0, 0,  0, 1, 0, 2, 2, 0, 1, 1, 0, 0,  0, 1, 2, 2, 1, 0, 0, 0],  # Pete    (status 2, midday)
    [0, 0, 1, 1, 2, 2, 1, 0,  0, 0, 0, 1, 1, 0, 2, 2, 1, 0,  0, 0, 1, 1, 2, 2, 0, 0,  0, 0, 0, 1, 1, 0, 2, 2, 1, 0,  0, 0, 1, 1, 2, 2, 0, 0],  # Quinn   (status 2, afternoon)
    [0, 0, 0, 1, 2, 2, 2, 1,  0, 0, 0, 0, 1, 0, 2, 2, 2, 1,  0, 0, 0, 1, 2, 2, 1, 0,  0, 0, 0, 0, 1, 0, 2, 2, 2, 1,  0, 0, 0, 1, 1, 2, 1, 0],  # Rachel  (status 2, afternoon)
    [0, 0, 0, 0, 0, 1, 2, 2,  0, 0, 0, 0, 0, 0, 0, 1, 2, 2,  0, 0, 0, 0, 0, 1, 2, 2,  0, 0, 0, 0, 0, 0, 0, 1, 2, 2,  0, 0, 0, 0, 0, 1, 2, 2],  # Sam     (status 2, evening)
    [2, 2, 1, 0, 0, 0, 0, 0,  2, 2, 0, 1, 0, 0, 0, 0, 0, 0,  2, 2, 1, 0, 0, 0, 0, 0,  2, 2, 0, 1, 0, 0, 0, 0, 0, 0,  2, 2, 1, 0, 0, 0, 0, 0],  # Tina    (status 1, morning)
    [1, 2, 2, 1, 0, 0, 0, 0,  1, 2, 0, 2, 1, 0, 0, 0, 0, 0,  1, 2, 2, 1, 0, 0, 0, 0,  1, 2, 0, 2, 1, 0, 0, 0, 0, 0,  1, 2, 2, 1, 0, 0, 0, 0],  # Uma     (status 1, morning)
    [0, 0, 1, 2, 2, 1, 0, 0,  0, 0, 0, 2, 2, 0, 1, 0, 0, 0,  0, 0, 1, 2, 2, 1, 0, 0,  0, 0, 0, 2, 2, 0, 1, 0, 0, 0,  0, 0, 1, 2, 2, 1, 0, 0],  # Victor  (status 1, midday)
    [0, 0, 0, 1, 2, 2, 1, 0,  0, 0, 0, 0, 1, 0, 2, 2, 1, 0,  0, 0, 0, 1, 2, 2, 1, 0,  0, 0, 0, 0, 1, 0, 2, 2, 1, 0,  0, 0, 0, 1, 2, 2, 0, 0],  # Wendy   (status 1, afternoon)
    [0, 0, 0, 0, 1, 1, 2, 2,  0, 0, 0, 0, 0, 0, 1, 1, 2, 2,  0, 0, 0, 0, 1, 1, 2, 2,  0, 0, 0, 0, 0, 0, 1, 1, 2, 2,  0, 0, 0, 0, 1, 1, 2, 2],  # Xavier  (status 1, evening)
    [0, 0, 0, 0, 0, 1, 2, 2,  0, 0, 0, 0, 0, 0, 0, 1, 2, 2,  0, 0, 0, 0, 0, 1, 2, 2,  0, 0, 0, 0, 0, 0, 0, 1, 2, 2,  0, 0, 0, 0, 0, 0, 2, 2],  # Yara    (status 1, evening)
]
