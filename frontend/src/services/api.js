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
const SCHEDULE_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const ACTIVE_SCHEDULE_KEY = 'active_schedule_id';

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

function parseShiftDocument(rawShift) {
  if (typeof rawShift === 'string') {
    try {
      return JSON.parse(rawShift);
    } catch {
      return null;
    }
  }
  return rawShift && typeof rawShift === 'object' ? rawShift : null;
}

function normalizeUTLN(utln) {
  return String(utln || '').trim().toLowerCase();
}

function extractAssignedTAs(shift) {
  const fromPrimary = Array.isArray(shift?.ta_scheduled) ? shift.ta_scheduled : [];
  const fromAlternate = Array.isArray(shift?.tas_scheduled) ? shift.tas_scheduled : [];
  const raw = [...fromPrimary, ...fromAlternate];

  const seen = new Set();
  const result = [];
  for (const item of raw) {
    let utln = '';
    let name = '';
    if (typeof item === 'string') {
      utln = item.trim();
      name = utln;
    } else if (item && typeof item === 'object') {
      utln = String(item.utln || item.ta_id || '').trim();
      name = String(item.name || utln).trim();
    }

    if (!utln) continue;
    if (seen.has(utln)) continue;
    seen.add(utln);
    result.push({ utln, name: name || utln });
  }
  return result;
}

function mapScheduleDocumentToShifts(scheduleDoc, options = {}) {
  const { onlyUTLN } = options;
  const normalizedOnlyUTLN = normalizeUTLN(onlyUTLN);
  const shifts = [];

  for (const backendDay of SCHEDULE_DAYS) {
    const frontendDay = BACKEND_DAY_TO_FRONTEND[backendDay];
    if (!frontendDay) continue;

    const dayShifts = Array.isArray(scheduleDoc?.[backendDay]) ? scheduleDoc[backendDay] : [];
    for (const rawShift of dayShifts) {
      const shift = parseShiftDocument(rawShift);
      if (!shift?.start_time || !shift?.end_time) continue;

      const assignedTAs = extractAssignedTAs(shift);
      const shiftUTLNs = assignedTAs.map((ta) => ta.utln);
      const shiftUTLNsNormalized = shiftUTLNs.map(normalizeUTLN);
      if (normalizedOnlyUTLN && !shiftUTLNsNormalized.includes(normalizedOnlyUTLN)) {
        continue;
      }

      const baseShift = {
        id: shift.shift_id || `${frontendDay}-${shift.start_time}`,
        day: frontendDay,
        startTime: shift.start_time,
        endTime: shift.end_time,
        type: shift.is_lab ? 'lab' : 'oh',
        isEmpty: Boolean(shift.is_empty),
      };

      if (shift.is_lab) {
        shifts.push({
          ...baseShift,
          assignedTAs,
          labLeaders: [],
          labTAs: assignedTAs,
        });
      } else {
        shifts.push({
          ...baseShift,
          assignedTAs,
        });
      }
    }
  }

  return shifts;
}

function readStoredScheduleId() {
  try {
    const raw = localStorage.getItem(ACTIVE_SCHEDULE_KEY);
    const parsed = Number(raw);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  } catch {
    return null;
  }
}

function storeScheduleId(scheduleId) {
  try {
    if (Number.isInteger(scheduleId) && scheduleId > 0) {
      localStorage.setItem(ACTIVE_SCHEDULE_KEY, String(scheduleId));
    }
  } catch {
    // localStorage may be unavailable
  }
}

async function fetchScheduleById(scheduleId) {
  return apiCall(`/schedule/getSchedule?schedule_id=${scheduleId}`, 'GET', null, null);
}

async function fetchLatestScheduleId() {
  const result = await apiCall('/schedule/getLatestScheduleId', 'GET', null, null);
  return Number(result?.schedule_id);
}

async function getActiveScheduleDocument() {
  const storedId = readStoredScheduleId();
  if (storedId) {
    try {
      const storedSchedule = await fetchScheduleById(storedId);
      storeScheduleId(storedId);
      return storedSchedule;
    } catch {
      // If stored ID is stale, continue and fetch latest.
    }
  }

  const latestScheduleId = await fetchLatestScheduleId();
  if (!Number.isInteger(latestScheduleId) || latestScheduleId <= 0) {
    throw new Error('No valid schedule_id found');
  }

  const schedule = await fetchScheduleById(latestScheduleId);
  storeScheduleId(latestScheduleId);
  return schedule;
}

// --- Auth ---

export async function loginTA(utln, classCode) {
  const normalizedUTLN = (utln || '').trim();
  if (!normalizedUTLN) {
    throw new Error('UTLN is required');
  }

  // classCode is currently unused until class auth is wired on backend.
  void classCode;

  const result = await apiCall(`/ta/exists?ta_id=${encodeURIComponent(normalizedUTLN)}`, 'GET', null, null);
  const firstName = result?.ta?.first_name || '';
  const lastName = result?.ta?.last_name || '';
  const name = `${firstName} ${lastName}`.trim();

  return {
    name,
    isFirstTime: !result?.exists,
  };
}

export async function loginTF(utln, classCode) {
  const normalizedUTLN = (utln || '').trim();
  if (!normalizedUTLN) {
    throw new Error('UTLN is required');
  }

  // classCode is currently unused until class auth is wired on backend.
  void classCode;

  const result = await apiCall(`/ta/exists?ta_id=${encodeURIComponent(normalizedUTLN)}`, 'GET', null, null);
  const firstName = result?.ta?.first_name || '';
  const lastName = result?.ta?.last_name || '';

  return {
    name: `${firstName} ${lastName}`.trim(),
  };
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
  // Keep signature for caller context, but TA viewer needs full schedule:
  // own shifts are highlighted client-side, everyone else's are shown as "other" (blue).
  void utln;
  const schedule = await getActiveScheduleDocument();

  return {
    shifts: mapScheduleDocumentToShifts(schedule),
    scheduleId: schedule.schedule_id,
    config: {
      earliestStart: schedule.start_interval_time,
      latestEnd: schedule.end_interval_time,
      slotDuration: Number(schedule.shift_duration) || 90,
    },
  };
}

// --- TF ---

export async function generateTemplate(config) {
  // TODO: POST /api/tf/generate-template { config }
  // config: { earliestStart, latestEnd, slotDuration, tasPerShift, approvedTFs }
  // Should return: { templateSlots: { 'Mon-09:00': 'oh', ... } }
  void config;
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

  const scheduleResult = await apiCall('/schedule/initSchedule', 'POST', {
    start_interval_time: config.earliestStart,
    end_interval_time: config.latestEnd,
    shift_duration: config.slotDuration,
    staffing_capacity: [0, config.tasPerShift],
  }, null);

  // Step 4: Apply template slot type to each shift.
  // Slots not present in template are persisted as empty.
  const schedule = JSON.parse(JSON.stringify(scheduleResult));

  for (const [backendDay, shifts] of Object.entries(schedule)) {
    if (backendDay === 'schedule_id' || backendDay === '_id') continue;
    if (!Array.isArray(shifts)) continue;

    const frontendDay = BACKEND_DAY_TO_FRONTEND[backendDay];
    if (!frontendDay) continue;

    for (let i = 0; i < shifts.length; i++) {
      let shift = typeof shifts[i] === 'string' ? JSON.parse(shifts[i]) : shifts[i];
      if (!shift || !shift.start_time) {
        continue;
      }
      const slotKey = `${frontendDay}-${shift.start_time}`;
      const slotType = templateSlots[slotKey];

      if (slotType === 'lab') {
        shift.is_lab = true;
        shift.is_empty = false;
        // Lab shifts need leads (lab_perm=2) so the algorithm assigns leads + lab_tas
        shift.staffing_capacity = [2, config.tasPerShift];
      } else if (slotType === 'oh') {
        shift.is_lab = false;
        shift.is_empty = false;
        // OH shifts use lab_perm=0 so the algorithm assigns oh_tas
        shift.staffing_capacity = [0, config.tasPerShift];
      } else {
        shift.is_lab = false;
        shift.is_empty = true;
        shift.ta_scheduled = [];
        shift.tas_scheduled = [];
      }
      shifts[i] = typeof scheduleResult[backendDay][i] === 'string'
        ? JSON.stringify(shift)
        : shift;
    }
  }

  // Step 5: Persist schedule updates
  await apiCall('/schedule/update', 'PUT', {
    schedule_id: schedule.schedule_id,
    schedule,
  }, null);

  storeScheduleId(schedule.schedule_id);

  // Step 6: Run the scheduling algorithm to assign TAs to shifts
  console.log('[publishSchedule] Running scheduling algorithm...');
  const algResult = await apiCall('/schedule/runAlgorithm', 'POST', {}, null);
  console.log('[publishSchedule] Algorithm result:', algResult);

  return { success: true, schedule };
}

export async function getTFSchedule() {
  const schedule = await getActiveScheduleDocument();

  return {
    shifts: mapScheduleDocumentToShifts(schedule),
    scheduleId: schedule.schedule_id,
    config: {
      earliestStart: schedule.start_interval_time,
      latestEnd: schedule.end_interval_time,
      slotDuration: Number(schedule.shift_duration) || 90,
    },
  };
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
