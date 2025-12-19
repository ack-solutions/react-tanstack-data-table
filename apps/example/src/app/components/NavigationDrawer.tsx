import { Box, Drawer, Typography } from '@mui/material';
import { NavNode } from '../../content/navigation';
import { NavigationTree } from './NavigationTree';

interface NavigationDrawerProps {
  drawerWidth: number;
  isMobile: boolean;
  mobileOpen: boolean;
  navigationTree: NavNode[];
  activeSection: string;
  expanded: Set<string>;
  onClose: () => void;
  onItemClick: (id: string) => void;
  onToggleExpand: (id: string) => void;
}

export function NavigationDrawer({
  drawerWidth,
  isMobile,
  mobileOpen,
  navigationTree,
  activeSection,
  expanded,
  onClose,
  onItemClick,
  onToggleExpand,
}: NavigationDrawerProps) {
  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Compact Header */}
      <Box sx={{ px: 2, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700,
            fontSize: '1.1rem',
            lineHeight: 1.2
          }}
        >
          Docs & Demos
        </Typography>
      </Box>
      
      {/* Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        <NavigationTree
          nodes={navigationTree}
          activeSection={activeSection}
          expanded={expanded}
          isMobile={isMobile}
          onItemClick={onItemClick}
          onToggleExpand={onToggleExpand}
        />
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }} aria-label="navigation">
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={onClose}
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
        {drawerContent}
      </Drawer>
    </Box>
  );
}
