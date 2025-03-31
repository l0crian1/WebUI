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
import vyosApi from '../services/vyosApi';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [resources, setResources] = useState(null);
  const [interfaces, setInterfaces] = useState(null);
  const [version, setVersion] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      console.log('\n[Dashboard] ========== FETCH DASHBOARD DATA ==========');
      setLoading(true);
      try {
        // Determine if we should use mock data or real API
        const useRealApi = process.env.REACT_APP_USE_REAL_API === 'true' || process.env.USE_REAL_API === 'true';
        console.log('[Dashboard] useRealApi:', useRealApi);
        console.log('[Dashboard] Environment variables:');
        console.log('  REACT_APP_VYOS_API_ENDPOINT:', process.env.REACT_APP_VYOS_API_ENDPOINT);
        console.log('  VYOS_API_ENDPOINT:', process.env.VYOS_API_ENDPOINT);
        console.log('  REACT_APP_USE_REAL_API:', process.env.REACT_APP_USE_REAL_API);
        console.log('  USE_REAL_API:', process.env.USE_REAL_API);
        console.log('  NODE_ENV:', process.env.NODE_ENV);
        
        if (useRealApi) {
          // Use the VyOS GraphQL API
          try {
            console.log('[Dashboard] Attempting to fetch memory data from VyOS API');
            const memoryData = await vyosApi.systemResources.getMemory();
            console.log('[Dashboard] Memory data from API:', memoryData);
            
            // Since we're transitioning, we'll integrate the new API data
            // with the existing data structure
            console.log('[Dashboard] Updating resources state with memory data');
            setResources(prevResources => {
              console.log('[Dashboard] Previous resources:', prevResources);
              const newResources = {
                ...prevResources,
                memory: memoryData
              };
              console.log('[Dashboard] New resources:', newResources);
              return newResources;
            });
            
            // For CPU and Storage, we use zeros instead of mock data
            const cpuData = {
              usage: 0,
              cores: 0,
              load: [0, 0, 0]
            };
            
            const storageData = {
              total: 0,
              used: 0,
              free: 0
            };
            
            console.log('[Dashboard] Setting complete resources state');
            setResources({
              cpu: cpuData,
              memory: memoryData,
              storage: storageData
            });
            
            // In the future, you would fetch all resources from the API:
            // const resourceData = await vyosApi.systemResources.getAllResources();
            // setResources(resourceData);
            
            // For interfaces, we return empty array instead of mock data
            setInterfaces([]);
            
            // System status and version
            setSystemStatus({
              hostname: 'vyos-router',
              uptime: 'Unknown',
              status: 'unknown'
            });
            
            setVersion({
              version: 'Unknown',
              buildDate: 'Unknown',
              architecture: 'Unknown'
            });
          } catch (apiError) {
            console.error('[Dashboard] ERROR FETCHING DATA FROM VYOS API:', apiError);
            console.error('[Dashboard] Error details:', apiError.stack);
            
            // Set a more detailed error message
            setError(`API Connection Error: ${apiError.message}. Check console for details.`);
            throw apiError;
          }
        } else {
          console.log('[Dashboard] Using zero values instead of mock data (USE_REAL_API is not true)');
          // Use zero values instead of mock data
          
          setSystemStatus({
            hostname: 'Unknown',
            uptime: 'Unknown',
            status: 'unknown'
          });
          
          setResources({
            cpu: {
              usage: 0,
              cores: 0,
              load: [0, 0, 0]
            },
            memory: {
              total: 0,
              used: 0,
              free: 0,
              buffers: 0,
              cached: 0,
              actualUsed: 0
            },
            storage: {
              total: 0,
              used: 0,
              free: 0
            }
          });
          
          // Empty array instead of mock interfaces
          setInterfaces([]);
          
          setVersion({
            version: 'Unknown',
            buildDate: 'Unknown',
            architecture: 'Unknown'
          });
        }
        
        setError(null);
      } catch (err) {
        console.error('[Dashboard] ⚠️ ERROR FETCHING DASHBOARD DATA:', err);
        console.error('[Dashboard] Error stack:', err.stack);
        
        // Set more detailed error message
        setError(`Failed to load dashboard data: ${err.message}. Please check the console for more details.`);
      } finally {
        setLoading(false);
        console.log('[Dashboard] =========================================\n');
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
        flexDirection="column" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="calc(100vh - 64px)"
        p={3}
      >
        <Paper sx={{ p: 3, bgcolor: '#2a2a2a', maxWidth: '800px', width: '100%' }}>
          <Typography variant="h5" color="error" sx={{ mb: 2 }}>
            Connection Error
          </Typography>
          
          <Typography color="error" sx={{ mb: 3 }}>
            {error}
          </Typography>
          
          <Divider sx={{ mb: 3, borderColor: 'rgba(255, 255, 255, 0.12)' }} />
          
          <Typography variant="h6" sx={{ mb: 2 }}>
            Troubleshooting Steps:
          </Typography>
          
          <Box component="ol" sx={{ pl: 2 }}>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography>
                Check that the VyOS router is running and accessible at: {process.env.REACT_APP_VYOS_API_ENDPOINT || process.env.VYOS_API_ENDPOINT || 'https://10.0.101.245/graphql'}
              </Typography>
            </Box>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography>
                Verify that the GraphQL API is enabled on the VyOS router
              </Typography>
            </Box>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography>
                Ensure that the API key is correct (currently using: {process.env.REACT_APP_VYOS_API_KEY || process.env.VYOS_API_KEY || 'test123'})
              </Typography>
            </Box>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography>
                Check browser console for detailed error messages (press F12 to open developer tools)
              </Typography>
            </Box>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography>
                Test the API connection directly with curl:
              </Typography>
              <Box sx={{ 
                backgroundColor: '#222', 
                p: 2, 
                borderRadius: 1, 
                my: 1,
                overflow: 'auto',
                fontSize: '0.75rem'
              }}>
                <code>
                  {`curl -k --raw '${process.env.REACT_APP_VYOS_API_ENDPOINT || process.env.VYOS_API_ENDPOINT || 'https://10.0.101.245/graphql'}' -H 'Content-Type: application/json' -d '{"query":" {\\n ShowMemory (data: {key: \\"${process.env.REACT_APP_VYOS_API_KEY || process.env.VYOS_API_KEY || 'test123'}\\"}) {success errors data {result}}}"}'`}
                </code>
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              If the problem persists, check the terminal output for additional error information.
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 500 }}>
        Dashboard
      </Typography>
      
      {/* Debug Panel - Only visible in development */}
      {process.env.NODE_ENV === 'development' && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#333333' }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#ffcc00' }}>
            API Debug Info
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Environment Variables:</Typography>
            <pre style={{ fontSize: '0.75rem', backgroundColor: '#222', padding: '8px', borderRadius: '4px', overflow: 'auto' }}>
              {JSON.stringify({
                NODE_ENV: process.env.NODE_ENV,
                USE_REAL_API: process.env.USE_REAL_API,
                REACT_APP_USE_REAL_API: process.env.REACT_APP_USE_REAL_API,
                VYOS_API_ENDPOINT: process.env.VYOS_API_ENDPOINT,
                REACT_APP_VYOS_API_ENDPOINT: process.env.REACT_APP_VYOS_API_ENDPOINT,
                VYOS_API_INSECURE: process.env.VYOS_API_INSECURE,
                REACT_APP_VYOS_API_INSECURE: process.env.REACT_APP_VYOS_API_INSECURE
              }, null, 2)}
            </pre>
          </Box>
          <Box>
            <Typography variant="subtitle2">Connection Status:</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box 
                sx={{ 
                  width: 12, 
                  height: 12, 
                  borderRadius: '50%', 
                  bgcolor: (process.env.USE_REAL_API === 'true' || process.env.REACT_APP_USE_REAL_API === 'true') ? '#4caf50' : '#f44336' 
                }} 
              />
              <Typography variant="body2">
                {(process.env.USE_REAL_API === 'true' || process.env.REACT_APP_USE_REAL_API === 'true') ? 'Using VyOS API' : 'API Connection Disabled'}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Configured API Endpoint: {process.env.REACT_APP_VYOS_API_ENDPOINT || process.env.VYOS_API_ENDPOINT || 'Not configured'}
            </Typography>
            
            <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <button 
                onClick={() => {
                  console.log('\n\n[Dashboard] *** MANUAL API TEST INITIATED ***');
                  
                  const endpoint = process.env.REACT_APP_VYOS_API_ENDPOINT || process.env.VYOS_API_ENDPOINT || 'https://10.0.101.245/graphql';
                  const apiKey = process.env.REACT_APP_VYOS_API_KEY || process.env.VYOS_API_KEY || 'test123';
                  
                  console.log(`[Dashboard] Testing connection to: ${endpoint}`);
                  console.log(`[Dashboard] Using API key: ${apiKey}`);
                  
                  const xhr = new XMLHttpRequest();
                  xhr.onreadystatechange = function() {
                    console.log(`[Dashboard] Test XHR state: ${xhr.readyState}`);
                    if (xhr.readyState === 4) {
                      console.log(`[Dashboard] Test completed with status: ${xhr.status}`);
                      if (xhr.status >= 200 && xhr.status < 300) {
                        console.log('[Dashboard] Success! Response:', xhr.responseText);
                        alert('API test successful! See console for details.');
                      } else {
                        console.error('[Dashboard] Test failed:', xhr.status, xhr.statusText);
                        console.error('[Dashboard] Response:', xhr.responseText || 'No response');
                        alert(`API test failed with status ${xhr.status}. See console for details.`);
                      }
                    }
                  };
                  
                  xhr.onerror = function(event) {
                    console.error('[Dashboard] Test network error:', event);
                    alert('API test failed due to network error. Check console for details.');
                  };
                  
                  try {
                    xhr.open('POST', endpoint, true);
                    xhr.setRequestHeader('Content-Type', 'application/json');
                    
                    const query = ` {
 ShowMemory(data: {key: "${apiKey}"}) {
  success
  errors
  data {
   result
  }
 }
}`;
                    
                    const payload = JSON.stringify({ query });
                    console.log('[Dashboard] Sending request with payload:', payload);
                    xhr.send(payload);
                  } catch (err) {
                    console.error('[Dashboard] Error sending test request:', err);
                    alert(`Error sending test request: ${err.message}`);
                  }
                }}
                style={{
                  backgroundColor: '#2196f3',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Test API Connection
              </button>
              
              <button
                onClick={() => {
                  const endpoint = process.env.REACT_APP_VYOS_API_ENDPOINT || process.env.VYOS_API_ENDPOINT || 'https://10.0.101.245/graphql';
                  const apiKey = process.env.REACT_APP_VYOS_API_KEY || process.env.VYOS_API_KEY || 'test123';
                  const command = `curl -k --raw '${endpoint}' -H 'Content-Type: application/json' -d '{"query":" {\\n ShowMemory (data: {key: \\"${apiKey}\\"}) {success errors data {result}}}"}'`;
                  
                  console.log('\n[Dashboard] Curl command to test API:');
                  console.log(command);
                  
                  navigator.clipboard.writeText(command)
                    .then(() => alert('Curl command copied to clipboard!'))
                    .catch(() => {
                      console.error('Failed to copy command');
                      alert('Failed to copy command to clipboard. See console for the command.');
                    });
                }}
                style={{
                  backgroundColor: '#4caf50',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Copy curl Command
              </button>
            </Box>
          </Box>
        </Paper>
      )}
      
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
                    value={resources && resources.memory ? 
                      Math.round((resources.memory.actualUsed || resources.memory.used) / resources.memory.total * 100) : 0}
                    size={60}
                    sx={{ color: '#4caf50' }}
                  />
                  <CircularProgress
                    variant="determinate"
                    value={resources && resources.memory ? 
                      Math.round(resources.memory.used / resources.memory.total * 100) : 0}
                    size={60}
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.3)', 
                      position: 'absolute',
                      left: 0
                    }}
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
                      {resources && resources.memory ? 
                        Math.round((resources.memory.actualUsed || resources.memory.used) / resources.memory.total * 100) : 0}%
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2">
                    Used: {resources?.memory ? 
                      `${Math.round((resources.memory.actualUsed || resources.memory.used))} MB` : 
                      '0 MB'} (excluding buffers/cache)
                  </Typography>
                  <Typography variant="body2">
                    Total: {resources?.memory ? `${Math.round(resources.memory.total)} MB` : '0 MB'}
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                    <Box 
                      sx={{ 
                        width: '12px', 
                        height: '12px', 
                        bgcolor: 'rgba(255, 255, 255, 0.3)', 
                        mr: 1, 
                        borderRadius: '2px' 
                      }} 
                    />
                    <Typography variant="caption">
                      Buffers/Cache: {resources?.memory ? 
                        `${Math.round((resources.memory.buffers || 0) + (resources.memory.cached || 0))} MB` : 
                        '0 MB'}
                    </Typography>
                  </Box>
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