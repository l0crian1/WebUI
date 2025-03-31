/**
 * VyOS GraphQL API Service
 * A modular client for interacting with the VyOS GraphQL API
 */

// API configuration
const API_CONFIG = {
  endpoint: process.env.VYOS_API_ENDPOINT || 'https://10.0.101.245/graphql',
  apiKey: process.env.VYOS_API_KEY || 'test123',
  timeout: 30000, // 30 seconds
  insecure: process.env.VYOS_API_INSECURE === 'true', // Allow insecure HTTPS
};

/**
 * Execute a GraphQL query against the VyOS API
 * @param {string} query - GraphQL query
 * @param {Object} variables - Query variables
 * @returns {Promise<Object>} - Query result
 */
async function executeQuery(query, variables = {}) {
  try {
    const requestBody = {
      query,
      variables,
    };

    const response = await fetch(API_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      // In real-world use, you would need to handle SSL certificates properly
      // This is just to mirror the -k/--insecure flag from curl
      ...(API_CONFIG.insecure && { rejectUnauthorized: false }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      throw new Error(
        `GraphQL Error: ${data.errors.map(e => e.message).join(', ')}`
      );
    }
    
    return data.data;
  } catch (error) {
    console.error('VyOS GraphQL API Error:', error);
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
      const result = await executeQuery(query);
      
      if (!result.ShowMemory.success) {
        throw new Error(`Failed to get memory data: ${result.ShowMemory.errors}`);
      }
      
      // Parse the memory result
      const memoryData = parseMemoryData(result.ShowMemory.data.result);
      return memoryData;
    } catch (error) {
      console.error('Error fetching memory data:', error);
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
    // Mock parser for development - replace with actual parser
    // Example expected data format:
    // "Mem:          7.7G       5.5G       799M       396M       1.4G       4.9G"
    
    // In a real implementation, you would parse the actual format returned by VyOS
    // This is just a placeholder
    
    // For development/testing, return mock data
    if (!data || process.env.NODE_ENV === 'development') {
      return {
        total: 8192, // MB
        used: 5632,  // MB
        free: 799,   // MB
        shared: 396, // MB
        buffers: 1433, // MB
        cached: 5018   // MB
      };
    }
    
    // Simple parser for the example format
    const parts = data.split('\n').find(line => line.trim().startsWith('Mem:'));
    if (!parts) {
      throw new Error('Unable to parse memory data: Invalid format');
    }
    
    const values = parts.trim().split(/\s+/).filter(Boolean);
    
    // Convert values to MB if they have G suffix
    const convertToMB = (value) => {
      if (value.endsWith('G')) {
        return parseFloat(value.slice(0, -1)) * 1024;
      }
      if (value.endsWith('M')) {
        return parseFloat(value.slice(0, -1));
      }
      if (value.endsWith('K')) {
        return parseFloat(value.slice(0, -1)) / 1024;
      }
      return parseFloat(value);
    };
    
    return {
      total: convertToMB(values[1]),
      used: convertToMB(values[2]),
      free: convertToMB(values[3]),
      shared: convertToMB(values[4]),
      buffers: convertToMB(values[5]),
      cached: convertToMB(values[6])
    };
  } catch (error) {
    console.error('Error parsing memory data:', error);
    return {
      total: 0,
      used: 0,
      free: 0,
      shared: 0,
      buffers: 0,
      cached: 0
    };
  }
}

/**
 * Parse CPU data from VyOS API response
 * @param {string} data - Raw CPU data
 * @returns {Object} Structured CPU data
 */
function parseCpuData(data) {
  // Placeholder function - implement actual parsing logic
  return {
    usage: 32,
    cores: 4,
    load: [0.52, 0.48, 0.42]
  };
}

/**
 * Parse storage data from VyOS API response
 * @param {string} data - Raw storage data
 * @returns {Object} Structured storage data
 */
function parseStorageData(data) {
  // Placeholder function - implement actual parsing logic
  return {
    total: 32768,
    used: 12288,
    free: 20480
  };
}

/**
 * Parse interface data from VyOS API response
 * @param {string} data - Raw interface data
 * @returns {Array} Structured interface data
 */
function parseInterfaceData(data) {
  // Placeholder function - implement actual parsing logic
  return [
    { name: 'eth0', status: 'up', ipv4: '192.168.1.1/24', ipv6: 'fe80::1/64', rx_bytes: 1024000, tx_bytes: 512000 },
    { name: 'eth1', status: 'up', ipv4: '10.0.0.1/24', ipv6: 'fe80::2/64', rx_bytes: 512000, tx_bytes: 256000 },
    { name: 'eth2', status: 'down', ipv4: null, ipv6: null, rx_bytes: 0, tx_bytes: 0 }
  ];
}

export default {
  systemResources,
  networkInfo,
  executeQuery
}; 