import { AppBar, FormControlLabel, IconButton, Switch, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

interface AppHeaderProps {
  drawerWidth: number;
  onMenuClick: () => void;
  loggingEnabled: boolean;
  onLoggingChange: (enabled: boolean) => void;
}

export function AppHeader({ drawerWidth, onMenuClick, loggingEnabled, onLoggingChange }: AppHeaderProps) {
  return (
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
          onClick={onMenuClick}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 700 }}>
          MUI TanStack DataTable
        </Typography>
        <FormControlLabel
          control={
            <Switch 
              checked={loggingEnabled} 
              onChange={(_, checked) => onLoggingChange(checked)} 
              color="primary" 
            />
          }
          label="Verbose logs"
        />
      </Toolbar>
    </AppBar>
  );
}
