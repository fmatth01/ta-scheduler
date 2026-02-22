from datetime import time
from data.context import Day

ta_metadata = [
    # Status 3 — can be lead, lab TA, or OH TA (8 TAs)
    {"ta_id":  1, "name": "Alice",  "experienced": True,  "lab_admin_status": 3, "min_hours": 5, "max_hours": 12, "is_tf": True,  "companions": [7, 3]},      # Alice likes working with Grace and Carol
    {"ta_id":  2, "name": "Bob",    "experienced": True,  "lab_admin_status": 3, "min_hours": 5, "max_hours": 12, "is_tf": True,  "companions": [4, 10]},     # Bob likes Dave and Jack
    {"ta_id":  3, "name": "Carol",  "experienced": True,  "lab_admin_status": 3, "min_hours": 4, "max_hours": 10, "is_tf": False, "companions": [1, 9]},      # Carol likes Alice and Iris
    {"ta_id":  4, "name": "Dave",   "experienced": True,  "lab_admin_status": 3, "min_hours": 4, "max_hours": 10, "is_tf": False, "companions": [2]},         # Dave likes Bob
    {"ta_id":  5, "name": "Eve",    "experienced": False, "lab_admin_status": 3, "min_hours": 3, "max_hours": 8,  "is_tf": False, "companions": [8, 12]},     # Eve likes Hank and Leo
    {"ta_id":  6, "name": "Frank",  "experienced": False, "lab_admin_status": 3, "min_hours": 3, "max_hours": 8,  "is_tf": False, "companions": [19]},        # Frank likes Sam (both evening people)
    {"ta_id":  7, "name": "Grace",  "experienced": True,  "lab_admin_status": 3, "min_hours": 4, "max_hours": 10, "is_tf": False, "companions": [1, 2]},      # Grace likes Alice and Bob
    {"ta_id":  8, "name": "Hank",   "experienced": False, "lab_admin_status": 3, "min_hours": 3, "max_hours": 8,  "is_tf": False, "companions": [5, 11]},     # Hank likes Eve and Karen

    # Status 2 — can be lab TA or OH TA (11 TAs)
    {"ta_id":  9, "name": "Iris",   "experienced": True,  "lab_admin_status": 2, "min_hours": 4, "max_hours": 10, "is_tf": False, "companions": [3, 15]},     # Iris likes Carol and Olivia
    {"ta_id": 10, "name": "Jack",   "experienced": True,  "lab_admin_status": 2, "min_hours": 4, "max_hours": 10, "is_tf": False, "companions": [2, 13]},     # Jack likes Bob and Mia
    {"ta_id": 11, "name": "Karen",  "experienced": False, "lab_admin_status": 2, "min_hours": 2, "max_hours": 7,  "is_tf": False, "companions": [8, 17]},     # Karen likes Hank and Quinn
    {"ta_id": 12, "name": "Leo",    "experienced": False, "lab_admin_status": 2, "min_hours": 2, "max_hours": 7,  "is_tf": False, "companions": [5]},         # Leo likes Eve
    {"ta_id": 13, "name": "Mia",    "experienced": True,  "lab_admin_status": 2, "min_hours": 4, "max_hours": 10, "is_tf": False, "companions": [10, 18]},    # Mia likes Jack and Rachel
    {"ta_id": 14, "name": "Nathan", "experienced": False, "lab_admin_status": 2, "min_hours": 2, "max_hours": 7,  "is_tf": False, "companions": [19, 24]},    # Nathan likes Sam and Xavier (all evening)
    {"ta_id": 15, "name": "Olivia", "experienced": True,  "lab_admin_status": 2, "min_hours": 4, "max_hours": 10, "is_tf": False, "companions": [9]},         # Olivia likes Iris
    {"ta_id": 16, "name": "Pete",   "experienced": False, "lab_admin_status": 2, "min_hours": 2, "max_hours": 7,  "is_tf": False, "companions": [17]},        # Pete likes Quinn
    {"ta_id": 17, "name": "Quinn",  "experienced": False, "lab_admin_status": 2, "min_hours": 2, "max_hours": 7,  "is_tf": False, "companions": [16, 11]},    # Quinn likes Pete and Karen
    {"ta_id": 18, "name": "Rachel", "experienced": True,  "lab_admin_status": 2, "min_hours": 4, "max_hours": 10, "is_tf": False, "companions": [13]},        # Rachel likes Mia
    {"ta_id": 19, "name": "Sam",    "experienced": False, "lab_admin_status": 2, "min_hours": 2, "max_hours": 7,  "is_tf": False, "companions": [6, 14]},     # Sam likes Frank and Nathan (all evening)

    # Status 1 — OH only (6 TAs)
    {"ta_id": 20, "name": "Tina",   "experienced": False, "lab_admin_status": 1, "min_hours": 2, "max_hours": 6,  "is_tf": False, "companions": [21]},        # Tina likes Uma
    {"ta_id": 21, "name": "Uma",    "experienced": False, "lab_admin_status": 1, "min_hours": 2, "max_hours": 6,  "is_tf": False, "companions": [20]},        # Uma likes Tina (mutual)
    {"ta_id": 22, "name": "Victor", "experienced": False, "lab_admin_status": 1, "min_hours": 2, "max_hours": 6,  "is_tf": False, "companions": [23]},        # Victor likes Wendy
    {"ta_id": 23, "name": "Wendy",  "experienced": False, "lab_admin_status": 1, "min_hours": 2, "max_hours": 6,  "is_tf": False, "companions": [22]},        # Wendy likes Victor (mutual)
    {"ta_id": 24, "name": "Xavier", "experienced": False, "lab_admin_status": 1, "min_hours": 2, "max_hours": 6,  "is_tf": False, "companions": [14, 25]},    # Xavier likes Nathan and Yara
    {"ta_id": 25, "name": "Yara",   "experienced": True,  "lab_admin_status": 1, "min_hours": 2, "max_hours": 6,  "is_tf": False, "companions": [24]},        # Yara likes Xavier (mutual)
]

shift_metadata = [
    # MONDAY — 8 OH shifts
    {"shift_id":  1, "name": "Mon 9:00 OH",   "day": Day.MONDAY,    "start": time( 9,  0), "end": time(10, 15), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id":  2, "name": "Mon 10:30 OH",  "day": Day.MONDAY,    "start": time(10, 30), "end": time(11, 45), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id":  3, "name": "Mon 12:00 OH",  "day": Day.MONDAY,    "start": time(12,  0), "end": time(13, 15), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id":  4, "name": "Mon 13:30 OH",  "day": Day.MONDAY,    "start": time(13, 30), "end": time(14, 45), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id":  5, "name": "Mon 15:00 OH",  "day": Day.MONDAY,    "start": time(15,  0), "end": time(16, 15), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id":  6, "name": "Mon 16:30 OH",  "day": Day.MONDAY,    "start": time(16, 30), "end": time(17, 45), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id":  7, "name": "Mon 19:00 OH",  "day": Day.MONDAY,    "start": time(19,  0), "end": time(20, 15), "is_lab": False, "staffing": (1, 0, 0)},
    {"shift_id":  8, "name": "Mon 20:30 OH",  "day": Day.MONDAY,    "start": time(20, 30), "end": time(21, 45), "is_lab": False, "staffing": (1, 0, 0)},

    # TUESDAY — 2 labs + 2 overlapping OH + 6 other OH
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

    # WEDNESDAY — 8 OH shifts
    {"shift_id": 19, "name": "Wed 9:00 OH",   "day": Day.WEDNESDAY, "start": time( 9,  0), "end": time(10, 15), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 20, "name": "Wed 10:30 OH",  "day": Day.WEDNESDAY, "start": time(10, 30), "end": time(11, 45), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 21, "name": "Wed 12:00 OH",  "day": Day.WEDNESDAY, "start": time(12,  0), "end": time(13, 15), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 22, "name": "Wed 13:30 OH",  "day": Day.WEDNESDAY, "start": time(13, 30), "end": time(14, 45), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 23, "name": "Wed 15:00 OH",  "day": Day.WEDNESDAY, "start": time(15,  0), "end": time(16, 15), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 24, "name": "Wed 16:30 OH",  "day": Day.WEDNESDAY, "start": time(16, 30), "end": time(17, 45), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 25, "name": "Wed 19:00 OH",  "day": Day.WEDNESDAY, "start": time(19,  0), "end": time(20, 15), "is_lab": False, "staffing": (1, 0, 0)},
    {"shift_id": 26, "name": "Wed 20:30 OH",  "day": Day.WEDNESDAY, "start": time(20, 30), "end": time(21, 45), "is_lab": False, "staffing": (1, 0, 0)},

    # THURSDAY — 8 OH shifts
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

    # FRIDAY — 8 OH shifts (lighter)
    {"shift_id": 37, "name": "Fri 9:00 OH",   "day": Day.FRIDAY,    "start": time( 9,  0), "end": time(10, 15), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 38, "name": "Fri 10:30 OH",  "day": Day.FRIDAY,    "start": time(10, 30), "end": time(11, 45), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 39, "name": "Fri 12:00 OH",  "day": Day.FRIDAY,    "start": time(12,  0), "end": time(13, 15), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 40, "name": "Fri 13:30 OH",  "day": Day.FRIDAY,    "start": time(13, 30), "end": time(14, 45), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 41, "name": "Fri 15:00 OH",  "day": Day.FRIDAY,    "start": time(15,  0), "end": time(16, 15), "is_lab": False, "staffing": (1, 0, 0)},
    {"shift_id": 42, "name": "Fri 16:30 OH",  "day": Day.FRIDAY,    "start": time(16, 30), "end": time(17, 45), "is_lab": False, "staffing": (1, 0, 0)},
    {"shift_id": 43, "name": "Fri 19:00 OH",  "day": Day.FRIDAY,    "start": time(19,  0), "end": time(20, 15), "is_lab": False, "staffing": (1, 0, 0)},
    {"shift_id": 44, "name": "Fri 20:30 OH",  "day": Day.FRIDAY,    "start": time(20, 30), "end": time(21, 45), "is_lab": False, "staffing": (1, 0, 0)},
]

preference_matrix = {
    1:  {1:2, 2:2, 3:1, 4:1, 5:0, 6:0, 7:0, 8:0, 9:2, 10:1, 11:2, 12:1, 13:1, 14:2, 15:0, 16:0, 17:0, 18:0, 19:1, 20:2, 21:1, 22:0, 23:0, 24:0, 25:0, 26:0, 27:2, 28:1, 29:2, 30:1, 31:0, 32:1, 33:0, 34:0, 35:0, 36:0, 37:2, 38:1, 39:0, 40:0, 41:0, 42:0, 43:0, 44:0},  # Alice
    2:  {1:1, 2:2, 3:2, 4:1, 5:0, 6:0, 7:0, 8:0, 9:1, 10:2, 11:2, 12:2, 13:1, 14:1, 15:1, 16:0, 17:0, 18:0, 19:2, 20:2, 21:1, 22:1, 23:0, 24:0, 25:0, 26:0, 27:1, 28:2, 29:1, 30:2, 31:1, 32:2, 33:1, 34:0, 35:0, 36:0, 37:1, 38:2, 39:1, 40:0, 41:0, 42:0, 43:0, 44:0},  # Bob
    3:  {1:0, 2:1, 3:2, 4:2, 5:1, 6:1, 7:0, 8:0, 9:0, 10:1, 11:1, 12:2, 13:2, 14:2, 15:2, 16:1, 17:0, 18:0, 19:0, 20:1, 21:2, 22:2, 23:1, 24:0, 25:0, 26:0, 27:0, 28:1, 29:2, 30:2, 31:2, 32:1, 33:1, 34:0, 35:0, 36:0, 37:0, 38:1, 39:2, 40:2, 41:1, 42:0, 43:0, 44:0},  # Carol
    4:  {1:0, 2:0, 3:1, 4:2, 5:2, 6:2, 7:1, 8:0, 9:0, 10:0, 11:2, 12:1, 13:2, 14:2, 15:2, 16:1, 17:0, 18:0, 19:0, 20:0, 21:1, 22:2, 23:2, 24:1, 25:0, 26:0, 27:0, 28:0, 29:1, 30:1, 31:2, 32:2, 33:2, 34:1, 35:0, 36:0, 37:0, 38:0, 39:1, 40:2, 41:2, 42:1, 43:0, 44:0},  # Dave
    5:  {1:0, 2:0, 3:0, 4:1, 5:2, 6:2, 7:2, 8:1, 9:0, 10:0, 11:1, 12:0, 13:1, 14:2, 15:2, 16:2, 17:1, 18:0, 19:0, 20:0, 21:0, 22:1, 23:2, 24:2, 25:1, 26:0, 27:0, 28:0, 29:2, 30:0, 31:1, 32:2, 33:2, 34:2, 35:1, 36:0, 37:0, 38:0, 39:0, 40:1, 41:2, 42:2, 43:1, 44:0},  # Eve
    6:  {1:0, 2:0, 3:0, 4:0, 5:1, 6:1, 7:2, 8:2, 9:0, 10:0, 11:0, 12:0, 13:0, 14:1, 15:1, 16:2, 17:2, 18:1, 19:0, 20:0, 21:0, 22:0, 23:1, 24:1, 25:2, 26:2, 27:0, 28:0, 29:0, 30:0, 31:0, 32:1, 33:1, 34:2, 35:2, 36:1, 37:0, 38:0, 39:0, 40:0, 41:0, 42:1, 43:2, 44:2},  # Frank
    7:  {1:1, 2:2, 3:2, 4:1, 5:0, 6:0, 7:0, 8:0, 9:2, 10:2, 11:2, 12:2, 13:1, 14:1, 15:0, 16:0, 17:0, 18:0, 19:2, 20:2, 21:1, 22:0, 23:0, 24:0, 25:0, 26:0, 27:2, 28:2, 29:2, 30:2, 31:1, 32:0, 33:0, 34:0, 35:0, 36:0, 37:2, 38:2, 39:1, 40:0, 41:0, 42:0, 43:0, 44:0},  # Grace
    8:  {1:0, 2:0, 3:1, 4:1, 5:2, 6:2, 7:1, 8:0, 9:0, 10:0, 11:2, 12:1, 13:2, 14:2, 15:2, 16:1, 17:0, 18:0, 19:0, 20:0, 21:1, 22:2, 23:2, 24:1, 25:0, 26:0, 27:0, 28:0, 29:1, 30:1, 31:2, 32:2, 33:2, 34:2, 35:1, 36:0, 37:0, 38:0, 39:1, 40:2, 41:2, 42:1, 43:0, 44:0},  # Hank
    9:  {1:2, 2:2, 3:1, 4:0, 5:0, 6:0, 7:0, 8:0, 9:2, 10:2, 11:0, 12:2, 13:1, 14:0, 15:0, 16:0, 17:0, 18:0, 19:2, 20:2, 21:1, 22:0, 23:0, 24:0, 25:0, 26:0, 27:2, 28:2, 29:0, 30:2, 31:1, 32:0, 33:0, 34:0, 35:0, 36:0, 37:2, 38:2, 39:1, 40:0, 41:0, 42:0, 43:0, 44:0},  # Iris
    10: {1:1, 2:2, 3:2, 4:1, 5:0, 6:0, 7:0, 8:0, 9:1, 10:2, 11:0, 12:2, 13:2, 14:0, 15:1, 16:0, 17:0, 18:0, 19:1, 20:2, 21:2, 22:1, 23:0, 24:0, 25:0, 26:0, 27:1, 28:2, 29:0, 30:2, 31:2, 32:0, 33:1, 34:0, 35:0, 36:0, 37:1, 38:2, 39:2, 40:1, 41:0, 42:0, 43:0, 44:0},  # Jack
    11: {1:0, 2:1, 3:2, 4:2, 5:1, 6:0, 7:0, 8:0, 9:0, 10:1, 11:0, 12:2, 13:2, 14:0, 15:2, 16:1, 17:0, 18:0, 19:0, 20:1, 21:2, 22:2, 23:1, 24:0, 25:0, 26:0, 27:0, 28:1, 29:0, 30:2, 31:2, 32:0, 33:2, 34:1, 35:0, 36:0, 37:0, 38:1, 39:2, 40:2, 41:1, 42:0, 43:0, 44:0},  # Karen
    12: {1:0, 2:0, 3:1, 4:2, 5:2, 6:1, 7:0, 8:0, 9:0, 10:0, 11:0, 12:1, 13:2, 14:0, 15:2, 16:2, 17:0, 18:0, 19:0, 20:0, 21:1, 22:2, 23:2, 24:1, 25:0, 26:0, 27:0, 28:0, 29:0, 30:1, 31:2, 32:0, 33:2, 34:2, 35:0, 36:0, 37:0, 38:0, 39:1, 40:2, 41:2, 42:1, 43:0, 44:0},  # Leo
    13: {1:0, 2:0, 3:0, 4:1, 5:2, 6:2, 7:1, 8:0, 9:0, 10:0, 11:0, 12:0, 13:1, 14:0, 15:2, 16:2, 17:1, 18:0, 19:0, 20:0, 21:0, 22:1, 23:2, 24:2, 25:1, 26:0, 27:0, 28:0, 29:0, 30:0, 31:1, 32:0, 33:2, 34:2, 35:1, 36:0, 37:0, 38:0, 39:0, 40:1, 41:2, 42:2, 43:1, 44:0},  # Mia
    14: {1:0, 2:0, 3:0, 4:0, 5:1, 6:2, 7:2, 8:1, 9:0, 10:0, 11:0, 12:0, 13:0, 14:0, 15:1, 16:2, 17:2, 18:1, 19:0, 20:0, 21:0, 22:0, 23:1, 24:2, 25:2, 26:1, 27:0, 28:0, 29:0, 30:0, 31:0, 32:0, 33:1, 34:2, 35:2, 36:1, 37:0, 38:0, 39:0, 40:0, 41:1, 42:2, 43:2, 44:1},  # Nathan
    15: {1:1, 2:2, 3:2, 4:1, 5:0, 6:0, 7:0, 8:0, 9:1, 10:2, 11:0, 12:2, 13:1, 14:0, 15:0, 16:0, 17:0, 18:0, 19:1, 20:2, 21:2, 22:1, 23:0, 24:0, 25:0, 26:0, 27:1, 28:2, 29:0, 30:2, 31:1, 32:0, 33:0, 34:0, 35:0, 36:0, 37:1, 38:2, 39:2, 40:1, 41:0, 42:0, 43:0, 44:0},  # Olivia
    16: {1:0, 2:1, 3:2, 4:2, 5:1, 6:1, 7:0, 8:0, 9:0, 10:1, 11:0, 12:2, 13:2, 14:0, 15:1, 16:1, 17:0, 18:0, 19:0, 20:1, 21:2, 22:2, 23:1, 24:0, 25:0, 26:0, 27:0, 28:1, 29:0, 30:2, 31:2, 32:0, 33:1, 34:1, 35:0, 36:0, 37:0, 38:1, 39:2, 40:2, 41:1, 42:0, 43:0, 44:0},  # Pete
    17: {1:0, 2:0, 3:1, 4:1, 5:2, 6:2, 7:1, 8:0, 9:0, 10:0, 11:0, 12:1, 13:1, 14:0, 15:2, 16:2, 17:1, 18:0, 19:0, 20:0, 21:1, 22:1, 23:2, 24:2, 25:0, 26:0, 27:0, 28:0, 29:0, 30:1, 31:1, 32:0, 33:2, 34:2, 35:1, 36:0, 37:0, 38:0, 39:1, 40:1, 41:2, 42:2, 43:0, 44:0},  # Quinn
    18: {1:0, 2:0, 3:0, 4:1, 5:2, 6:2, 7:2, 8:1, 9:0, 10:0, 11:0, 12:0, 13:1, 14:0, 15:2, 16:2, 17:2, 18:1, 19:0, 20:0, 21:0, 22:1, 23:2, 24:2, 25:1, 26:0, 27:0, 28:0, 29:0, 30:0, 31:1, 32:0, 33:2, 34:2, 35:2, 36:1, 37:0, 38:0, 39:0, 40:1, 41:1, 42:2, 43:1, 44:0},  # Rachel
    19: {1:0, 2:0, 3:0, 4:0, 5:0, 6:1, 7:2, 8:2, 9:0, 10:0, 11:0, 12:0, 13:0, 14:0, 15:0, 16:1, 17:2, 18:2, 19:0, 20:0, 21:0, 22:0, 23:0, 24:1, 25:2, 26:2, 27:0, 28:0, 29:0, 30:0, 31:0, 32:0, 33:0, 34:1, 35:2, 36:2, 37:0, 38:0, 39:0, 40:0, 41:0, 42:1, 43:2, 44:2},  # Sam
    20: {1:2, 2:2, 3:1, 4:0, 5:0, 6:0, 7:0, 8:0, 9:2, 10:2, 11:0, 12:1, 13:0, 14:0, 15:0, 16:0, 17:0, 18:0, 19:2, 20:2, 21:1, 22:0, 23:0, 24:0, 25:0, 26:0, 27:2, 28:2, 29:0, 30:1, 31:0, 32:0, 33:0, 34:0, 35:0, 36:0, 37:2, 38:2, 39:1, 40:0, 41:0, 42:0, 43:0, 44:0},  # Tina
    21: {1:1, 2:2, 3:2, 4:1, 5:0, 6:0, 7:0, 8:0, 9:1, 10:2, 11:0, 12:2, 13:1, 14:0, 15:0, 16:0, 17:0, 18:0, 19:1, 20:2, 21:2, 22:1, 23:0, 24:0, 25:0, 26:0, 27:1, 28:2, 29:0, 30:2, 31:1, 32:0, 33:0, 34:0, 35:0, 36:0, 37:1, 38:2, 39:2, 40:1, 41:0, 42:0, 43:0, 44:0},  # Uma
    22: {1:0, 2:0, 3:1, 4:2, 5:2, 6:1, 7:0, 8:0, 9:0, 10:0, 11:0, 12:2, 13:2, 14:0, 15:1, 16:0, 17:0, 18:0, 19:0, 20:0, 21:1, 22:2, 23:2, 24:1, 25:0, 26:0, 27:0, 28:0, 29:0, 30:2, 31:2, 32:0, 33:1, 34:0, 35:0, 36:0, 37:0, 38:0, 39:1, 40:2, 41:2, 42:1, 43:0, 44:0},  # Victor
    23: {1:0, 2:0, 3:0, 4:1, 5:2, 6:2, 7:1, 8:0, 9:0, 10:0, 11:0, 12:0, 13:1, 14:0, 15:2, 16:2, 17:1, 18:0, 19:0, 20:0, 21:0, 22:1, 23:2, 24:2, 25:1, 26:0, 27:0, 28:0, 29:0, 30:0, 31:1, 32:0, 33:2, 34:2, 35:1, 36:0, 37:0, 38:0, 39:0, 40:1, 41:2, 42:2, 43:0, 44:0},  # Wendy
    24: {1:0, 2:0, 3:0, 4:0, 5:1, 6:1, 7:2, 8:2, 9:0, 10:0, 11:0, 12:0, 13:0, 14:0, 15:1, 16:1, 17:2, 18:2, 19:0, 20:0, 21:0, 22:0, 23:1, 24:1, 25:2, 26:2, 27:0, 28:0, 29:0, 30:0, 31:0, 32:0, 33:1, 34:1, 35:2, 36:2, 37:0, 38:0, 39:0, 40:0, 41:1, 42:1, 43:2, 44:2},  # Xavier
    25: {1:0, 2:0, 3:0, 4:0, 5:0, 6:1, 7:2, 8:2, 9:0, 10:0, 11:0, 12:0, 13:0, 14:0, 15:0, 16:1, 17:2, 18:2, 19:0, 20:0, 21:0, 22:0, 23:0, 24:1, 25:2, 26:2, 27:0, 28:0, 29:0, 30:0, 31:0, 32:0, 33:0, 34:1, 35:2, 36:2, 37:0, 38:0, 39:0, 40:0, 41:0, 42:0, 43:2, 44:2},  # Yara
}