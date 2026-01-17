/**
 * Flask Server Availability Check Utility
 *
 * Checks if the Flask server is running (default: localhost:5001)
 */

const FLASK_SERVER_URL = 'http://localhost:5001';
const FLASK_HEALTH_ENDPOINT = `${FLASK_SERVER_URL}/health`;

let flaskAvailable = null;
let checkPromise = null;

export async function checkFlaskAvailability() {
  if (flaskAvailable !== null) return flaskAvailable;
  if (checkPromise) return checkPromise;

  checkPromise = fetch(FLASK_HEALTH_ENDPOINT, {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    signal: AbortSignal.timeout(2000),
  })
    .then((response) => {
      flaskAvailable = response.ok;
      return flaskAvailable;
    })
    .catch(() => {
      flaskAvailable = false;
      return false;
    })
    .finally(() => {
      checkPromise = null;
    });

  return checkPromise;
}

export function resetFlaskAvailability() {
  flaskAvailable = null;
  checkPromise = null;
}

export function getFlaskServerUrl() {
  return FLASK_SERVER_URL;
}

/** ✅ NEW: return the port number from the URL */
export function getFlaskPort() {
  try {
    const u = new URL(FLASK_SERVER_URL);
    // If someone sets FLASK_SERVER_URL without a port, fall back to protocol default
    if (u.port) return u.port;
    return u.protocol === 'https:' ? '443' : '80';
  } catch {
    // Safe fallback for weird environments
    return '5001';
  }
}

export function getFlaskRunEndpoint() {
  return `${FLASK_SERVER_URL}/api/nodes/run`;
}


