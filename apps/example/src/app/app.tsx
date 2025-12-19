import { Box, Container, CssBaseline, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { navigationTree } from '../content/navigation';
import { contentRegistry } from '../content/registry';
import { ThemeProvider } from '../theme/theme-provider';
import { AppHeader } from './components/AppHeader';
import { NavigationDrawer } from './components/NavigationDrawer';
import { useNavigation } from './hooks/useNavigation';
import { useLogging } from './hooks/useLogging';

const DRAWER_WIDTH = 260;

export function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const {
    activeSection,
    expanded,
    mobileOpen,
    itemIds,
    handleItemClick,
    handleToggleExpand,
    handleDrawerToggle,
  } = useNavigation(navigationTree);

  const { loggingEnabled, setLoggingEnabled } = useLogging();

  const ActiveComponent = contentRegistry[activeSection] ?? contentRegistry[itemIds[0]];

  return (
    <ThemeProvider>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />

        <AppHeader
          drawerWidth={DRAWER_WIDTH}
          onMenuClick={handleDrawerToggle}
          loggingEnabled={loggingEnabled}
          onLoggingChange={setLoggingEnabled}
        />

        <NavigationDrawer
          drawerWidth={DRAWER_WIDTH}
          isMobile={isMobile}
          mobileOpen={mobileOpen}
          navigationTree={navigationTree}
          activeSection={activeSection}
          expanded={expanded}
          onClose={handleDrawerToggle}
          onItemClick={handleItemClick}
          onToggleExpand={handleToggleExpand}
        />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, md: 4 },
            width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          }}
        >
          <Toolbar />
          <Container maxWidth={false}>
            {ActiveComponent ? <ActiveComponent /> : null}
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
