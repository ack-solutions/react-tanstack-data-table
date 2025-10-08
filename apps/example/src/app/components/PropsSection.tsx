import { Box, Typography, Paper, Accordion, AccordionSummary, AccordionDetails, Table, TableBody, TableCell, TableHead, TableRow, Stack } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const propGroups = [
  {
    title: 'Core Data & Structure',
    description: 'Essential props required to render a table and control its shape.',
    items: [
      { name: 'columns', type: 'DataTableColumn<T>[]', defaultValue: 'required', description: 'Column configuration built on TanStack definitions with slot-friendly helpers.' },
      { name: 'data', type: 'T[]', defaultValue: '[]', description: 'Static data used in client mode tables. Combine with filtering and sorting in-memory.' },
      { name: 'totalRow', type: 'number', defaultValue: '0', description: 'Total row count surfaced when the table is driven from a paged API.' },
      { name: 'idKey', type: 'keyof T', defaultValue: "'id'", description: 'Key used to generate stable row identifiers for selection, expansion, and updates.' },
    ],
  },
  {
    title: 'Server Integration & State',
    description: 'Switch the component into server mode and respond to state updates.',
    items: [
      { name: 'dataMode', type: "'client' | 'server'", defaultValue: "'client'", description: 'Enables server-driven pagination, filtering, and sorting when set to server.' },
      { name: 'onFetchData', type: '(filters) => Promise<{data, total}>', defaultValue: 'undefined', description: 'Async callback invoked in server mode to retrieve rows using the current table state.' },
      { name: 'onDataStateChange', type: '(state) => void', defaultValue: 'undefined', description: 'Fires whenever filters, pagination, sorting, or selection changes. Useful for syncing URL state.' },
      { name: 'initialState', type: 'Partial<TableState>', defaultValue: 'undefined', description: 'Seed sorting, pagination, column visibility, and filters before the table mounts.' },
    ],
  },
  {
    title: 'Selection & Bulk Actions',
    description: 'Control how users select rows and execute batch operations.',
    items: [
      { name: 'enableRowSelection', type: 'boolean | ((row) => boolean)', defaultValue: 'false', description: 'Turn on row selection or supply a predicate to disable rows individually.' },
      { name: 'enableMultiRowSelection', type: 'boolean', defaultValue: 'true', description: 'Allow toggling multiple rows at once. Combine with selectMode for all-page selection.' },
      { name: 'selectMode', type: "'page' | 'all'", defaultValue: "'page'", description: 'Choose between page-scoped selection or whole-dataset selection helpers.' },
      { name: 'onSelectionChange', type: '(selection: SelectionState) => void', defaultValue: 'undefined', description: 'Receive selection details including inclusion/exclusion ids and total counts.' },
    ],
  },
  {
    title: 'Filtering & Search',
    description: 'Configure search and filtering capabilities.',
    items: [
      { name: 'enableGlobalFilter', type: 'boolean', defaultValue: 'true', description: 'Enable global search across all columns.' },
      { name: 'enableColumnFilter', type: 'boolean', defaultValue: 'false', description: 'Enable individual column filters.' },
      { name: 'filterMode', type: "'client' | 'server'", defaultValue: "'client'", description: 'Choose between client-side or server-side filtering.' },
      { name: 'onGlobalFilterChange', type: '(filter: string) => void', defaultValue: 'undefined', description: 'Callback when global filter changes.' },
    ],
  },
  {
    title: 'Pagination & Sorting',
    description: 'Control data navigation and ordering.',
    items: [
      { name: 'enablePagination', type: 'boolean', defaultValue: 'true', description: 'Enable pagination controls.' },
      { name: 'paginationMode', type: "'client' | 'server'", defaultValue: "'client'", description: 'Choose between client-side or server-side pagination.' },
      { name: 'enableSorting', type: 'boolean', defaultValue: 'true', description: 'Enable column sorting.' },
      { name: 'sortingMode', type: "'client' | 'server'", defaultValue: "'client'", description: 'Choose between client-side or server-side sorting.' },
    ],
  },
  {
    title: 'Export & Customization',
    description: 'Data export and UI customization options.',
    items: [
      { name: 'enableExport', type: 'boolean', defaultValue: 'true', description: 'Enable CSV/Excel export functionality.' },
      { name: 'exportFilename', type: 'string', defaultValue: "'export'", description: 'Default filename for exports.' },
      { name: 'slots', type: 'Partial<DataTableSlots<T>>', defaultValue: 'undefined', description: 'Custom component slots for UI customization.' },
      { name: 'slotProps', type: 'PartialSlotProps<T>', defaultValue: 'undefined', description: 'Props for slot components.' },
    ],
  },
];

export function PropsSection() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
        Props & Configuration
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Comprehensive reference for all available props, organized by functionality.
      </Typography>

      <Stack spacing={2} sx={{ mb: 4 }}>
        <Typography variant="body1">
          The DataTable component accepts a wide range of props to customize its behavior and appearance. 
          Props are organized into logical groups based on their functionality.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Click on the accordion sections below to explore different prop categories. Each prop includes 
          its TypeScript type, default value, and a description of its purpose.
        </Typography>
      </Stack>

      <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        {propGroups.map((group, index) => (
          <Accordion key={group.title} defaultExpanded={index < 2} disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {group.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {group.description}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small" sx={{ minWidth: 600 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Prop</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Default</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {group.items.map((item) => (
                      <TableRow key={`${group.title}-${item.name}`} hover>
                        <TableCell sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{item.name}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                          {item.type}
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                          {item.defaultValue}
                        </TableCell>
                        <TableCell>{item.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>
    </Box>
  );
}
