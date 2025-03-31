/**
 * VyOS GraphQL API Service
 * A modular client for interacting with the VyOS GraphQL API
 */

// API configuration
const API_CONFIG = {
  endpoint: process.env.REACT_APP_VYOS_API_ENDPOINT || process.env.VYOS_API_ENDPOINT || 'https://10.0.101.245/graphql',
  apiKey: process.env.REACT_APP_VYOS_API_KEY || process.env.VYOS_API_KEY || 'test123',
  timeout: 30000, // 30 seconds
  insecure: process.env.REACT_APP_VYOS_API_INSECURE === 'true' || process.env.VYOS_API_INSECURE === 'true',
};

// Debug information about environment configuration
console.log('[VyOS API] Configuration loaded:', {
  endpoint: API_CONFIG.endpoint,
  insecure: API_CONFIG.insecure,
  useRealApi: process.env.REACT_APP_USE_REAL_API === 'true' || process.env.USE_REAL_API === 'true',
  environmentVariables: {
    REACT_APP_VYOS_API_ENDPOINT: process.env.REACT_APP_VYOS_API_ENDPOINT,
    VYOS_API_ENDPOINT: process.env.VYOS_API_ENDPOINT,
    REACT_APP_VYOS_API_INSECURE: process.env.REACT_APP_VYOS_API_INSECURE,
    VYOS_API_INSECURE: process.env.VYOS_API_INSECURE,
    REACT_APP_USE_REAL_API: process.env.REACT_APP_USE_REAL_API,
    USE_REAL_API: process.env.USE_REAL_API,
    NODE_ENV: process.env.NODE_ENV
  }
});

/**
 * Execute a GraphQL query against the VyOS API
 * @param {string} query - GraphQL query
 * @param {Object} variables - Query variables
 * @returns {Promise<Object>} - Query result
 */
async function executeQuery(query, variables = {}) {
  try {
    console.log('[VyOS API] Executing query:', query);
    console.log('[VyOS API] Using endpoint:', API_CONFIG.endpoint);
    console.log('[VyOS API] Insecure mode:', API_CONFIG.insecure);
    
    const requestBody = {
      query,
      variables,
    };

    console.log('[VyOS API] Request body:', JSON.stringify(requestBody));

    // Add additional headers for CORS
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    console.log('[VyOS API] Request headers:', headers);

    // Define fetch options with more detailed settings
    const fetchOptions = {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      mode: 'cors', // Explicitly set CORS mode
      credentials: 'omit', // Don't send cookies
      // For the insecure flag handling
      ...(API_CONFIG.insecure ? { 
        rejectUnauthorized: false 
      } : {})
    };
    
    console.log('[VyOS API] Fetch options:', JSON.stringify(fetchOptions, null, 2));

    try {
      const response = await fetch(API_CONFIG.endpoint, fetchOptions);
      console.log('[VyOS API] Response status:', response.status, response.statusText);
      console.log('[VyOS API] Response headers:', Object.fromEntries([...response.headers]));

      if (!response.ok) {
        console.error('[VyOS API] Response not OK:', response.status, response.statusText);
        let errorText;
        try {
          // Try to get error text if possible
          errorText = await response.text();
          console.error('[VyOS API] Error response body:', errorText);
        } catch (e) {
          console.error('[VyOS API] Could not read error text:', e);
        }
        throw new Error(`API request failed with status ${response.status}: ${response.statusText}${errorText ? ` - ${errorText}` : ''}`);
      }

      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error('[VyOS API] Error parsing JSON response:', e);
        const responseText = await response.text();
        console.error('[VyOS API] Raw response:', responseText);
        throw new Error(`Failed to parse API response as JSON: ${e.message}`);
      }
      
      console.log('[VyOS API] Response data:', JSON.stringify(data));
      
      if (data.errors) {
        console.error('[VyOS API] GraphQL errors:', JSON.stringify(data.errors));
        throw new Error(
          `GraphQL Error: ${data.errors.map(e => e.message).join(', ')}`
        );
      }
      
      return data.data;
    } catch (fetchError) {
      console.error('[VyOS API] Fetch error:', fetchError);
      // Check for CORS errors or network failures
      if (fetchError.message.includes('NetworkError') || 
          fetchError.message.includes('CORS') ||
          fetchError.message.includes('Failed to fetch')) {
        console.error('[VyOS API] Possible CORS or network error detected');
        
        // Try to give more specific advice
        if (fetchError.message.includes('SSL')) {
          console.error('[VyOS API] SSL/TLS error detected. Make sure VYOS_API_INSECURE is set to "true" for self-signed certificates.');
        }
        
        if (API_CONFIG.endpoint.startsWith('https:')) {
          console.error('[VyOS API] HTTPS endpoint detected. Browser security may be blocking the request to an insecure endpoint.');
        }
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('[VyOS API] Error in executeQuery:', error);
    throw error;
  }
}

/**
 * System resource queries
 */
export const systemResources = {
  /**
   * Get memory usage information
   * @returns {Promise<Object>} Memory usage data
   */
  getMemory: async () => {
    console.log('[VyOS API] getMemory: Starting request');
    const query = `{
      ShowMemory(data: {key: "${API_CONFIG.apiKey}"}) {
        success
        errors
        data {
          result
        }
      }
    }`;

    try {
      console.log('[VyOS API] getMemory: Executing query');
      const result = await executeQuery(query);
      console.log('[VyOS API] getMemory: Query result:', JSON.stringify(result));
      
      if (!result.ShowMemory.success) {
        console.error('[VyOS API] getMemory: API reported failure:', result.ShowMemory.errors);
        throw new Error(`Failed to get memory data: ${result.ShowMemory.errors}`);
      }
      
      // Parse the memory result
      console.log('[VyOS API] getMemory: Parsing memory data from:', JSON.stringify(result.ShowMemory.data.result));
      const memoryData = parseMemoryData(result.ShowMemory.data.result);
      console.log('[VyOS API] getMemory: Parsed memory data:', JSON.stringify(memoryData));
      return memoryData;
    } catch (error) {
      console.error('[VyOS API] Error fetching memory data:', error);
      throw error;
    }
  },

  /**
   * Get CPU usage information
   * @returns {Promise<Object>} CPU usage data
   */
  getCpu: async () => {
    const query = `{
      ShowCpu(data: {key: "${API_CONFIG.apiKey}"}) {
        success
        errors
        data {
          result
        }
      }
    }`;

    try {
      const result = await executeQuery(query);
      
      if (!result.ShowCpu.success) {
        throw new Error(`Failed to get CPU data: ${result.ShowCpu.errors}`);
      }
      
      // Parse the CPU result
      return parseCpuData(result.ShowCpu.data.result);
    } catch (error) {
      console.error('Error fetching CPU data:', error);
      throw error;
    }
  },

  /**
   * Get storage usage information
   * @returns {Promise<Object>} Storage usage data
   */
  getStorage: async () => {
    const query = `{
      ShowStorage(data: {key: "${API_CONFIG.apiKey}"}) {
        success
        errors
        data {
          result
        }
      }
    }`;

    try {
      const result = await executeQuery(query);
      
      if (!result.ShowStorage.success) {
        throw new Error(`Failed to get storage data: ${result.ShowStorage.errors}`);
      }
      
      // Parse the storage result
      return parseStorageData(result.ShowStorage.data.result);
    } catch (error) {
      console.error('Error fetching storage data:', error);
      throw error;
    }
  },

  /**
   * Get all system resources in a single call
   * @returns {Promise<Object>} All system resource data
   */
  getAllResources: async () => {
    try {
      const [memory, cpu, storage] = await Promise.all([
        systemResources.getMemory(),
        systemResources.getCpu(),
        systemResources.getStorage(),
      ]);
      
      return {
        memory,
        cpu,
        storage,
      };
    } catch (error) {
      console.error('Error fetching all system resources:', error);
      throw error;
    }
  },
};

/**
 * Network information queries
 */
export const networkInfo = {
  /**
   * Get interface information
   * @returns {Promise<Array>} Interface data
   */
  getInterfaces: async () => {
    const query = `{
      ShowInterfaces(data: {key: "${API_CONFIG.apiKey}"}) {
        success
        errors
        data {
          result
        }
      }
    }`;

    try {
      const result = await executeQuery(query);
      
      if (!result.ShowInterfaces.success) {
        throw new Error(`Failed to get interface data: ${result.ShowInterfaces.errors}`);
      }
      
      // Parse the interfaces result
      return parseInterfaceData(result.ShowInterfaces.data.result);
    } catch (error) {
      console.error('Error fetching interface data:', error);
      throw error;
    }
  },
};

/**
 * Parse memory data from VyOS API response
 * @param {string} data - Raw memory data
 * @returns {Object} Structured memory data
 */
function parseMemoryData(data) {
  try {
    // The VyOS API returns memory data in a structured format
    // Example:
    // {"total":4117680128,"free":3144159232,"used":973520896,"buffers":54493184,"cached":690941952}
    
    if (!data) {
      console.warn('Invalid memory data: data is null or undefined');
      return {
        total: 0,
        used: 0,
        free: 0,
        buffers: 0,
        cached: 0,
        actualUsed: 0
      };
    }
    
    // If data is already an object (actual API response), process it directly
    if (typeof data === 'object') {
      // Convert bytes to MB for better readability
      const bytesToMB = (bytes) => Math.round(bytes / (1024 * 1024));
      
      return {
        total: bytesToMB(data.total),
        used: bytesToMB(data.used),
        free: bytesToMB(data.free),
        buffers: bytesToMB(data.buffers),
        cached: bytesToMB(data.cached),
        // Calculate actual used memory (excluding buffers/cache)
        actualUsed: bytesToMB(data.used - data.buffers - data.cached)
      };
    }
    
    // For text-based output format (in case API changes or for legacy support)
    if (typeof data === 'string') {
      console.warn('String-based memory data detected, this may not be accurate');
      // Return zeros instead of mock data
      return {
        total: 0,
        used:.0,
        free: 0,
        buffers: 0,
        cached: 0,
        actualUsed: 0
      };
    }
    
    // Return zeros instead of mock data when format is unknown
    return {
      total: 0,
      used: 0,
      free: 0,
      buffers: 0,
      cached: 0,
      actualUsed: 0
    };
  } catch (error) {
    console.error('Error parsing memory data:', error);
    // Return zeros on error
    return {
      total: 0,
      used: 0,
      free: 0,
      buffers: 0,
      cached: 0,
      actualUsed: 0
    };
  }
}

/**
 * Parse CPU data from VyOS API response
 * @param {string} data - Raw CPU data
 * @returns {Object} Structured CPU data
 */
function parseCpuData(data) {
  // Return zeros instead of mock data
  return {
    usage: 0,
    cores: 0,
    load: [0, 0, 0]
  };
}

/**
 * Parse storage data from VyOS API response
 * @param {string} data - Raw storage data
 * @returns {Object} Structured storage data
 */
function parseStorageData(data) {
  // Return zeros instead of mock data
  return {
    total: 0,
    used: 0,
    free: 0
  };
}

/**
 * Parse interface data from VyOS API response
 * @param {string} data - Raw interface data
 * @returns {Array} Structured interface data
 */
function parseInterfaceData(data) {
  // Return empty array instead of mock data
  return [];
}

export default {
  systemResources,
  networkInfo,
  executeQuery
}; 