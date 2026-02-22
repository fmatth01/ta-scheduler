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


module.exports = { apiCall }