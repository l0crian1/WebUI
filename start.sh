#!/bin/bash

# VyOS WebUI Setup Script
echo "Setting up VyOS WebUI..."

# Create necessary directories
mkdir -p frontend/src/services frontend/src/pages scripts

# Make Python script executable
if [ -f scripts/fetch_vyos_data.py ]; then
  chmod +x scripts/fetch_vyos_data.py
fi

# Copy API service if it doesn't exist
if [ ! -f frontend/src/services/api.js ]; then
  echo "Creating API service file..."
  cat > frontend/src/services/api.js << 'EOF'
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
EOF
fi

# Copy Dashboard component if it doesn't exist
if [ ! -f frontend/src/pages/Dashboard.jsx ]; then
  echo "Creating Dashboard component..."
  cat > frontend/src/pages/Dashboard.jsx << 'EOF'
import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  CircularProgress, 
  Divider, 
  Card, 
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import { 
  Memory as MemoryIcon,
  Storage as StorageIcon,
  NetworkCheck as NetworkIcon,
  Info as InfoIcon 
} from '@mui/icons-material';
import { systemApi } from '../services/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [resources, setResources] = useState(null);
  const [interfaces, setInterfaces] = useState(null);
  const [version, setVersion] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // For development, use mock data if the API is not available
        if (process.env.NODE_ENV === 'development' && !process.env.USE_REAL_API) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          setSystemStatus({
            hostname: 'vyos-router',
            uptime: '10 days, 4 hours, 30 minutes',
            status: 'running'
          });
          
          setResources({
            cpu: {
              usage: 32,
              cores: 4,
              load: [0.52, 0.48, 0.42]
            },
            memory: {
              total: 8192,
              used: 2048,
              free: 6144
            },
            storage: {
              total: 32768,
              used: 12288,
              free: 20480
            }
          });
          
          setInterfaces([
            { name: 'eth0', status: 'up', ipv4: '192.168.1.1/24', ipv6: 'fe80::1/64', rx_bytes: 1024000, tx_bytes: 512000 },
            { name: 'eth1', status: 'up', ipv4: '10.0.0.1/24', ipv6: 'fe80::2/64', rx_bytes: 512000, tx_bytes: 256000 },
            { name: 'eth2', status: 'down', ipv4: null, ipv6: null, rx_bytes: 0, tx_bytes: 0 }
          ]);
          
          setVersion({
            version: 'VyOS 1.4.0',
            buildDate: '2023-01-15',
            architecture: 'x86_64'
          });
        } else {
          // Fetch real data from the API
          const [statusRes, resourcesRes, interfacesRes, versionRes] = await Promise.all([
            systemApi.getStatus(),
            systemApi.getResources(),
            systemApi.getInterfaces(),
            systemApi.getVersion()
          ]);
          
          setSystemStatus(statusRes);
          setResources(resourcesRes);
          setInterfaces(interfacesRes);
          setVersion(versionRes);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="calc(100vh - 64px)"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="calc(100vh - 64px)"
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 500 }}>
        Dashboard
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          System Overview
        </Typography>
        
        <Paper sx={{ p: 2, bgcolor: '#2a2a2a' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Hostname: {systemStatus?.hostname}</Typography>
              <Typography variant="subtitle1">System Status: {systemStatus?.status}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Uptime: {systemStatus?.uptime}</Typography>
              <Typography variant="subtitle1">Version: {version?.version}</Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>
      
      <Grid container spacing={3}>
        {/* System Resources */}
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: '#2a2a2a' }}>
            <CardHeader 
              title="System Resources" 
              avatar={<MemoryIcon />}
              sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}
            />
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>CPU Usage</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
                  <CircularProgress
                    variant="determinate"
                    value={resources?.cpu?.usage || 0}
                    size={60}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="caption" component="div" color="text.secondary">
                      {`${resources?.cpu?.usage || 0}%`}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body2">Cores: {resources?.cpu?.cores}</Typography>
                  <Typography variant="body2">Load: {resources?.cpu?.load?.join(' / ')}</Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.12)' }} />
              
              <Typography variant="subtitle2" gutterBottom>Memory Usage</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
                  <CircularProgress
                    variant="determinate"
                    value={resources ? (resources.memory.used / resources.memory.total) * 100 : 0}
                    size={60}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="caption" component="div" color="text.secondary">
                      {resources ? Math.round((resources.memory.used / resources.memory.total) * 100) : 0}%
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body2">
                    Used: {resources ? `${Math.round(resources.memory.used / 1024)} MB` : '0 MB'}
                  </Typography>
                  <Typography variant="body2">
                    Total: {resources ? `${Math.round(resources.memory.total / 1024)} MB` : '0 MB'}
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.12)' }} />
              
              <Typography variant="subtitle2" gutterBottom>Storage</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
                  <CircularProgress
                    variant="determinate"
                    value={resources ? (resources.storage.used / resources.storage.total) * 100 : 0}
                    size={60}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="caption" component="div" color="text.secondary">
                      {resources ? Math.round((resources.storage.used / resources.storage.total) * 100) : 0}%
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body2">
                    Used: {resources ? `${Math.round(resources.storage.used / 1024)} GB` : '0 GB'}
                  </Typography>
                  <Typography variant="body2">
                    Total: {resources ? `${Math.round(resources.storage.total / 1024)} GB` : '0 GB'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Network Interfaces */}
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: '#2a2a2a' }}>
            <CardHeader 
              title="Network Interfaces" 
              avatar={<NetworkIcon />}
              sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}
            />
            <CardContent>
              <List>
                {interfaces?.map((iface) => (
                  <Box key={iface.name}>
                    <ListItem>
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2">{iface.name}</Typography>
                          <Chip 
                            label={iface.status} 
                            size="small" 
                            color={iface.status === 'up' ? 'success' : 'error'} 
                            sx={{ fontWeight: 'bold' }}
                          />
                        </Box>
                        {iface.status === 'up' && (
                          <>
                            <Box sx={{ mt: 1 }}>
                              {iface.ipv4 && (
                                <Typography variant="body2">IPv4: {iface.ipv4}</Typography>
                              )}
                              {iface.ipv6 && (
                                <Typography variant="body2">IPv6: {iface.ipv6}</Typography>
                              )}
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                              <Typography variant="body2">
                                RX: {Math.round(iface.rx_bytes / 1024)} KB
                              </Typography>
                              <Typography variant="body2">
                                TX: {Math.round(iface.tx_bytes / 1024)} KB
                              </Typography>
                            </Box>
                          </>
                        )}
                      </Box>
                    </ListItem>
                    <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
EOF
fi

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend || mkdir -p frontend && cd frontend
npm install
npm install react-router-dom axios dotenv

# Copy .env.template to .env if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env from template..."
  cp .env.template .env || echo "Error: .env.template not found"
fi

# Build the application
echo "Building the application..."
npm run build

echo "Setup complete! To start the development server, run:"
echo "cd frontend && npm run start"
echo ""
echo "To test the VyOS GraphQL API, you can use the Python script:"
echo "python3 scripts/fetch_vyos_data.py --query memory --insecure"
echo "python3 scripts/fetch_vyos_data.py --query all --insecure --monitor" 