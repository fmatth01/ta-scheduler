import requests
from data.parsers import *

BASE_URL = "http://localhost:3000"

def fetch_schedule():
    response = requests.get(f"{BASE_URL}/schedule/importDataToAlg")
    response.raise_for_status()
    print(f"Status: {response.status_code}")
    print(f"Body: {response.text}")
    data = response.json()
    return data["tas"], data["schedule"]

def fetch_shifts(raw_schedule):
    return parse_shifts(raw_schedule)

def post_schedule(schedule_id, payload):
    response = requests.put(f"{BASE_URL}/schedule/update", json={
        "schedule_id": schedule_id,
        "schedule": payload
    })
    response.raise_for_status()
    return response.json()