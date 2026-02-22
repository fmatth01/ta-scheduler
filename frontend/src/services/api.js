/**
 * API service layer.
 * Functions call the backend via the apiCall utility.
 */

import { apiCall } from '../utils/general';

// --- Helpers (internal) ---

function splitName(fullName) {
  const trimmed = (fullName || '').trim();
  if (!trimmed) return { first_name: 'N/A', last_name: 'N/A' };
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return { first_name: parts[0], last_name: 'N/A' };
  return { first_name: parts[0], last_name: parts.slice(1).join(' ') };
}

function labPermFromPreferences(labLead, labAssistant) {
  if (labLead) return 2;
  if (labAssistant) return 1;
  return 0;
}

const FRONTEND_TO_BACKEND_DAY = {
  Mon: 'monday',
  Tue: 'tuesday',
  Wed: 'wednesday',
  Thu: 'thursday',
  Fri: 'friday',
  Sat: 'saturday',
  Sun: 'sunday',
};

const BACKEND_DAY_TO_FRONTEND = Object.fromEntries(
  Object.entries(FRONTEND_TO_BACKEND_DAY).map(([fe, be]) => [be, fe])
);

// --- Auth ---

export async function loginTA(utln, classCode) {
  // TODO: POST /api/auth/login { role: 'ta', utln, classCode }
  // classCode is an array of 5 emoji strings
  // Should return: { name: string, isFirstTime: boolean }
  return new Promise((resolve) => setTimeout(() => resolve({}), 500));
}

export async function loginTF(utln, classCode) {
  // TODO: POST /api/auth/login { role: 'tf', utln, classCode }
  // classCode is an array of 5 emoji strings
  // Should return: { name: string }
  return new Promise((resolve) => setTimeout(() => resolve({}), 500));
}

export async function generateClassCode() {
  // TODO: POST /api/class/generate
  // Should return: { classCode: ['emoji1', 'emoji2', 'emoji3', 'emoji4', 'emoji5'] }
  return new Promise((resolve) => setTimeout(() => resolve({}), 500));
}

// --- TA ---

export async function submitAvailability(utln, availability, preferences, fullName) {
  const { first_name, last_name } = splitName(fullName);
  const lab_perm = labPermFromPreferences(preferences.labLead, preferences.labAssistant);

  const result = await apiCall('/ta/create', 'POST', {
    ta_id: utln,
    first_name,
    last_name,
    is_tf: false,
    lab_perm,
  }, null);

  // TODO: Future work — submit availability preferences once backend endpoint exists.
  // Availability format will be "day:hh:mm-hh:mm:x" where x is 0/1/2.

  return result;
}

export async function getTASchedule(utln) {
  // TODO: GET /api/ta/schedule?utln={utln}
  // Should return: { shifts: [...], weekRange: 'MM/DD - MM/DD' }
  // Each shift: { id, day, startTime, endTime, type: 'oh'|'lab', assignedTAs: [{ utln, name }] }
  return new Promise((resolve) => setTimeout(() => resolve({}), 500));
}

// --- TF ---

export async function generateTemplate(config) {
  // TODO: POST /api/tf/generate-template { config }
  // config: { earliestStart, latestEnd, slotDuration, tasPerShift, approvedTFs }
  // Should return: { templateSlots: { 'Mon-09:00': 'oh', ... } }
  return new Promise((resolve) => setTimeout(() => resolve({}), 500));
}

export async function publishSchedule(templateSlots, config, tfUtln, tfFullName) {
  // Step 1: Register current TF
  const { first_name, last_name } = splitName(tfFullName);
  await apiCall('/ta/create', 'POST', {
    ta_id: tfUtln,
    first_name,
    last_name,
    is_tf: true,
    lab_perm: 2,
  }, null);

  // Step 2: Register each approved TF (parallel)
  const approvedTFPromises = (config.approvedTFs || []).map((utln) =>
    apiCall('/ta/create', 'POST', {
      ta_id: utln,
      first_name: 'N/A',
      last_name: 'N/A',
      is_tf: true,
      lab_perm: 2,
    }, null)
  );
  await Promise.all(approvedTFPromises);

  // Step 3: Initialize schedule
  // "00:00" means midnight but backend's timeToMinutes("00:00") = 0, making end <= start.
  const endTime = config.latestEnd === '00:00' ? '23:59' : config.latestEnd;

  const scheduleResult = await apiCall('/schedule/initSchedule', 'POST', {
    start_interval_time: config.earliestStart,
    end_interval_time: endTime,
    shift_duration: config.slotDuration,
    staffing_capacity: [0, config.tasPerShift],
  }, null);

  // Step 4: Mark lab slots as is_lab=true in the returned schedule.
  // Each day's array contains JSON strings of shift objects from the backend.
  const schedule = JSON.parse(JSON.stringify(scheduleResult));

  const labSlotSet = new Set();
  for (const [key, value] of Object.entries(templateSlots)) {
    if (value === 'lab') {
      labSlotSet.add(key);
    }
  }

  for (const [backendDay, shifts] of Object.entries(schedule)) {
    if (backendDay === 'schedule_id' || backendDay === '_id') continue;
    if (!Array.isArray(shifts)) continue;

    const frontendDay = BACKEND_DAY_TO_FRONTEND[backendDay];
    if (!frontendDay) continue;

    for (let i = 0; i < shifts.length; i++) {
      let shift = typeof shifts[i] === 'string' ? JSON.parse(shifts[i]) : shifts[i];
      const slotKey = `${frontendDay}-${shift.start_time}`;
      if (labSlotSet.has(slotKey)) {
        shift.is_lab = true;
      }
      shifts[i] = typeof scheduleResult[backendDay][i] === 'string'
        ? JSON.stringify(shift)
        : shift;
    }
  }

  // Step 5: Update the schedule with lab info
  await apiCall('/schedule/update', 'PUT', {
    schedule_id: schedule.schedule_id,
    schedule,
  }, null);

  return { success: true, schedule };
}

export async function getTFSchedule() {
  // TODO: GET /api/tf/schedule
  // Should return: { shifts: [...], weekRange: 'MM/DD - MM/DD', tas: [{ utln, name }] }
  return new Promise((resolve) => setTimeout(() => resolve({}), 500));
}

// --- Utilities ---

export async function copyScheduleAsText(scheduleOrText) {
  // Accept prebuilt text (string) or schedule objects.
  // TODO: if schedule object is passed, format it once backend contract is finalized.
  const text = typeof scheduleOrText === 'string'
    ? scheduleOrText
    : 'Schedule text format TBD';
  await navigator.clipboard.writeText(text);
  return text;
}
