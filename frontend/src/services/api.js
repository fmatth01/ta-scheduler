/**
 * API service layer.
 * All functions are stubs that return Promises.
 * Replace with real fetch/axios calls when backend is ready.
 */

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

export async function submitAvailability(utln, availability, preferences) {
  // TODO: POST /api/ta/availability { utln, availability, preferences }
  // availability is an object: { 'Mon-09:00': 'preferred', 'Tue-14:30': 'general', ... }
  // preferences is: { labLead: boolean, labAssistant: boolean }
  // Should return: { success: true }
  return new Promise((resolve) => setTimeout(() => resolve({}), 500));
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

export async function publishSchedule(templateSlots, config) {
  // TODO: POST /api/tf/publish { templateSlots, config }
  // config includes: { earliestStart, latestEnd, slotDuration, tasPerShift, approvedTFs }
  // Should return: { success: true, schedule: [...] }
  return new Promise((resolve) => setTimeout(() => resolve({}), 500));
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
