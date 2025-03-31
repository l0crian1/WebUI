import { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Paper,
  Container,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Apps as AppsIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Devices as DevicesIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import Logo from './Logo';

// Drawer width
const drawerWidth = 284;

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState('Signing in');

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const mainMenuItems = [
    { text: 'Personal info', icon: <PersonIcon /> },
    { 
      text: 'Account security', 
      icon: <SecurityIcon />,
      expandable: true,
      subItems: [
        { text: 'Signing in', selected: true },
        { text: 'Device activity' },
        { text: 'Linked accounts' }
      ]
    },
    { text: 'Applications', icon: <AppsIcon /> },
    { text: 'Resources', icon: <InfoIcon /> },
  ];

  const drawer = (
    <Box sx={{ bgcolor: '#151515', height: '100%' }}>
      <Toolbar sx={{ minHeight: '64px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Logo sx={{ width: 32, height: 32, mr: 1, color: 'white' }} />
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              color: 'white',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontWeight: 300
            }}
          >
            Zerotier
          </Typography>
        </Box>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />
      <List sx={{ p: 0 }}>
        {mainMenuItems.map((item) => (
          <Box key={item.text}>
            <ListItem 
              disablePadding 
              sx={{ 
                display: 'block',
                py: 0
              }}
            >
              <ListItemButton
                sx={{
                  py: 1.5,
                  px: 2,
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    minWidth: 40,
                    color: 'rgba(255,255,255,0.7)'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    '& .MuiTypography-root': { 
                      fontSize: '0.95rem',
                      fontWeight: item.expandable ? 500 : 400
                    }
                  }}
                />
                {item.expandable && (
                  <ExpandMoreIcon sx={{ color: 'rgba(255,255,255,0.5)' }} />
                )}
              </ListItemButton>
            </ListItem>
            
            {item.expandable && item.subItems && (
              <List disablePadding>
                {item.subItems.map((subItem) => (
                  <ListItem 
                    key={subItem.text} 
                    disablePadding
                    sx={{ 
                      display: 'block',
                      bgcolor: subItem.selected ? '#252525' : 'transparent',
                      borderLeft: subItem.selected ? '4px solid white' : 'none',
                    }}
                  >
                    <ListItemButton
                      sx={{
                        py: 1.5,
                        pl: 7,
                        pr: 2,
                      }}
                      selected={subItem.selected}
                    >
                      <ListItemText 
                        primary={subItem.text} 
                        sx={{ 
                          '& .MuiTypography-root': { 
                            fontSize: '0.9rem',
                            fontWeight: subItem.selected ? 500 : 400
                          }
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
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
          display: { sm: 'none' },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            ZeroTier
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="navigation"
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
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              bgcolor: '#151515'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              bgcolor: '#151515'
            },
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
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: '#1e1e1e',
          color: 'white',
          pt: { xs: 8, sm: 3 },
          px: { xs: 2, sm: 4 },
        }}
      >
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 400 }}>
            Signing in
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 4, color: 'rgba(255,255,255,0.7)' }}>
            Configure ways to sign in.
          </Typography>
          
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 400 }}>
            Basic authentication
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 400, fontSize: '1rem', mb: 1 }}>
              Password
            </Typography>
            
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
              Sign in by entering your password.
            </Typography>
            
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)', my: 2 }} />
            
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', textAlign: 'right' }}>
              Password is not set up.
            </Typography>
            
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)', mt: 2 }} />
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default App; 