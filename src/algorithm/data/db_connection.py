import requests
from parsers import *

BASE_URL = "https://ta-scheduler.vercel.app"

def fetch_schedule(schedule_id):
    response = requests.get(f"{BASE_URL}/schedule/getSchedule", params={"schedule_id": schedule_id})
    response.raise_for_status()
    return response.json()

def fetch_tas():
    response = requests.get(f"{BASE_URL}/ta/getTAs")
    response.raise_for_status()
    return response.json()

def fetch_shifts(schedule_id):
    raw_schedule = fetch_schedule(schedule_id)
    return parse_shifts(raw_schedule)

def fetch_preferences():
    response = requests.get(f"{BASE_URL}/preference/getPreferences")
    response.raise_for_status()
    return response.json()

def post_schedule(schedule_id, payload):
    response = requests.put(f"{BASE_URL}/schedule/update", json={
        "schedule_id": schedule_id,
        "schedule": payload
    })
    response.raise_for_status()
    return response.json()