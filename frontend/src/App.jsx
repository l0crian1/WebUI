import { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Container,
  Paper,
  Grid,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  NetworkCheck as NetworkIcon,
  Security as FirewallIcon,
  Code as ConfigIcon,
  Terminal as CommandIcon,
} from '@mui/icons-material';
import Logo from './Logo';

// Drawer width
const drawerWidth = 240;

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon /> },
    { text: 'Network', icon: <NetworkIcon /> },
    { text: 'Firewall', icon: <FirewallIcon /> },
    { text: 'Configuration', icon: <ConfigIcon /> },
    { text: 'Command Line', icon: <CommandIcon /> },
  ];

  const drawer = (
    <Box>
      <Toolbar sx={{ justifyContent: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Logo />
          <Typography variant="h6" noWrap component="div">
            VyOS WebUI
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            VyOS WebUI
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
          <Logo sx={{ width: 60, height: 60 }} />
          <Box>
            <Typography variant="h4" gutterBottom>
              Welcome to VyOS WebUI
            </Typography>
            <Typography variant="body1">
              A modern web interface for the VyOS routing platform
            </Typography>
          </Box>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                System Information
              </Typography>
              <Typography variant="body2">
                Connect to your VyOS router to see system information
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Network Interfaces
              </Typography>
              <Typography variant="body2">
                Connect to your VyOS router to manage network interfaces
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default App; 