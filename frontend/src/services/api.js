/**
 * VyOS API Service
 * Handles communication with the VyOS API endpoints
 */

const API_BASE_URL = process.env.API_ENDPOINT || 'http://localhost:8080';

/**
 * Fetch with authentication and error handling
 */
async function fetchWithAuth(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('authToken');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      // Redirect to login or handle as needed
      window.location.href = '/login';
      return null;
    }
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText || 'Unknown error',
      }));
      throw new Error(error.message || 'API request failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * System information endpoints
 */
export const systemApi = {
  /**
   * Get system status information
   */
  getStatus: () => {
    return fetchWithAuth('/api/status');
  },

  /**
   * Get system resource utilization
   */
  getResources: () => {
    return fetchWithAuth('/api/resources');
  },

  /**
   * Get network interfaces information
   */
  getInterfaces: () => {
    return fetchWithAuth('/api/interfaces');
  },

  /**
   * Get system version information
   */
  getVersion: () => {
    return fetchWithAuth('/api/version');
  }
};

/**
 * Routing API endpoints
 */
export const routingApi = {
  /**
   * Get BGP status information
   */
  getBgpStatus: () => {
    return fetchWithAuth('/api/routing/bgp');
  },

  /**
   * Get static routes
   */
  getStaticRoutes: () => {
    return fetchWithAuth('/api/routing/static');
  }
};

/**
 * Authentication API endpoints
 */
export const authApi = {
  /**
   * Login with username and password
   */
  login: (username, password) => {
    return fetchWithAuth('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  /**
   * Validate current token
   */
  validateToken: () => {
    return fetchWithAuth('/api/validate-token');
  },

  /**
   * Logout current user
   */
  logout: () => {
    return fetchWithAuth('/api/logout', {
      method: 'POST',
    });
  }
};

export default {
  system: systemApi,
  routing: routingApi,
  auth: authApi
}; 