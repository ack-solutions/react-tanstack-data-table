import { useEffect, useMemo, useState } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  FormControlLabel,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Switch,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  Stack,
  Chip,
  Collapse,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { configureDataTableLogging } from '@ackplus/react-tanstack-data-table';
import { navigationTree, NavNode } from '../content/navigation';
import { contentRegistry } from '../content/registry';
import { ThemeProvider } from '../theme/theme-provider';

const drawerWidth = 320;

const flattenItems = (nodes: NavNode[]): string[] => {
  const ids: string[] = [];
  const walk = (list: NavNode[]) => {
    list.forEach((node) => {
      if (node.type === 'item') {
        ids.push(node.id);
      }
      if (node.children) {
        walk(node.children);
      }
    });
  };
  walk(nodes);
  return ids;
};

const collectExpandable = (nodes: NavNode[]): string[] => {
  const ids: string[] = [];
  const walk = (list: NavNode[]) => {
    list.forEach((node) => {
      if (node.children && node.children.length > 0) {
        ids.push(node.id);
        walk(node.children);
      }
    });
  };
  walk(nodes);
  return ids;
};

export function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const itemIds = useMemo(() => flattenItems(navigationTree), []);
  const expandableIds = useMemo(() => collectExpandable(navigationTree), []);

  const getInitialSection = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const section = params.get('section');
      if (section && itemIds.includes(section)) {
        return section;
      }
    }
    return itemIds[0] ?? '';
  };

  const [activeSection, setActiveSection] = useState(getInitialSection);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(expandableIds));
  const [loggingEnabled, setLoggingEnabled] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem('datatable-logging') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    configureDataTableLogging({
      enabled: loggingEnabled,
      level: loggingEnabled ? 'debug' : 'warn',
      includeTimestamp: loggingEnabled,
    });

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('datatable-logging', loggingEnabled ? 'true' : 'false');
      } catch {
        // ignore
      }
    }
  }, [loggingEnabled]);

  useEffect(() => {
    if (typeof window !== 'undefined' && activeSection) {
      const url = new URL(window.location.href);
      url.searchParams.set('section', activeSection);
      window.history.pushState({}, '', url);
    }
  }, [activeSection]);

  useEffect(() => {
    const handler = () => setActiveSection(getInitialSection());
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderNav = (nodes: NavNode[], depth = 0) => (
    <List disablePadding>
      {nodes.map((node) => {
        const indent = depth * 16;
        if (node.type === 'item') {
          return (
            <ListItemButton
              key={node.id}
              onClick={() => {
                setActiveSection(node.id);
                if (isMobile) setMobileOpen(false);
              }}
              selected={activeSection === node.id}
              sx={{
                pl: 2 + indent / 8,
                py: 1,
                borderRadius: 1,
                mx: 1,
                my: 0.25,
                '&.Mui-selected': {
                  backgroundColor: 'action.selected',
                },
              }}
            >
              <ListItemText primary={node.title} primaryTypographyProps={{ fontWeight: 600 }} />
              {node.badge ? <Chip label={node.badge.toUpperCase()} size="small" color="success" /> : null}
            </ListItemButton>
          );
        }

        if (node.type === 'label') {
          const isOpen = expanded.has(node.id);
          return (
            <Box key={node.id} sx={{ mt: 2 }}>
              <ListItemButton
                onClick={() => toggleExpand(node.id)}
                sx={{ pl: 2 + indent / 8, py: 0.75, opacity: 0.9 }}
              >
                <ListItemText
                  primary={node.title}
                  primaryTypographyProps={{
                    variant: 'overline',
                    letterSpacing: 1.2,
                    fontWeight: 700,
                  }}
                />
                {isOpen ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
              </ListItemButton>
              <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <Box sx={{ ml: 1 }}>{node.children ? renderNav(node.children, depth + 1) : null}</Box>
              </Collapse>
            </Box>
          );
        }

        return (
          <Box key={node.id} sx={{ mt: 1 }}>
            <Typography variant="overline" sx={{ px: 3, color: 'text.secondary', letterSpacing: 1.2, fontWeight: 700 }}>
              {node.title}
            </Typography>
            {node.children ? renderNav(node.children, depth + 1) : null}
          </Box>
        );
      })}
    </List>
  );

  const drawer = (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1, py: 1 }}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ letterSpacing: 1, textTransform: 'uppercase' }}>
            Data Grid
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Docs & Demos
          </Typography>
        </Box>
      </Stack>
      {renderNav(navigationTree)}
    </Box>
  );

  const ActiveComponent = contentRegistry[activeSection] ?? contentRegistry[itemIds[0]];

  return (
    <ThemeProvider>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar
          position="fixed"
          sx={{
            width: { md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` },
            boxShadow: 'none',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
          color="inherit"
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 700 }}>
              MUI TanStack DataTable
            </Typography>
            <FormControlLabel
              control={<Switch checked={loggingEnabled} onChange={(_, checked) => setLoggingEnabled(checked)} color="primary" />}
              label="Verbose logs"
            />
          </Toolbar>
        </AppBar>
        <Box
          component="nav"
          sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
          aria-label="navigation"
        >
          <Drawer
            variant={isMobile ? 'temporary' : 'permanent'}
            open={isMobile ? mobileOpen : true}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
                borderRight: '1px solid',
                borderColor: 'divider',
              },
            }}
          >
            {drawer}
          </Drawer>
        </Box>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, md: 4 },
            width: { md: `calc(100% - ${drawerWidth}px)` },
          }}
        >
          <Toolbar />
          <Box sx={{ maxWidth: 1200, mx: 'auto', width: '100%' }}>
            {ActiveComponent ? <ActiveComponent /> : null}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
