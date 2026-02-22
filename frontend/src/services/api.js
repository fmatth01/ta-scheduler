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

const FRONTEND_TO_PREF_DAY = {
  Mon: 'm',
  Tue: 'tu',
  Wed: 'w',
  Thu: 'th',
  Fri: 'f',
  Sat: 'sa',
  Sun: 'su',
};

const PREF_DAYS_IN_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function parseTimeToMinutes(timeStr) {
  const [hourStr, minuteStr] = (timeStr || '').split(':');
  const hours = Number(hourStr);
  const minutes = Number(minuteStr);

  if (!Number.isInteger(hours) || !Number.isInteger(minutes) || hours < 0 || hours > 24 || minutes < 0 || minutes > 59) {
    throw new Error(`Invalid time string: ${timeStr}`);
  }
  if (hours === 24 && minutes !== 0) {
    throw new Error(`Invalid time string: ${timeStr}`);
  }

  return (hours * 60) + minutes;
}

function formatMinutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function availabilityValueToPreference(value) {
  if (value === 'preferred') return 2;
  if (value === 'available') return 1;
  return 0;
}

function buildPreferenceStrings(availability, config = {}) {
  const slotDuration = Number(config.slotDuration) || 30;
  const startTime = config.earliestStart || '09:00';
  const endTime = config.latestEnd === '00:00' ? '24:00' : (config.latestEnd || '24:00');

  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);

  if (!Number.isInteger(slotDuration) || slotDuration <= 0) {
    throw new Error('Invalid slot duration');
  }

  if (endMinutes <= startMinutes) {
    return [];
  }

  const preferences = [];
  for (const frontendDay of PREF_DAYS_IN_ORDER) {
    const backendDay = FRONTEND_TO_PREF_DAY[frontendDay];
    if (!backendDay) continue;

    for (let start = startMinutes; start + slotDuration <= endMinutes; start += slotDuration) {
      const slotStart = formatMinutesToTime(start);
      const slotEnd = formatMinutesToTime(start + slotDuration);
      const key = `${frontendDay}-${slotStart}`;
      const pref = availabilityValueToPreference(availability[key]);
      preferences.push(`${backendDay}:${slotStart}-${slotEnd}:${pref}`);
    }
  }

  return preferences;
}

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

export async function submitAvailability(utln, availability, preferences, fullName, config) {
  const { first_name, last_name } = splitName(fullName);
  const lab_perm = labPermFromPreferences(preferences.labLead, preferences.labAssistant);

  await apiCall('/ta/create', 'POST', {
    ta_id: utln,
    first_name,
    last_name,
    is_tf: false,
    lab_perm,
  }, null);

  const parsedPreferences = buildPreferenceStrings(availability, config);

  const result = await apiCall('/ta/preferences', 'POST', {
    ta_id: utln,
    preferences: parsedPreferences,
  }, null);

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
