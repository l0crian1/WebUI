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
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ExpandMore as ExpandMoreIcon,
  Router as RouterIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

// Drawer width
const drawerWidth = 284;

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    Overview: true,
    Routing: true
  });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSectionToggle = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  const mainMenuItems = [
    { 
      section: 'Overview',
      icon: <DashboardIcon />,
      items: [
        { text: 'Dashboard' }
      ]
    },
    { 
      section: 'Routing', 
      icon: <RouterIcon />,
      items: [
        { text: 'BGP' },
        { text: 'Static' }
      ]
    },
  ];

  const drawer = (
    <Box sx={{ bgcolor: '#252525', height: '100%' }}>
      <List sx={{ p: 0 }}>
        {mainMenuItems.map((section) => (
          <Box key={section.section}>
            <ListItem 
              disablePadding 
              sx={{ 
                display: 'block',
                py: 0
              }}
            >
              <ListItemButton
                onClick={() => handleSectionToggle(section.section)}
                sx={{
                  py: 1.5,
                  px: 2,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.08)'
                  }
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    minWidth: 40,
                    color: 'rgba(255,255,255,0.7)'
                  }}
                >
                  {section.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={section.section} 
                  sx={{ 
                    '& .MuiTypography-root': { 
                      fontSize: '0.95rem',
                      fontWeight: 500,
                      color: 'white'
                    }
                  }}
                />
                <ExpandMoreIcon 
                  sx={{ 
                    color: 'rgba(255,255,255,0.5)',
                    transform: expandedSections[section.section] ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s'
                  }} 
                />
              </ListItemButton>
            </ListItem>
            
            {expandedSections[section.section] && (
              <List disablePadding>
                {section.items.map((item) => (
                  <ListItem 
                    key={item.text} 
                    disablePadding
                    sx={{ 
                      display: 'block',
                    }}
                  >
                    <ListItemButton
                      sx={{
                        py: 1.5,
                        pl: 7,
                        pr: 2,
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.08)'
                        }
                      }}
                    >
                      <ListItemText 
                        primary={item.text} 
                        sx={{ 
                          '& .MuiTypography-root': { 
                            fontSize: '0.9rem',
                            fontWeight: 400,
                            color: 'white'
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
          width: '100%',
          bgcolor: '#000000',
          zIndex: (theme) => theme.zIndex.drawer + 1,
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
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              color: 'white',
              fontWeight: 500
            }}
          >
            VyOS WebUI
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: 'border-box',
            bgcolor: '#252525',
            borderRight: 'none',
            mt: '64px', // Height of AppBar
            height: 'calc(100% - 64px)' // Subtract AppBar height
          },
          display: { xs: 'none', sm: 'block' }
        }}
      >
        {drawer}
      </Drawer>
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
            width: drawerWidth,
            bgcolor: '#252525',
            borderRight: 'none'
          },
        }}
      >
        {drawer}
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: '64px', // Height of AppBar
          width: { sm: `calc(100% - ${drawerWidth}px)` }
        }}
      >
        {/* Main content will go here */}
      </Box>
    </Box>
  );
}

export default App; 