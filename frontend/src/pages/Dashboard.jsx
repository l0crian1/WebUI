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
      setLoading(true);
      try {
        // Determine if we should use mock data or real API
        const useRealApi = process.env.USE_REAL_API === 'true';
        
        if (useRealApi) {
          // Use the VyOS GraphQL API
          try {
            const memoryData = await vyosApi.systemResources.getMemory();
            
            // Since we're transitioning, we'll integrate the new API data
            // with the existing data structure
            setResources(prevResources => ({
              ...prevResources,
              memory: {
                total: memoryData.total,
                used: memoryData.used,
                free: memoryData.free
              }
            }));
            
            // For CPU and Storage, we can continue using mock data during the transition
            const cpuData = {
              usage: 32,
              cores: 4,
              load: [0.52, 0.48, 0.42]
            };
            
            const storageData = {
              total: 32768,
              used: 12288,
              free: 20480
            };
            
            setResources({
              cpu: cpuData,
              memory: memoryData,
              storage: storageData
            });
            
            // In the future, you would fetch all resources from the API:
            // const resourceData = await vyosApi.systemResources.getAllResources();
            // setResources(resourceData);
            
            // For interfaces, we can use mock data during transition
            setInterfaces([
              { name: 'eth0', status: 'up', ipv4: '192.168.1.1/24', ipv6: 'fe80::1/64', rx_bytes: 1024000, tx_bytes: 512000 },
              { name: 'eth1', status: 'up', ipv4: '10.0.0.1/24', ipv6: 'fe80::2/64', rx_bytes: 512000, tx_bytes: 256000 },
              { name: 'eth2', status: 'down', ipv4: null, ipv6: null, rx_bytes: 0, tx_bytes: 0 }
            ]);
            
            // System status and version
            setSystemStatus({
              hostname: 'vyos-router',
              uptime: '10 days, 4 hours, 30 minutes',
              status: 'running'
            });
            
            setVersion({
              version: 'VyOS 1.4.0',
              buildDate: '2023-01-15',
              architecture: 'x86_64'
            });
          } catch (apiError) {
            console.error('Error fetching data from VyOS API:', apiError);
            throw apiError;
          }
        } else {
          // Use mock data for development
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