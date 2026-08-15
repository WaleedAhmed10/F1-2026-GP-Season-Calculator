/**
 * Centralized API service with error handling, interceptors, and retries
 * Handles authentication, response formatting, and error recovery
 */

const API_URL = import.meta.env.VITE_API_URL || '/api';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

/**
 * Retry mechanism with exponential backoff
 */
async function withRetry(fn, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      // Only retry on network errors, not on 4xx/5xx
      if (attempt < retries - 1 && error.name === 'NetworkError') {
        const delay = RETRY_DELAY * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}

/**
 * Main API call function with error handling
 */
export async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const response = await withRetry(async () => {
      return await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal
      });
    });

    clearTimeout(timeoutId);

    // Handle non-2xx responses
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: `HTTP ${response.status}` };
      }

      const error = new Error(errorData.error || 'API request failed');
      error.statusCode = response.status;
      error.details = errorData.details;

      // Handle specific status codes
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }

      throw error;
    }

    const data = await response.json();

    // Handle success responses (with new format)
    if (data.success === false) {
      const error = new Error(data.error || 'API request failed');
      error.details = data.details;
      throw error;
    }

    // Return data directly if it's old format, or data field if new format
    return data.data !== undefined ? data.data : data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }

    throw error;
  }
}

/**
 * Handle API errors and return user-friendly message
 */
export function getErrorMessage(error) {
  if (typeof error === 'string') return error;
  if (error.details) return Object.values(error.details)[0] || error.message;
  return error.message || 'An unexpected error occurred';
}

/**
 * API endpoints
 */
export const api = {
  // Drivers
  getDrivers: () => apiCall('/drivers'),
  getDriver: (id) => apiCall(`/drivers/${id}`),
  getDriverStats: (id) => apiCall(`/championship/drivers/${id}/stats`),

  // Races
  getRaces: () => apiCall('/races'),
  getRace: (id) => apiCall(`/races/${id}`),
  getRaceResults: () => apiCall('/championship/results'),
  getPredictions: (raceId) => apiCall(`/championship/races/${raceId}/predictions`),

  // Predictions
  submitPrediction: (raceId, driverId) =>
    apiCall('/predictions', {
      method: 'POST',
      body: JSON.stringify({ raceId, driverId })
    }),
  getUserPredictions: () => apiCall('/predictions'),
  deletePredictions: () => apiCall('/predictions', { method: 'DELETE' }),

  // Leaderboard
  getLeaderboard: (limit = 10) => apiCall(`/leaderboard?limit=${limit}`),

  // Championship
  getDriverStandings: () => apiCall('/championship/drivers'),
  getConstructorStandings: () => apiCall('/championship/constructors'),
  getChampionshipSimulation: () => apiCall('/championship/simulation'),
  submitRaceResult: (raceId, finishingOrder) =>
    apiCall('/championship/results', {
      method: 'POST',
      body: JSON.stringify({ raceId, finishingOrder })
    }),
  getTeamStats: (team) => apiCall(`/championship/teams/${team}/stats`),
  compareDrivers: (driver1Id, driver2Id) =>
    apiCall(`/championship/drivers/${driver1Id}/compare/${driver2Id}`),

  // Authentication
  signup: (username, password, displayName) =>
    apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, password, displayName })
    }),
  signin: (username, password) =>
    apiCall('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),
  me: () => apiCall('/auth/me'),

  // Export
  exportData: () => apiCall('/export')
};

export default api;

