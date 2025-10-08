import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  Container,
  Typography,
  Box,
  Stack,
  Chip,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import CodeIcon from '@mui/icons-material/Code';
import ApiIcon from '@mui/icons-material/Api';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import InfoIcon from '@mui/icons-material/Info';

// Import documentation components
import { OverviewSection } from './components/OverviewSection';
import { QuickStartSection } from './components/QuickStartSection';
import { PropsSection } from './components/PropsSection';
import { ApiSection } from './components/ApiSection';
import { ExamplesSection } from './components/ExamplesSection';

// Import feature documentation pages
import { ColumnsPage } from './components/features/ColumnsPage';
import { ToolbarPage } from './components/features/ToolbarPage';
import { ExportPage } from './components/features/ExportPage';
import { SelectionPage } from './components/features/SelectionPage';
import { FilteringPage } from './components/features/FilteringPage';
import { SortingPage } from './components/features/SortingPage';
import { PaginationPage } from './components/features/PaginationPage';
import { VirtualizationPage } from './components/features/VirtualizationPage';
import { PinningPage } from './components/features/PinningPage';
import { ExpansionPage } from './components/features/ExpansionPage';
import { DataTablePropsPage } from './components/features/DataTablePropsPage';

const drawerWidth = 280;

const navigationItems = [
  { id: 'overview', label: 'Overview', icon: HomeIcon, section: 'Getting Started' },
  { id: 'quickstart', label: 'Quick Start', icon: CodeIcon, section: 'Getting Started' },
  { id: 'examples', label: 'Examples', icon: PlayArrowIcon, section: 'Getting Started' },
  { id: 'columns', label: 'Columns', icon: InfoIcon, section: 'Main Features' },
  { id: 'filtering', label: 'Filtering', icon: InfoIcon, section: 'Main Features' },
  { id: 'pinning', label: 'Pinning', icon: InfoIcon, section: 'Main Features' },
  { id: 'sorting', label: 'Sorting', icon: InfoIcon, section: 'Main Features' },
  { id: 'pagination', label: 'Pagination', icon: InfoIcon, section: 'Main Features' },
  { id: 'selection', label: 'Selection', icon: InfoIcon, section: 'Main Features' },
  { id: 'expansion', label: 'Row Expansion', icon: InfoIcon, section: 'Main Features' },
  { id: 'virtualization', label: 'Virtualization', icon: InfoIcon, section: 'Advanced Features' },
  { id: 'toolbar', label: 'Toolbar', icon: InfoIcon, section: 'Customization' },
  { id: 'export', label: 'Export', icon: InfoIcon, section: 'Advanced Features' },
  { id: 'datatable-props', label: 'DataTable Props', icon: InfoIcon, section: 'API Reference' },
  { id: 'column-props', label: 'Column Props', icon: InfoIcon, section: 'API Reference' },
  { id: 'api', label: 'API Methods', icon: ApiIcon, section: 'API Reference' },
];

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#f8f9fa',
          borderRight: '1px solid #e0e0e0',
        },
      },
    },
  },
});

export function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Get initial section from URL query params
  const getInitialSection = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const section = params.get('section');
      if (section && navigationItems.some(item => item.id === section)) {
        return section;
      }
    }
    return 'overview';
  };

  const [activeSection, setActiveSection] = useState(getInitialSection());

  // Update URL when section changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('section', activeSection);
      window.history.pushState({}, '', url);
    }
  }, [activeSection]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setActiveSection(getInitialSection());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection />;
      case 'quickstart':
        return <QuickStartSection />;
      case 'examples':
        return <ExamplesSection />;
      case 'columns':
        return <ColumnsPage />;
      case 'filtering':
        return <FilteringPage />;
      case 'sorting':
        return <SortingPage />;
      case 'pinning':
        return <PinningPage />;
      case 'pagination':
        return <PaginationPage />;
      case 'selection':
        return <SelectionPage />;
      case 'expansion':
        return <ExpansionPage />;
      case 'virtualization':
        return <VirtualizationPage />;
      case 'toolbar':
        return <ToolbarPage />;
      case 'export':
        return <ExportPage />;
      case 'datatable-props':
        return <DataTablePropsPage />;
      case 'column-props':
        return <ColumnsPage />;
      case 'api':
        return <ApiSection />;
      case 'props':
        return <PropsSection />;
      default:
        return <OverviewSection />;
    }
  };

  // Group navigation items by section
  const groupedNavItems = navigationItems.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, typeof navigationItems>);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 1, width: 1 }}>
        <AppBar
          position="fixed"
          sx={{
            zIndex: 5000,
          }}
        >
          <Toolbar sx={{
            pl: { md: `${drawerWidth + 24}px` },
          }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              React TanStack Data Table
            </Typography>
          </Toolbar>
        </AppBar>

        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto', py: 2 }}>
            {Object.entries(groupedNavItems).map(([section, items]) => (
              <Box key={section} sx={{ mb: 2 }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    px: 2, 
                    py: 1, 
                    display: 'block',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'text.secondary',
                    letterSpacing: 1.2,
                  }}
                >
                  {section}
                </Typography>
                <List disablePadding>
                  {items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <ListItemButton
                        key={item.id}
                        selected={activeSection === item.id}
                        onClick={() => handleSectionChange(item.id)}
                        sx={{
                          px: 2,
                          '&.Mui-selected': {
                            backgroundColor: 'primary.light',
                            color: 'primary.contrastText',
                            borderLeft: '3px solid',
                            borderColor: 'primary.main',
                            '&:hover': {
                              backgroundColor: 'primary.main',
                            },
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Icon color={activeSection === item.id ? 'inherit' : 'action'} fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={item.label}
                          primaryTypographyProps={{ 
                            fontSize: '0.875rem',
                            fontWeight: activeSection === item.id ? 600 : 400,
                          }} 
                        />
                      </ListItemButton>
                    );
                  })}
                </List>
              </Box>
            ))}
          </Box>
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto', py: 2 }}>
            {Object.entries(groupedNavItems).map(([section, items]) => (
              <Box key={section} sx={{ mb: 2 }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    px: 2, 
                    py: 1, 
                    display: 'block',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'text.secondary',
                    letterSpacing: 1.2,
                  }}
                >
                  {section}
                </Typography>
                <List disablePadding>
                  {items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <ListItemButton
                        key={item.id}
                        selected={activeSection === item.id}
                        onClick={() => handleSectionChange(item.id)}
                        sx={{
                          px: 2,
                          '&.Mui-selected': {
                            backgroundColor: 'primary.light',
                            color: 'primary.contrastText',
                            borderLeft: '3px solid',
                            borderColor: 'primary.main',
                            '&:hover': {
                              backgroundColor: 'primary.main',
                            },
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Icon color={activeSection === item.id ? 'inherit' : 'action'} fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={item.label}
                          primaryTypographyProps={{ 
                            fontSize: '0.875rem',
                            fontWeight: activeSection === item.id ? 600 : 400,
                          }} 
                        />
                      </ListItemButton>
                    );
                  })}
                </List>
              </Box>
            ))}
          </Box>
        </Drawer>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            pl: `${drawerWidth + 24}px`,
            mt: 10,
          }}
        >
          {renderContent()}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
