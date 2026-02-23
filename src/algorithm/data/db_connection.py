import requests
from data.parsers import *

BASE_URL = "http://localhost:3000"

def fetch_schedule():
    """
    Fetch TAs and the latest schedule from the backend.
    Returns (tas_list, schedule_dict, schedule_id).
    """
    print("\n" + "="*60)
    print("[DB_CONNECTION] Fetching data from backend...")
    print(f"[DB_CONNECTION] GET {BASE_URL}/schedule/importDataToAlg")
    print("="*60)

    response = requests.get(f"{BASE_URL}/schedule/importDataToAlg")
    response.raise_for_status()

    print(f"[DB_CONNECTION] Response status: {response.status_code}")

    data = response.json()
    tas = data["tas"]
    schedule = data["schedule"]
    schedule_id = schedule.get("schedule_id")

    print(f"[DB_CONNECTION] Fetched schedule_id: {schedule_id}")
    print(f"[DB_CONNECTION] Number of TAs returned: {len(tas)}")
    print(f"[DB_CONNECTION] Schedule keys: {list(schedule.keys())}")

    # Log TA summary
    for ta in tas:
        pref_count = len(ta.get("preferences", []))
        print(f"[DB_CONNECTION]   TA '{ta['ta_id']}' (lab_perm={ta.get('lab_perm')}, is_tf={ta.get('is_tf')}, prefs={pref_count})")

    # Log shift counts per day
    day_names = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    for day in day_names:
        shifts = schedule.get(day, [])
        if shifts:
            lab_count = sum(1 for s in shifts if s.get("is_lab"))
            oh_count = sum(1 for s in shifts if not s.get("is_lab") and not s.get("is_empty"))
            empty_count = sum(1 for s in shifts if s.get("is_empty"))
            print(f"[DB_CONNECTION]   {day}: {len(shifts)} shifts (lab={lab_count}, oh={oh_count}, empty={empty_count})")

    return tas, schedule, schedule_id

def fetch_shifts(raw_schedule):
    return parse_shifts(raw_schedule)

# def post_schedule(schedule_id, payload):
#     response = requests.put(f"{BASE_URL}/schedule/update", json={
#         "schedule_id": schedule_id,
#         "schedule": payload
#     })
#     response.raise_for_status()
#     return response.json()

def post_schedule(schedule_id, payload):
    """
    POST the filled schedule back to MongoDB via the backend.
    """
    print("\n" + "="*60)
    print(f"[DB_CONNECTION] Posting schedule to DB...")
    print(f"[DB_CONNECTION] PUT {BASE_URL}/schedule/update")
    print(f"[DB_CONNECTION] Writing to schedule_id: {schedule_id}")
    print("="*60)

    # Log what we're sending
    day_names = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    for day in day_names:
        shifts = payload.get(day, [])
        if shifts:
            for s in shifts:
                tas_count = len(s.get("tas_scheduled", []))
                ta_names = [t.get("name", t.get("ta_id", "?")) for t in s.get("tas_scheduled", [])]
                print(f"[DB_CONNECTION]   {day} {s.get('start_time')}-{s.get('end_time')} "
                      f"(lab={s.get('is_lab')}, empty={s.get('is_empty')}): "
                      f"{tas_count} TAs assigned {ta_names}")

    response = requests.put(f"{BASE_URL}/schedule/update", json={
        "schedule_id": schedule_id,
        "schedule": payload
    })
    response.raise_for_status()

    result = response.json()
    print(f"[DB_CONNECTION] Update response: {result}")
    return result
