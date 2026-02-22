from datetime import time
from data.context import Day

ta_metadata = [
    # Status 3 — Lab leads (10 TAs — enough to cover all lead slots)
    {"ta_id":  1, "name": "Elisa",    "experienced": True,  "lab_admin_status": 3, "min_hours": 2, "max_hours": 6, "is_tf": False,  "companions": [10]},
    {"ta_id":  2, "name": "John",     "experienced": True,  "lab_admin_status": 3, "min_hours": 2, "max_hours": 6, "is_tf": True,  "companions": [14]},
    {"ta_id":  3, "name": "Eleanor",  "experienced": True,  "lab_admin_status": 3, "min_hours": 2, "max_hours": 6, "is_tf": True,  "companions": [1]},
    {"ta_id":  4, "name": "Andrea",   "experienced": True,  "lab_admin_status": 3, "min_hours": 2, "max_hours": 6, "is_tf": False,  "companions": [3]},
    {"ta_id":  5, "name": "Yoda",     "experienced": True,  "lab_admin_status": 3, "min_hours": 2, "max_hours": 6, "is_tf": True, "companions": [2]},
    {"ta_id":  6, "name": "Lindsay",  "experienced": True,  "lab_admin_status": 3, "min_hours": 2, "max_hours": 6, "is_tf": True, "companions": [8]},
    {"ta_id":  7, "name": "Finn",     "experienced": True,  "lab_admin_status": 3, "min_hours": 2, "max_hours": 6, "is_tf": False, "companions": [13]},
    {"ta_id":  8, "name": "Andre",    "experienced": True,  "lab_admin_status": 3, "min_hours": 2, "max_hours": 6, "is_tf": False, "companions": [6]},
    {"ta_id":  9, "name": "Tomas",    "experienced": True,  "lab_admin_status": 3, "min_hours": 2, "max_hours": 6, "is_tf": False, "companions": [15]},
    {"ta_id": 10, "name": "Umair",    "experienced": True,  "lab_admin_status": 3, "min_hours": 2, "max_hours": 6, "is_tf": False, "companions": [1]},

    # Status 2 — Lab TAs (7 TAs)
    {"ta_id": 11, "name": "Tien",     "experienced": False, "lab_admin_status": 2, "min_hours": 2, "max_hours": 6, "is_tf": False, "companions": [17]},
    {"ta_id": 12, "name": "Nahuel",   "experienced": False, "lab_admin_status": 2, "min_hours": 2, "max_hours": 6, "is_tf": False, "companions": [20]},
    {"ta_id": 13, "name": "Sophie",   "experienced": False, "lab_admin_status": 2, "min_hours": 2, "max_hours": 6, "is_tf": False, "companions": [7]},
    {"ta_id": 14, "name": "Nicolas",  "experienced": False, "lab_admin_status": 2, "min_hours": 2, "max_hours": 6, "is_tf": False, "companions": [2]},
    {"ta_id": 15, "name": "Andrew",   "experienced": False, "lab_admin_status": 2, "min_hours": 2, "max_hours": 6, "is_tf": False, "companions": [9]},
    {"ta_id": 16, "name": "Bonu",     "experienced": False, "lab_admin_status": 2, "min_hours": 2, "max_hours": 6, "is_tf": False, "companions": [19]},
    {"ta_id": 17, "name": "Kene",     "experienced": False, "lab_admin_status": 2, "min_hours": 2, "max_hours": 6, "is_tf": False, "companions": [11]},

    # Status 1 — OH only (4 TAs)
    {"ta_id": 18, "name": "Claire",   "experienced": False, "lab_admin_status": 1, "min_hours": 2, "max_hours": 6, "is_tf": False, "companions": [19]},
    {"ta_id": 19, "name": "Geneva",   "experienced": False, "lab_admin_status": 1, "min_hours": 2, "max_hours": 6, "is_tf": False, "companions": [18]},
    {"ta_id": 20, "name": "Aryaa",    "experienced": False, "lab_admin_status": 1, "min_hours": 2, "max_hours": 6, "is_tf": False, "companions": [12]},
    {"ta_id": 21, "name": "Andersen", "experienced": False, "lab_admin_status": 1, "min_hours": 2, "max_hours": 6, "is_tf": False, "companions": []},
]

shift_metadata = [
    # MONDAY — 5 OH shifts
    {"shift_id":  1, "name": "Mon 12:00 OH",  "day": Day.MONDAY,    "start": time(12,  0), "end": time(13, 15), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id":  2, "name": "Mon 13:30 OH",  "day": Day.MONDAY,    "start": time(13, 30), "end": time(14, 45), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id":  3, "name": "Mon 16:30 OH",  "day": Day.MONDAY,    "start": time(16, 30), "end": time(17, 45), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id":  4, "name": "Mon 18:00 OH",  "day": Day.MONDAY,    "start": time(18,  0), "end": time(19, 15), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id":  5, "name": "Mon 19:30 OH",  "day": Day.MONDAY,    "start": time(19, 30), "end": time(20, 45), "is_lab": False, "staffing": (2, 0, 0)},

    # TUESDAY — 6 labs + overlapping OH + other OH
    {"shift_id":  6, "name": "Tue 9:00 Lab",  "day": Day.TUESDAY,   "start": time( 9,  0), "end": time(10, 15), "is_lab": True,  "staffing": (0, 1, 1)},
    {"shift_id":  7, "name": "Tue 10:30 Lab", "day": Day.TUESDAY,   "start": time(10, 30), "end": time(11, 45), "is_lab": True,  "staffing": (0, 1, 1)},
    {"shift_id":  8, "name": "Tue 10:30 OH",  "day": Day.TUESDAY,   "start": time(10, 30), "end": time(11, 45), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id":  9, "name": "Tue 12:00 OH",  "day": Day.TUESDAY,   "start": time(12,  0), "end": time(13, 15), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 10, "name": "Tue 13:30 Lab", "day": Day.TUESDAY,   "start": time(13, 30), "end": time(14, 45), "is_lab": True,  "staffing": (0, 2, 2)},
    {"shift_id": 11, "name": "Tue 15:00 Lab", "day": Day.TUESDAY,   "start": time(15,  0), "end": time(16, 15), "is_lab": True,  "staffing": (0, 2, 2)},
    {"shift_id": 12, "name": "Tue 15:00 OH",  "day": Day.TUESDAY,   "start": time(15,  0), "end": time(16, 15), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 13, "name": "Tue 16:30 Lab", "day": Day.TUESDAY,   "start": time(16, 30), "end": time(17, 45), "is_lab": True,  "staffing": (0, 1, 1)},
    {"shift_id": 14, "name": "Tue 18:00 Lab", "day": Day.TUESDAY,   "start": time(18,  0), "end": time(19, 15), "is_lab": True,  "staffing": (0, 1, 1)},
    {"shift_id": 15, "name": "Tue 18:00 OH",  "day": Day.TUESDAY,   "start": time(18,  0), "end": time(19, 15), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 16, "name": "Tue 19:30 OH",  "day": Day.TUESDAY,   "start": time(19, 30), "end": time(20, 45), "is_lab": False, "staffing": (2, 0, 0)},

    # WEDNESDAY — 4 OH shifts
    {"shift_id": 17, "name": "Wed 12:00 OH",  "day": Day.WEDNESDAY, "start": time(12,  0), "end": time(13, 15), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 18, "name": "Wed 13:30 OH",  "day": Day.WEDNESDAY, "start": time(13, 30), "end": time(14, 45), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 19, "name": "Wed 18:00 OH",  "day": Day.WEDNESDAY, "start": time(18,  0), "end": time(19, 15), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 20, "name": "Wed 19:30 OH",  "day": Day.WEDNESDAY, "start": time(19, 30), "end": time(20, 45), "is_lab": False, "staffing": (2, 0, 0)},

    # THURSDAY — 4 OH shifts
    {"shift_id": 21, "name": "Thu 12:00 OH",  "day": Day.THURSDAY,  "start": time(12,  0), "end": time(13, 15), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 22, "name": "Thu 15:00 OH",  "day": Day.THURSDAY,  "start": time(15,  0), "end": time(16, 15), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 23, "name": "Thu 16:30 OH",  "day": Day.THURSDAY,  "start": time(16, 30), "end": time(17, 45), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 24, "name": "Thu 18:00 OH",  "day": Day.THURSDAY,  "start": time(18,  0), "end": time(19, 15), "is_lab": False, "staffing": (2, 0, 0)},

    # FRIDAY — 2 OH shifts
    {"shift_id": 25, "name": "Fri 10:30 OH",  "day": Day.FRIDAY,    "start": time(10, 30), "end": time(11, 45), "is_lab": False, "staffing": (2, 0, 0)},
    {"shift_id": 26, "name": "Fri 12:00 OH",  "day": Day.FRIDAY,    "start": time(12,  0), "end": time(13, 15), "is_lab": False, "staffing": (2, 0, 0)},

    # SUNDAY — 3 OH shifts (single TA each)
    {"shift_id": 27, "name": "Sun 12:00 OH",  "day": Day.SUNDAY,    "start": time(12,  0), "end": time(13, 15), "is_lab": False, "staffing": (1, 0, 0)},
    {"shift_id": 28, "name": "Sun 13:30 OH",  "day": Day.SUNDAY,    "start": time(13, 30), "end": time(14, 45), "is_lab": False, "staffing": (1, 0, 0)},
    {"shift_id": 29, "name": "Sun 15:00 OH",  "day": Day.SUNDAY,    "start": time(15,  0), "end": time(16, 15), "is_lab": False, "staffing": (1, 0, 0)},
]

preference_matrix = {
    #        Mon                   Tue (labs + OH)                                               Wed              Thu                  Fri     Sun
    #        s1  s2  s3  s4  s5   s6  s7  s8  s9  s10 s11 s12 s13 s14 s15 s16  s17 s18 s19 s20  s21 s22 s23 s24  s25 s26  s27 s28 s29
    1:  {1:1, 2:1, 3:0, 4:0, 5:0,  6:2, 7:2, 8:1, 9:1, 10:1, 11:1, 12:0, 13:0, 14:0, 15:0, 16:0,  17:1, 18:2, 19:0, 20:0,  21:1, 22:0, 23:0, 24:0,  25:1, 26:1,  27:2, 28:1, 29:0},  # Elisa
    2:  {1:1, 2:1, 3:0, 4:2, 5:1,  6:1, 7:2, 8:1, 9:1, 10:1, 11:1, 12:0, 13:1, 14:1, 15:2, 16:0,  17:0, 18:1, 19:0, 20:0,  21:1, 22:2, 23:1, 24:0,  25:1, 26:0,  27:0, 28:1, 29:0},  # John
    3:  {1:0, 2:1, 3:1, 4:0, 5:0,  6:1, 7:1, 8:0, 9:1, 10:2, 11:2, 12:1, 13:1, 14:0, 15:0, 16:0,  17:1, 18:2, 19:1, 20:0,  21:1, 22:1, 23:0, 24:0,  25:0, 26:1,  27:0, 28:0, 29:1},  # Eleanor
    4:  {1:0, 2:0, 3:1, 4:1, 5:0,  6:0, 7:1, 8:1, 9:1, 10:1, 11:2, 12:1, 13:1, 14:1, 15:1, 16:0,  17:1, 18:1, 19:2, 20:1,  21:1, 22:1, 23:0, 24:0,  25:0, 26:0,  27:0, 28:0, 29:2},  # Andrea
    5:  {1:2, 2:1, 3:1, 4:0, 5:0,  6:1, 7:1, 8:1, 9:1, 10:1, 11:1, 12:1, 13:2, 14:1, 15:0, 16:0,  17:1, 18:0, 19:0, 20:0,  21:1, 22:1, 23:2, 24:1,  25:1, 26:0,  27:0, 28:0, 29:0},  # Yoda
    6:  {1:0, 2:0, 3:1, 4:1, 5:2,  6:1, 7:1, 8:0, 9:0, 10:1, 11:1, 12:1, 13:1, 14:2, 15:1, 16:1,  17:0, 18:0, 19:1, 20:2,  21:0, 22:1, 23:1, 24:1,  25:0, 26:0,  27:0, 28:2, 29:1},  # Lindsay
    7:  {1:0, 2:0, 3:2, 4:1, 5:0,  6:1, 7:1, 8:1, 9:0, 10:2, 11:1, 12:1, 13:1, 14:0, 15:0, 16:0,  17:1, 18:1, 19:0, 20:0,  21:0, 22:1, 23:1, 24:2,  25:1, 26:0,  27:0, 28:0, 29:0},  # Fin
    8:  {1:1, 2:0, 3:2, 4:1, 5:0,  6:2, 7:1, 8:0, 9:1, 10:1, 11:2, 12:2, 13:1, 14:1, 15:0, 16:0,  17:1, 18:0, 19:0, 20:0,  21:1, 22:2, 23:1, 24:0,  25:0, 26:1,  27:0, 28:0, 29:0},  # Andre
    9:  {1:2, 2:2, 3:1, 4:0, 5:0,  6:1, 7:2, 8:1, 9:1, 10:1, 11:1, 12:0, 13:1, 14:1, 15:2, 16:0,  17:1, 18:0, 19:0, 20:0,  21:1, 22:0, 23:0, 24:0,  25:2, 26:1,  27:0, 28:0, 29:0},  # Tomas
    10: {1:2, 2:1, 3:0, 4:0, 5:0,  6:1, 7:1, 8:1, 9:1, 10:2, 11:1, 12:1, 13:1, 14:0, 15:0, 16:0,  17:1, 18:2, 19:0, 20:0,  21:1, 22:0, 23:0, 24:0,  25:2, 26:1,  27:0, 28:0, 29:0},  # Umair
    11: {1:0, 2:1, 3:1, 4:0, 5:0,  6:1, 7:1, 8:0, 9:0, 10:2, 11:1, 12:1, 13:0, 14:0, 15:0, 16:0,  17:0, 18:1, 19:2, 20:1,  21:1, 22:0, 23:0, 24:0,  25:0, 26:1,  27:0, 28:0, 29:0},  # Tien
    12: {1:0, 2:0, 3:1, 4:1, 5:1,  6:0, 7:0, 8:1, 9:1, 10:1, 11:2, 12:1, 13:1, 14:1, 15:0, 16:2,  17:1, 18:0, 19:0, 20:1,  21:1, 22:0, 23:0, 24:0,  25:0, 26:2,  27:0, 28:0, 29:0},  # Nahuel
    13: {1:0, 2:0, 3:0, 4:1, 5:1,  6:0, 7:1, 8:1, 9:1, 10:1, 11:2, 12:1, 13:1, 14:0, 15:0, 16:2,  17:0, 18:1, 19:1, 20:1,  21:2, 22:1, 23:0, 24:0,  25:0, 26:0,  27:0, 28:0, 29:0},  # Sophie
    14: {1:0, 2:0, 3:1, 4:1, 5:0,  6:0, 7:1, 8:0, 9:1, 10:1, 11:1, 12:0, 13:2, 14:1, 15:2, 16:0,  17:0, 18:1, 19:0, 20:0,  21:0, 22:1, 23:1, 24:0,  25:1, 26:0,  27:0, 28:0, 29:0},  # Nicolas
    15: {1:0, 2:0, 3:1, 4:2, 5:1,  6:0, 7:1, 8:0, 9:0, 10:1, 11:1, 12:0, 13:1, 14:2, 15:0, 16:0,  17:0, 18:1, 19:2, 20:1,  21:0, 22:1, 23:0, 24:2,  25:0, 26:0,  27:0, 28:0, 29:0},  # Andrew
    16: {1:2, 2:2, 3:1, 4:0, 5:0,  6:1, 7:1, 8:1, 9:1, 10:1, 11:1, 12:0, 13:0, 14:0, 15:0, 16:0,  17:2, 18:1, 19:0, 20:0,  21:1, 22:0, 23:0, 24:0,  25:2, 26:1,  27:0, 28:0, 29:0},  # Bonu
    17: {1:0, 2:1, 3:2, 4:1, 5:2,  6:0, 7:0, 8:1, 9:1, 10:0, 11:1, 12:1, 13:0, 14:0, 15:0, 16:0,  17:2, 18:1, 19:0, 20:0,  21:0, 22:1, 23:2, 24:1,  25:0, 26:0,  27:0, 28:0, 29:0},  # Kene
    18: {1:1, 2:1, 3:0, 4:0, 5:0,  6:0, 7:0, 8:2, 9:1, 10:0, 11:0, 12:0, 13:0, 14:0, 15:0, 16:0,  17:0, 18:1, 19:0, 20:0,  21:2, 22:1, 23:0, 24:0,  25:1, 26:2,  27:0, 28:0, 29:0},  # Claire
    19: {1:1, 2:0, 3:0, 4:0, 5:0,  6:0, 7:0, 8:2, 9:2, 10:0, 11:0, 12:1, 13:0, 14:0, 15:0, 16:0,  17:1, 18:0, 19:0, 20:0,  21:2, 22:1, 23:0, 24:0,  25:0, 26:1,  27:0, 28:0, 29:0},  # Geneva
    20: {1:0, 2:0, 3:0, 4:1, 5:1,  6:0, 7:0, 8:0, 9:2, 10:0, 11:0, 12:1, 13:0, 14:0, 15:0, 16:2,  17:0, 18:0, 19:0, 20:2,  21:0, 22:0, 23:0, 24:0,  25:0, 26:0,  27:0, 28:0, 29:0},  # Aryaa
    21: {1:0, 2:0, 3:1, 4:1, 5:0,  6:0, 7:0, 8:1, 9:0, 10:0, 11:0, 12:2, 13:0, 14:0, 15:1, 16:0,  17:0, 18:0, 19:0, 20:0,  21:0, 22:2, 23:1, 24:0,  25:0, 26:0,  27:0, 28:0, 29:0},  # Andersen
}