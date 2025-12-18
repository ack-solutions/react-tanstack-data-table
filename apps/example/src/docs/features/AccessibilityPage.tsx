import { Paper, Stack, Typography, List, ListItem, ListItemText } from '@mui/material';
import { FeatureLayout } from './common/FeatureLayout';

export function AccessibilityPage() {
  return (
    <FeatureLayout
      title="Accessibility"
      subtitle="Advanced Features"
      description="Keyboard-first interactions, ARIA labelling, and focus management help the grid stay usable for everyone."
    >
      <Stack spacing={3}>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            Keyboard interactions
          </Typography>
          <List dense>
            {[
              'Tab/Shift+Tab to move between toolbar, header, and body',
              'Arrow keys to navigate cells in a row',
              'Space/Enter to toggle row selection',
              'Esc to close menus or reset focus traps',
            ].map((text) => (
              <ListItem key={text} disablePadding>
                <ListItemText primary={text} />
              </ListItem>
            ))}
          </List>
        </Paper>

        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            Labelling
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Use the `getRowId` prop for stable identifiers, and prefer descriptive column headers. When rendering custom cells, include `aria-label` or `title` for non-textual controls.
          </Typography>
        </Paper>
      </Stack>
    </FeatureLayout>
  );
}
