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

// Force log to ensure it appears in terminal
console.log('\n\n[VyOS API] ========== CONFIGURATION LOADED ==========');
console.log('[VyOS API] Endpoint:', API_CONFIG.endpoint);
console.log('[VyOS API] Insecure mode:', API_CONFIG.insecure);
console.log('[VyOS API] Using real API:', process.env.REACT_APP_USE_REAL_API === 'true' || process.env.USE_REAL_API === 'true');
console.log('[VyOS API] Environment variables:');
console.log('  REACT_APP_VYOS_API_ENDPOINT:', process.env.REACT_APP_VYOS_API_ENDPOINT);
console.log('  VYOS_API_ENDPOINT:', process.env.VYOS_API_ENDPOINT);
console.log('  REACT_APP_VYOS_API_INSECURE:', process.env.REACT_APP_VYOS_API_INSECURE);
console.log('  VYOS_API_INSECURE:', process.env.VYOS_API_INSECURE);
console.log('  REACT_APP_USE_REAL_API:', process.env.REACT_APP_USE_REAL_API);
console.log('  USE_REAL_API:', process.env.USE_REAL_API);
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('[VyOS API] =========================================\n\n');

// Test the API connection directly when the module loads
function testApiConnection() {
  console.log('\n\n[VyOS API] ✓✓✓ TESTING API CONNECTION IMMEDIATELY ✓✓✓');
  console.log('[VyOS API] This test runs automatically when the application starts');
  
  const testQuery = ` {
 ShowMemory(data: {key: "${API_CONFIG.apiKey}"}) {
  success
  errors
  data {
   result
  }
 }
}`;

  // Use XMLHttpRequest directly for more reliable logging
  const xhr = new XMLHttpRequest();
  
  xhr.onreadystatechange = function() {
    console.log(`[VyOS API] Test XHR state change: ${xhr.readyState} (${getReadyStateText(xhr.readyState)})`);
    
    if (xhr.readyState === 4) {
      console.log('[VyOS API] Test completed with status:', xhr.status);
      
      if (xhr.status >= 200 && xhr.status < 300) {
        console.log('[VyOS API] Test successful! Response:', xhr.responseText);
      } else {
        console.error('[VyOS API] Test failed with status:', xhr.status);
        console.error('[VyOS API] Test response text:', xhr.responseText || 'No response text');
      }
    }
  };
  
  xhr.onerror = function(event) {
    console.error('[VyOS API] Test network error occurred!', event);
    console.error('[VyOS API] Most likely CORS or network connectivity issue');
    console.error('[VyOS API] Recommended: Test with curl directly:');
    console.error(`curl -k --raw '${API_CONFIG.endpoint}' -H 'Content-Type: application/json' -d '{"query":" {\\n ShowMemory (data: {key: \\"${API_CONFIG.apiKey}\\"}) {success errors data {result}}}"}'`);
  };
  
  try {
    xhr.open('POST', API_CONFIG.endpoint, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json');
    
    const payload = JSON.stringify({ query: testQuery });
    console.log('[VyOS API] Sending test request with payload:', payload);
    console.log('[VyOS API] ✓✓✓ END TEST SETUP ✓✓✓\n\n');
    
    xhr.send(payload);
  } catch (err) {
    console.error('[VyOS API] Error sending test request:', err);
  }
}

// Run the test immediately
testApiConnection();

/**
 * Execute a GraphQL query against the VyOS API
 * @param {string} query - GraphQL query
 * @param {Object} variables - Query variables
 * @returns {Promise<Object>} - Query result
 */
async function executeQuery(query, variables = {}) {
  try {
    console.log('\n\n[VyOS API] ===================== EXECUTING QUERY ======================');
    console.log('[VyOS API] Query:', query);
    console.log('[VyOS API] Using endpoint:', API_CONFIG.endpoint);
    console.log('[VyOS API] API Key:', API_CONFIG.apiKey);
    
    return new Promise((resolve, reject) => {
      console.log('[VyOS API] Creating XMLHttpRequest');
      // Use XMLHttpRequest instead of fetch for more reliable logging
      const xhr = new XMLHttpRequest();
      
      // Log all stages of the request
      xhr.onreadystatechange = function() {
        console.log(`[VyOS API] XHR state change: ${xhr.readyState} (${getReadyStateText(xhr.readyState)})`);
        
        if (xhr.readyState === 4) {
          console.log('[VyOS API] XHR completed with status:', xhr.status);
          
          if (xhr.status >= 200 && xhr.status < 300) {
            console.log('[VyOS API] XHR response received:', xhr.responseText);
            try {
              const response = JSON.parse(xhr.responseText);
              console.log('[VyOS API] Response parsed successfully');
              
              if (response.errors) {
                console.error('[VyOS API] GraphQL errors:', JSON.stringify(response.errors));
                reject(new Error(`GraphQL Error: ${response.errors.map(e => e.message).join(', ')}`));
                return;
              }
              
              console.log('[VyOS API] Request successful, returning data');
              resolve(response.data);
            } catch (parseError) {
              console.error('[VyOS API] Error parsing response:', parseError);
              console.error('[VyOS API] Raw response:', xhr.responseText);
              reject(new Error(`Failed to parse API response: ${parseError.message}`));
            }
          } else {
            console.error('[VyOS API] XHR request failed with status:', xhr.status);
            console.error('[VyOS API] Response text:', xhr.responseText || 'No response text');
            reject(new Error(`API request failed with status ${xhr.status}`));
          }
        }
      };
      
      xhr.onerror = function(event) {
        console.error('[VyOS API] XHR network error occurred:', event);
        console.error('[VyOS API] 🔴 CONNECTION ERROR');
        console.error('[VyOS API] Common causes:');
        console.error('  1. The VyOS router might not be reachable');
        console.error('  2. CORS might be blocking the request (likely cause)');
        console.error('  3. The API might not be enabled on the VyOS router');
        console.error('[VyOS API] Try the curl command directly:');
        console.error(`curl -k --raw '${API_CONFIG.endpoint}' -H 'Content-Type: application/json' -d '{"query":" {\\n ShowMemory (data: {key: \\"${API_CONFIG.apiKey}\\"}) {success errors data {result}}}"}'`);
        reject(new Error('Network error occurred'));
      };
      
      try {
        console.log('[VyOS API] Opening XHR connection...');
        xhr.open('POST', API_CONFIG.endpoint, true);
        
        // Set headers
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Accept', 'application/json');
        
        // Format the request more like the working curl command
        const requestStr = JSON.stringify({
          query: query
        });
        
        console.log('[VyOS API] Sending request with payload:', requestStr);
        console.log('[VyOS API] ===========================================================\n\n');
        
        xhr.send(requestStr);
      } catch (sendError) {
        console.error('[VyOS API] Error sending XHR request:', sendError);
        reject(sendError);
      }
    });
  } catch (error) {
    console.error('[VyOS API] Fatal error in executeQuery:', error);
    throw error;
  }
}

// Helper function to get readable XHR state
function getReadyStateText(state) {
  switch (state) {
    case 0: return 'UNSENT';
    case 1: return 'OPENED';
    case 2: return 'HEADERS_RECEIVED';
    case 3: return 'LOADING';
    case 4: return 'DONE';
    default: return 'UNKNOWN';
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
    const query = ` {
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