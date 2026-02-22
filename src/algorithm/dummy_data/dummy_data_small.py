from datetime import time
from data.context import Day

ta_metadata = [
    {"ta_id": 1, "name": "Alice", "experienced": True,  "lab_admin_status": 3, "min_hours": 4, "max_hours": 10, "is_tf": True },
    {"ta_id": 2, "name": "Bob",   "experienced": True,  "lab_admin_status": 3, "min_hours": 4, "max_hours": 10, "is_tf": False},
    {"ta_id": 3, "name": "Carol", "experienced": True,  "lab_admin_status": 2, "min_hours": 4, "max_hours": 8,  "is_tf": False},
    {"ta_id": 4, "name": "Dave",  "experienced": False, "lab_admin_status": 2, "min_hours": 2, "max_hours": 6,  "is_tf": False},
    {"ta_id": 5, "name": "Eve",   "experienced": False, "lab_admin_status": 3, "min_hours": 2, "max_hours": 6,  "is_tf": False},
    {"ta_id": 6, "name": "Frank", "experienced": False, "lab_admin_status": 1, "min_hours": 2, "max_hours": 6,  "is_tf": False},
    {"ta_id": 7, "name": "Grace", "experienced": True,  "lab_admin_status": 3, "min_hours": 4, "max_hours": 10, "is_tf": False},
    {"ta_id": 8, "name": "Hank",  "experienced": False, "lab_admin_status": 2, "min_hours": 2, "max_hours": 6,  "is_tf": False},
]

# staffing tuple: (num_oh_tas, num_lab_tas, num_leads)
# is_lab == False -> only staffing[0] is nonzero
# is_lab == True  -> only staffing[1] and staffing[2] are nonzero

shift_metadata = [
    # Monday OH shifts
    {"shift_id":  1, "name": "Mon 10:30 OH",  "day": Day.MONDAY,    "start": time(10, 30), "end": time(11, 45), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id":  2, "name": "Mon 13:30 OH",  "day": Day.MONDAY,    "start": time(13, 30), "end": time(14, 45), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id":  3, "name": "Mon 15:00 OH",  "day": Day.MONDAY,    "start": time(15,  0), "end": time(16, 15), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id":  4, "name": "Mon 19:00 OH",  "day": Day.MONDAY,    "start": time(19,  0), "end": time(20, 15), "is_lab": False, "staffing": (1, 0, 0)},

    # Tuesday Lab + overlapping OH
    {"shift_id":  5, "name": "Tue 12:00 Lab", "day": Day.TUESDAY,   "start": time(12,  0), "end": time(13, 15), "is_lab": True,  "staffing": (0, 2, 2)},
    {"shift_id":  6, "name": "Tue 12:00 OH",  "day": Day.TUESDAY,   "start": time(12,  0), "end": time(13, 15), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id":  7, "name": "Tue 15:00 Lab", "day": Day.TUESDAY,   "start": time(15,  0), "end": time(16, 15), "is_lab": True,  "staffing": (0, 2, 2)},
    {"shift_id":  8, "name": "Tue 15:00 OH",  "day": Day.TUESDAY,   "start": time(15,  0), "end": time(16, 15), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id":  9, "name": "Tue 19:00 OH",  "day": Day.TUESDAY,   "start": time(19,  0), "end": time(20, 15), "is_lab": False, "staffing": (2, 0, 0)},

    # Wednesday OH shifts
    {"shift_id": 10, "name": "Wed 9:00 OH",   "day": Day.WEDNESDAY, "start": time( 9,  0), "end": time(10, 15), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 11, "name": "Wed 13:30 OH",  "day": Day.WEDNESDAY, "start": time(13, 30), "end": time(14, 45), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 12, "name": "Wed 16:30 OH",  "day": Day.WEDNESDAY, "start": time(16, 30), "end": time(17, 45), "is_lab": False, "staffing": (1, 0, 0)},
]

# Rows = TAs (index 0-7 maps to ta_id 1-8)
# Cols = Shifts (index 0-11 maps to shift_id 1-12)
#             s1     s2     s3     s4     s5     s6     s7     s8     s9     s10    s11    s12
#           M10:30 M13:30 M15:00 M19:00 T12Lab T12OH  T15Lab T15OH  T19OH  W9:00 W13:30 W16:30

# 0 = unavailable, 1 = available but not preferred, 2 = available and preferred

preference_matrix = [
    [1,  2,  0,  1,  2,  1,  2,  0,  1,  1,  2,  0],  # Alice  (status 3: lead+ta+oh)
    [2,  0,  1,  0,  2,  1,  1,  2,  0,  1,  0,  1],  # Bob    (status 3: lead+ta+oh)
    [0,  1,  2,  0,  0,  2,  0,  1,  2,  2,  1,  0],  # Carol  (status 2: ta+oh)
    [1,  1,  0,  0,  0,  1,  2,  1,  0,  0,  2,  1],  # Dave   (status 2: ta+oh)
    [0,  2,  1,  1,  2,  0,  2,  1,  0,  1,  0,  2],  # Eve    (status 3: lead+ta+oh)
    [1,  0,  1,  0,  0,  0,  0,  1,  2,  1,  1,  0],  # Frank  (status 1: oh only)
    [2,  1,  2,  1,  2,  2,  1,  2,  1,  0,  1,  2],  # Grace  (status 3: lead+ta+oh)
    [0,  1,  0,  2,  1,  0,  1,  2,  1,  1,  2,  0],  # Hank   (status 2: ta+oh)
]