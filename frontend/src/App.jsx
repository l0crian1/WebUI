import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
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
import Dashboard from './pages/Dashboard';

// Dummy components for routes that haven't been created yet
const BgpRoute = () => <div>BGP Route Page</div>;
const StaticRoute = () => <div>Static Route Page</div>;

// Drawer width
const drawerWidth = 284;

function AppContent() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    Overview: true,
    Routing: true
  });
  const [selectedItem, setSelectedItem] = useState('Dashboard');
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Set the selected item based on the current path when the component mounts
  useState(() => {
    const path = location.pathname;
    if (path === '/') {
      setSelectedItem('Dashboard');
    } else if (path === '/routing/bgp') {
      setSelectedItem('BGP');
    } else if (path === '/routing/static') {
      setSelectedItem('Static');
    }
  }, [location.pathname]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSectionToggle = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  const handleItemSelect = (item, path) => {
    setSelectedItem(item);
    if (path) {
      navigate(path);
    }
  };

  const mainMenuItems = [
    { 
      section: 'Overview',
      icon: <DashboardIcon />,
      items: [
        { text: 'Dashboard', path: '/' }
      ]
    },
    { 
      section: 'Routing', 
      icon: <RouterIcon />,
      items: [
        { text: 'BGP', path: '/routing/bgp' },
        { text: 'Static', path: '/routing/static' }
      ]
    },
  ];

  const drawer = (
    <Box sx={{ bgcolor: '#252525', height: '100%' }}>
      <List sx={{ p: 0 }}>
        {mainMenuItems.map((section, index) => (
          <Box key={section.section}>
            <ListItem 
              disablePadding 
              sx={{ 
                display: 'block',
                py: 0,
                bgcolor: !section.items.some(item => item.text === selectedItem) && selectedItem === section.section ? '#333333' : 'transparent',
                borderLeft: !section.items.some(item => item.text === selectedItem) && selectedItem === section.section ? '4px solid white' : 'none',
              }}
            >
              <ListItemButton
                onClick={() => {
                  handleSectionToggle(section.section);
                  if (!section.items || section.items.length === 0) {
                    handleItemSelect(section.section);
                  }
                }}
                sx={{
                  py: 1.5,
                  px: 2,
                  pl: !section.items.some(item => item.text === selectedItem) && selectedItem === section.section ? 1.6 : 2,
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
                {section.items.map((item, itemIndex) => (
                  <ListItem 
                    key={item.text} 
                    disablePadding
                    sx={{ 
                      display: 'block',
                      bgcolor: selectedItem === item.text ? '#333333' : 'transparent',
                      borderLeft: selectedItem === item.text ? '4px solid white' : 'none',
                    }}
                  >
                    <ListItemButton
                      onClick={() => handleItemSelect(item.text, item.path)}
                      sx={{
                        py: 1.2,
                        pl: selectedItem === item.text ? 8.6 : 9,
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
                            fontSize: '0.85rem',
                            fontWeight: selectedItem === item.text ? 500 : 400,
                            color: 'white'
                          }
                        }}
                      />
                    </ListItemButton>
                    {itemIndex < section.items.length - 1 && (
                      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />
                    )}
                  </ListItem>
                ))}
              </List>
            )}
            
            {index < mainMenuItems.length - 1 && (
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />
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
          p: 0,
          mt: '64px', // Height of AppBar
          width: { sm: `calc(100% - ${drawerWidth}px)` }
        }}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/routing/bgp" element={<BgpRoute />} />
          <Route path="/routing/static" element={<StaticRoute />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App; 