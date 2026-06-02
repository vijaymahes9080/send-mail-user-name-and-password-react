import axios from 'axios';

// Instantiate base Axios client with standard limits
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

/**
 * Outbound Request Interceptor.
 * Checks local storage for active session token, injecting it
 * as Bearer token into standard Authorization headers.
 */
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Inbound Response Interceptor.
 * Captures 401 Unauthorized exceptions, resetting local session values
 * and booting expired credentials back to the Login panel.
 */
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Avoid redirecting when actively logging in or registering with bad inputs
      const path = error.config.url || '';
      const isAuthEndpoint = path.includes('/login') || path.includes('/register');
      
      if (!isAuthEndpoint) {
        console.warn('[Session Expired] Resetting token state.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Dynamic boot logic (handles hash routers or nested subfolders smoothly)
        if (!window.location.pathname.endsWith('/login')) {
          window.location.href = '/login?expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Authentication Endpoints Collection.
 */
export const authService = {
  /**
   * Registers a new user.
   * @param {Object} userData - Full user registration inputs.
   */
  register: async (userData) => {
    const response = await API.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Performs credential authorization.
   * @param {Object} credentials - Username/Email and password input bundle.
   */
  login: async (credentials) => {
    const response = await API.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Loads profile details of the active JWT user.
   */
  getProfile: async () => {
    const response = await API.get('/auth/me');
    return response.data;
  },
};

export default API;
