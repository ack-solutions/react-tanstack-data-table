import { Box, Typography, Paper, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemIcon, ListItemText, Stack } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ApiIcon from '@mui/icons-material/Api';

const apiGroups = [
  {
    title: 'Column Management',
    description: 'Programmatically control column visibility, ordering, and layout.',
    methods: [
      {
        name: 'columnVisibility.showColumn',
        signature: '(columnId: string) => void',
        description: 'Reveal a hidden column, useful when applying saved views.',
      },
      {
        name: 'columnVisibility.hideColumn',
        signature: '(columnId: string) => void',
        description: 'Hide a specific column from the table.',
      },
      {
        name: 'columnOrdering.setColumnOrder',
        signature: '(order: string[]) => void',
        description: 'Reorder columns in bulk (drag-and-drop persistence, saved templates).',
      },
      {
        name: 'columnPinning.setPinning',
        signature: '(pinning: ColumnPinningState) => void',
        description: 'Pin columns left or right to keep key fields visible while scrolling.',
      },
    ],
  },
  {
    title: 'Filtering & Sorting',
    description: 'Control search, filters, and sorting programmatically.',
    methods: [
      {
        name: 'filtering.setGlobalFilter',
        signature: '(value: string) => void',
        description: 'Update global search input programmatically (debounced fetch, search chips).',
      },
      {
        name: 'filtering.setColumnFilters',
        signature: '(filters: ColumnFilterState) => void',
        description: 'Apply multiple column filters in one go, handy for saved filters.',
      },
      {
        name: 'sorting.setSorting',
        signature: '(sorting: SortingState) => void',
        description: 'Synchronise custom sort pickers or default sort presets.',
      },
      {
        name: 'filtering.clearAllFilters',
        signature: '() => void',
        description: 'Clear all active filters and reset to default state.',
      },
    ],
  },
  {
    title: 'Pagination & Navigation',
    description: 'Control table navigation and page state.',
    methods: [
      {
        name: 'pagination.goToPage',
        signature: '(pageIndex: number) => void',
        description: 'Jump to a specific page when replicating breadcrumbs or deep links.',
      },
      {
        name: 'pagination.setPageSize',
        signature: '(pageSize: number) => void',
        description: 'Change the number of rows per page.',
      },
      {
        name: 'pagination.nextPage',
        signature: '() => void',
        description: 'Navigate to the next page.',
      },
      {
        name: 'pagination.previousPage',
        signature: '() => void',
        description: 'Navigate to the previous page.',
      },
    ],
  },
  {
    title: 'Selection Management',
    description: 'Control row selection and bulk operations.',
    methods: [
      {
        name: 'selection.getSelectionState',
        signature: '() => SelectionState',
        description: 'Read the current include/exclude selection state for API calls.',
      },
      {
        name: 'selection.toggleSelectAll',
        signature: '() => void',
        description: 'Toggle select all respecting the configured selectMode.',
      },
      {
        name: 'selection.getSelectedRows',
        signature: '() => Row<T>[]',
        description: 'Access the selected row models to drive detail sidebars or exports.',
      },
      {
        name: 'selection.isRowSelected',
        signature: '(rowId: string) => boolean',
        description: 'Check row state when rendering custom actions or badges.',
      },
    ],
  },
  {
    title: 'Data Operations',
    description: 'Manipulate table data and trigger operations.',
    methods: [
      {
        name: 'data.refresh',
        signature: '() => void',
        description: 'Re-run onFetchData with the current filters—ideal for manual refresh buttons.',
      },
      {
        name: 'data.updateRow',
        signature: '(rowId: string, updates: Partial<T>) => void',
        description: 'Patch a row in place after inline edits without forcing a full reload.',
      },
      {
        name: 'data.getAllData',
        signature: '() => T[]',
        description: 'Get all data currently displayed in the table.',
      },
      {
        name: 'data.getFilteredDataCount',
        signature: '() => number',
        description: 'Get the count of filtered data rows.',
      },
    ],
  },
  {
    title: 'Export Operations',
    description: 'Trigger data exports and manage export state.',
    methods: [
      {
        name: 'export.exportCSV',
        signature: '(options?) => Promise<void>',
        description: 'Trigger client-side CSV export with support for visible columns and selected rows.',
      },
      {
        name: 'export.exportExcel',
        signature: '(options?) => Promise<void>',
        description: 'Trigger client-side Excel export with formatting options.',
      },
      {
        name: 'export.exportServerData',
        signature: "(options: { format: 'csv' | 'excel'; fetchData: Function }) => Promise<void>",
        description: 'Delegate heavy exports to your backend while keeping the same toolbar UI.',
      },
      {
        name: 'export.isExporting',
        signature: '() => boolean',
        description: 'Check if an export operation is currently in progress.',
      },
    ],
  },
];

export function ApiSection() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
        API Reference
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Imperative API methods available through component refs for programmatic control.
      </Typography>

      <Stack spacing={2} sx={{ mb: 4 }}>
        <Typography variant="body1">
          The DataTable exposes a comprehensive API through refs for programmatic control. 
          Attach a <code>useRef</code> to access these methods without drilling props.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          All API methods are organized by functionality. Use these methods to build custom 
          controls, implement saved views, or integrate with external state management.
        </Typography>
      </Stack>

      <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        {apiGroups.map((group, index) => (
          <Accordion key={group.title} defaultExpanded={index === 0} disableGutters>
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
              <List disablePadding>
                {group.methods.map((method) => (
                  <ListItem key={`${group.title}-${method.name}`} sx={{ alignItems: 'flex-start', py: 1.5 }}>
                    <ListItemIcon sx={{ minWidth: 42, mt: 0.25 }}>
                      <ApiIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box>
                          <Typography sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                            {method.name}
                          </Typography>
                          <Typography
                            component="span"
                            sx={{ 
                              display: 'block', 
                              fontFamily: 'monospace', 
                              fontSize: 13, 
                              mt: 0.5,
                              color: 'primary.main',
                              backgroundColor: 'grey.100',
                              px: 1,
                              py: 0.5,
                              borderRadius: 0.5,
                            }}
                          >
                            {method.signature}
                          </Typography>
                        </Box>
                      }
                      secondary={method.description}
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>

      <Paper elevation={1} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Usage Example
        </Typography>
        <Box
          component="pre"
          sx={{
            backgroundColor: '#f5f5f5',
            color: '#333',
            borderRadius: 1,
            p: 2,
            fontFamily: 'Menlo, Consolas, Monaco, "Courier New", monospace',
            fontSize: 14,
            overflowX: 'auto',
            mb: 2,
          }}
        >
{`import { useRef } from 'react';
import { DataTable, DataTableApi } from '@ackplus/react-tanstack-data-table';

function MyComponent() {
  const tableRef = useRef<DataTableApi<User>>(null);

  const handleRefresh = () => {
    tableRef.current?.data.refresh();
  };

  const handleExport = () => {
    tableRef.current?.export.exportCSV();
  };

  return (
    <DataTable
      ref={tableRef}
      columns={columns}
      data={data}
      // ... other props
    />
  );
}`}
        </Box>
      </Paper>
    </Box>
  );
}
