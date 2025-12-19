import { Paper, Stack, Typography } from '@mui/material';
import { FeatureLayout } from './common/FeatureLayout';
import { CodeBlock } from './common/CodeBlock';

export function LocalizationPage() {
  return (
    <FeatureLayout
      title="Localization"
      subtitle="Advanced Features"
      description="Adapt labels, date formats, and number rendering to match your audience."
    >
      <Stack spacing={3}>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            Strings and labels
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Override toolbar text, empty states, and filter placeholders via the `labels` prop, or swap entire slot components to align with your language pack.
          </Typography>
          <CodeBlock
            language="tsx"
            code={`<DataTable
  {...props}
  labels={{
    toolbar: {
      globalFilterPlaceholder: 'Suche',
      export: 'Exportieren',
    },
    empty: 'Keine Einträge gefunden',
  }}
/>`}
          />
        </Paper>

        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            Dates and numbers
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Provide formatted strings from your data source, or use the cell renderer to format with `Intl.DateTimeFormat` / `Intl.NumberFormat` so sorting still works on raw values.
          </Typography>
        </Paper>
      </Stack>
    </FeatureLayout>
  );
}
