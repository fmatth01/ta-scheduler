/* 
 *  apiCall
 *  Summary: Makes a call to the backend with the given url, method, body, and token
 *  Input: url    (string) - url path for the api call
 *          method (string) - the HTTPS method for the specific endpoint (E.g. "GET")
 *          body   (object)   - the req.body that's sent to the endpoint (E.g. { ID })
 *          token  (string) - the authentication session token for a user
 *  Returns: The response from the backend or if there is an error, throws an object 
 *          with the status and statusText
 *  Notes:
 *      - If any parameter is unnecessary for an endpoint use null in the function call
 *      - All string values for the method parameter should be uppercase
 *      - Example Usage: apiCall('/staff/create', "POST", { firstName, lastName, ... }, None)
 *      - An instance of the backend must be running in a separate terminal for local use
 */
const apiCall = async (url, method, body, token) => {

  // add '/' to the beginning of the url if it is not there
  if (!url.startsWith('/')) {
    url = '/' + url;
  }
  let response;
  try {
    response = await fetch(process.env.VITE_BASE_URL + url, {
      method: method,
      headers: {
        ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), 
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },

      body: body instanceof FormData ? body : body ? JSON.stringify(body) : null,
    });
  } catch (error) {
    console.error('Error in apiCall:', error);
    throw { status: 500, statusText: 'Error in apiCall' };
  }

  if (!response.ok) {
    console.error(response);
    throw { status: response.status, statusText: response.statusText };
  }

  const contentType = response.headers.get('content-type');
  if (!contentType) {
    console.error('Invalid content type:', contentType);
    throw { status: 500, statusText: 'Invalid content type' };
  }

  if (contentType.includes('application/json')) {
    return await response.json();
  }
  
  return { message: await response.text()};
};



/* Splits a the time format "HH:MM" to MM */
function timeToMinutes(hhmm) {
    const [hh, mm] = hhmm.split(":").map(Number);

    if (
        !Number.isInteger(hh) || !Number.isInteger(mm) ||
        hh < 0 || hh > 23 || mm < 0 || mm > 59
    ) {
        throw new Error(`Invalid time format: ${hhmm}`);
    }

    return hh * 60 + mm;
}

/* Given a start time, end time, and shift duration, function
 * returns the number of shifts that can fit within the interval
 */
function countShifts(start_time, end_time, shift_duration) {
    const start = timeToMinutes(start_time);
    const end = timeToMinutes(end_time);

    if (!Number.isInteger(shift_duration) || shift_duration <= 0) {
        throw new Error("shift_duration must be a positive integer");
    }

    if (end <= start) {
        return 0;
    }

    return Math.floor((end - start) / shift_duration);
}

/* minutes -> "HH:MM" */
function minutesToTime(mins) {
  const hh = Math.floor(mins / 60);
  const mm = mins % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/*
 * Given start/end interval and shift duration,
 * returns an array of { start_time, end_time }
 */
function getShiftTimes(start_time, end_time, shift_duration) {
  const startMinutes = timeToMinutes(start_time);
  const endMinutes = timeToMinutes(end_time);

  const numShifts = Math.floor((endMinutes - startMinutes) / shift_duration);
  const shifts = [];

  for (let i = 0; i < numShifts; i++) {
    const shiftStart = startMinutes + i * shift_duration;
    const shiftEnd = shiftStart + shift_duration;

    shifts.push({
      start_time: minutesToTime(shiftStart),
      end_time: minutesToTime(shiftEnd),
    });
  }

  return shifts;
}

async function getNextScheduleId(scheduleCollection) {
  const last = await scheduleCollection
    .find({}, { projection: { schedule_id: 1 } })
    .sort({ schedule_id: -1 })
    .limit(1)
    .next();

  return (last?.schedule_id ?? 0) + 1;
}

module.exports = { apiCall, countShifts, getShiftTimes, getNextScheduleId}