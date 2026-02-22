from context import SchedulerContext
from realistic_dummy_data import ta_metadata, shift_metadata, preference_matrix
from data_access import get_pref, shift_duration_hours

ctx = SchedulerContext(ta_metadata, shift_metadata, preference_matrix)

print("=" * 60)
print("LAB SHIFT COVERAGE DIAGNOSTIC")
print("=" * 60)

lab_shifts = [s for s in ctx.shift_metadata if s["is_lab"]]

total_leads_needed  = sum(s["staffing"][2] for s in lab_shifts)
total_lab_tas_needed = sum(s["staffing"][1] for s in lab_shifts)
status3_tas = [ta for ta in ctx.ta_metadata if ta["lab_admin_status"] >= 3]
status2_tas = [ta for ta in ctx.ta_metadata if ta["lab_admin_status"] >= 2]

print(f"\nTotal lead slots needed:   {total_leads_needed}")
print(f"Total lab TA slots needed: {total_lab_tas_needed}")
print(f"Status 3 TAs available:    {len(status3_tas)}")
print(f"Status 2+ TAs available:   {len(status2_tas)}")

print("\n--- LEAD COVERAGE PER SHIFT ---")
for shift in lab_shifts:
    eligible_leads = [
        ta for ta in status3_tas
        if get_pref(ctx, ta["ta_id"], shift["shift_id"]) > 0
    ]
    slots = shift["staffing"][2]
    status = "OK" if len(eligible_leads) >= slots else f"PROBLEM — need {slots}, only {len(eligible_leads)} available"
    print(f"  {shift['name']:22} needs {slots} lead(s)  | eligible: {[ta['name'] for ta in eligible_leads]} [{status}]")

print("\n--- LAB TA COVERAGE PER SHIFT ---")
for shift in lab_shifts:
    eligible_lab_tas = [
        ta for ta in status2_tas
        if get_pref(ctx, ta["ta_id"], shift["shift_id"]) > 0
    ]
    slots = shift["staffing"][1]
    status = "OK" if len(eligible_lab_tas) >= slots else f"PROBLEM — need {slots}, only {len(eligible_lab_tas)} available"
    print(f"  {shift['name']:22} needs {slots} lab TA(s) | eligible: {[ta['name'] for ta in eligible_lab_tas]} [{status}]")

print("\n--- ONE-LAB-PER-TA CONFLICT CHECK ---")
print("(Are any TAs the sole lead/lab_ta option for multiple overlapping shifts?)")
from data_access import get_shift
for ta in status3_tas:
    available_labs = [
        s for s in lab_shifts
        if get_pref(ctx, ta["ta_id"], s["shift_id"]) > 0
    ]
    if len(available_labs) > 1:
        print(f"  {ta['name']:12} available for {len(available_labs)} labs: {[s['name'] for s in available_labs]}")