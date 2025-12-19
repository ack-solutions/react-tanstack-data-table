import { Box, Typography, Paper, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemIcon, ListItemText, Stack } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ApiIcon from '@mui/icons-material/Api';
import { CodeBlock } from './features/common';

const apiGroups = [
  {
    title: 'Table Access',
    description: 'Access the underlying TanStack Table instance for advanced operations.',
    methods: [
      {
        name: 'table.getTable',
        signature: '() => Table<T>',
        description: 'Get the underlying TanStack Table instance for direct access to all table APIs.',
      },
    ],
  },
  {
    title: 'Column Visibility',
    description: 'Control which columns are visible in the table.',
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
        name: 'columnVisibility.toggleColumn',
        signature: '(columnId: string) => void',
        description: 'Toggle column visibility on or off.',
      },
      {
        name: 'columnVisibility.showAllColumns',
        signature: '() => void',
        description: 'Show all columns at once, useful for reset actions.',
      },
      {
        name: 'columnVisibility.hideAllColumns',
        signature: '() => void',
        description: 'Hide all columns at once.',
      },
      {
        name: 'columnVisibility.resetColumnVisibility',
        signature: '() => void',
        description: 'Reset column visibility to initial state.',
      },
    ],
  },
  {
    title: 'Column Ordering',
    description: 'Reorder columns programmatically.',
    methods: [
      {
        name: 'columnOrdering.setColumnOrder',
        signature: '(order: string[]) => void',
        description: 'Reorder columns in bulk (drag-and-drop persistence, saved templates).',
      },
      {
        name: 'columnOrdering.moveColumn',
        signature: '(columnId: string, toIndex: number) => void',
        description: 'Move a specific column to a target index position.',
      },
      {
        name: 'columnOrdering.resetColumnOrder',
        signature: '() => void',
        description: 'Reset column order to initial state.',
      },
    ],
  },
  {
    title: 'Column Pinning',
    description: 'Pin columns to left or right for better visibility while scrolling.',
    methods: [
      {
        name: 'columnPinning.pinColumnLeft',
        signature: '(columnId: string) => void',
        description: 'Pin a column to the left side of the table.',
      },
      {
        name: 'columnPinning.pinColumnRight',
        signature: '(columnId: string) => void',
        description: 'Pin a column to the right side of the table.',
      },
      {
        name: 'columnPinning.unpinColumn',
        signature: '(columnId: string) => void',
        description: 'Unpin a column from either side.',
      },
      {
        name: 'columnPinning.setPinning',
        signature: '(pinning: ColumnPinningState) => void',
        description: 'Set pinning state for multiple columns at once.',
      },
      {
        name: 'columnPinning.resetColumnPinning',
        signature: '() => void',
        description: 'Reset all column pinning to initial state.',
      },
    ],
  },
  {
    title: 'Column Resizing',
    description: 'Control column widths programmatically.',
    methods: [
      {
        name: 'columnResizing.resizeColumn',
        signature: '(columnId: string, width: number) => void',
        description: 'Set a specific width for a column in pixels.',
      },
      {
        name: 'columnResizing.autoSizeColumn',
        signature: '(columnId: string) => void',
        description: 'Automatically size a column to fit its content.',
      },
      {
        name: 'columnResizing.autoSizeAllColumns',
        signature: '() => void',
        description: 'Automatically size all columns to fit their content.',
      },
      {
        name: 'columnResizing.resetColumnSizing',
        signature: '() => void',
        description: 'Reset all column widths to their default sizes.',
      },
    ],
  },
  {
    title: 'Filtering',
    description: 'Control search and column filters programmatically.',
    methods: [
      {
        name: 'filtering.setGlobalFilter',
        signature: '(value: string) => void',
        description: 'Update global search input programmatically (debounced fetch, search chips).',
      },
      {
        name: 'filtering.clearGlobalFilter',
        signature: '() => void',
        description: 'Clear the global search filter.',
      },
      {
        name: 'filtering.setColumnFilters',
        signature: '(filters: ColumnFilterState) => void',
        description: 'Apply multiple column filters in one go, handy for saved filters.',
      },
      {
        name: 'filtering.addColumnFilter',
        signature: '(columnId: string, operator: string, value: any) => void',
        description: 'Add a single column filter with specified operator and value.',
      },
      {
        name: 'filtering.removeColumnFilter',
        signature: '(filterId: string) => void',
        description: 'Remove a specific column filter by its ID.',
      },
      {
        name: 'filtering.clearAllFilters',
        signature: '() => void',
        description: 'Clear all active filters (global and column) and reset to default state.',
      },
      {
        name: 'filtering.resetFilters',
        signature: '() => void',
        description: 'Reset all filters to initial state.',
      },
    ],
  },
  {
    title: 'Sorting',
    description: 'Control column sorting programmatically.',
    methods: [
      {
        name: 'sorting.setSorting',
        signature: '(sorting: SortingState) => void',
        description: 'Set sorting state for multiple columns, synchronise custom sort pickers or default sort presets.',
      },
      {
        name: 'sorting.sortColumn',
        signature: "(columnId: string, direction: 'asc' | 'desc' | false) => void",
        description: 'Sort a specific column in ascending, descending, or clear sorting.',
      },
      {
        name: 'sorting.clearSorting',
        signature: '() => void',
        description: 'Clear all active sorting.',
      },
      {
        name: 'sorting.resetSorting',
        signature: '() => void',
        description: 'Reset sorting to initial state.',
      },
    ],
  },
  {
    title: 'Pagination',
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
      {
        name: 'pagination.goToFirstPage',
        signature: '() => void',
        description: 'Jump to the first page.',
      },
      {
        name: 'pagination.goToLastPage',
        signature: '() => void',
        description: 'Jump to the last page.',
      },
      {
        name: 'pagination.resetPagination',
        signature: '() => void',
        description: 'Reset pagination to initial state (page 0 with default page size).',
      },
    ],
  },
  {
    title: 'Row Selection',
    description: 'Control row selection and bulk operations.',
    methods: [
      {
        name: 'selection.selectRow',
        signature: '(rowId: string) => void',
        description: 'Select a specific row by ID.',
      },
      {
        name: 'selection.deselectRow',
        signature: '(rowId: string) => void',
        description: 'Deselect a specific row by ID.',
      },
      {
        name: 'selection.toggleRowSelection',
        signature: '(rowId: string) => void',
        description: 'Toggle selection state of a specific row.',
      },
      {
        name: 'selection.selectAll',
        signature: '() => void',
        description: 'Select all rows based on current selectMode (page or all).',
      },
      {
        name: 'selection.deselectAll',
        signature: '() => void',
        description: 'Deselect all rows.',
      },
      {
        name: 'selection.toggleSelectAll',
        signature: '() => void',
        description: 'Toggle select all respecting the configured selectMode.',
      },
      {
        name: 'selection.getSelectionState',
        signature: '() => SelectionState',
        description: 'Read the current include/exclude selection state for API calls.',
      },
      {
        name: 'selection.getSelectedCount',
        signature: '() => number',
        description: 'Get the total count of selected rows.',
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
    title: 'Data Management',
    description: 'Manipulate table data and trigger operations.',
    methods: [
      {
        name: 'data.refresh',
        signature: '() => void',
        description: 'Re-run onFetchData with the current filters—ideal for manual refresh buttons.',
      },
      {
        name: 'data.reload',
        signature: '() => void',
        description: 'Reload data by calling onFetchData with empty filters.',
      },
      {
        name: 'data.getAllData',
        signature: '() => T[]',
        description: 'Get all data currently displayed in the table.',
      },
      {
        name: 'data.getRowData',
        signature: '(rowId: string) => T | undefined',
        description: 'Get a specific row data by its ID.',
      },
      {
        name: 'data.getRowByIndex',
        signature: '(index: number) => T | undefined',
        description: 'Get row data by its index position in the table.',
      },
      {
        name: 'data.getDataCount',
        signature: '() => number',
        description: 'Get the total count of rows currently displayed.',
      },
      {
        name: 'data.getFilteredDataCount',
        signature: '() => number',
        description: 'Get the count of filtered data rows.',
      },
      {
        name: 'data.updateRow',
        signature: '(rowId: string, updates: Partial<T>) => void',
        description: 'Patch a row in place after inline edits without forcing a full reload.',
      },
      {
        name: 'data.updateRowByIndex',
        signature: '(index: number, updates: Partial<T>) => void',
        description: 'Update a row by its index position.',
      },
      {
        name: 'data.updateField',
        signature: '(rowId: string, fieldName: keyof T, value: any) => void',
        description: 'Update a specific field in a row.',
      },
      {
        name: 'data.updateFieldByIndex',
        signature: '(index: number, fieldName: keyof T, value: any) => void',
        description: 'Update a specific field in a row by index.',
      },
      {
        name: 'data.insertRow',
        signature: '(newRow: T, index?: number) => void',
        description: 'Insert a new row at a specific index or append to the end.',
      },
      {
        name: 'data.deleteRow',
        signature: '(rowId: string) => void',
        description: 'Delete a row by its ID.',
      },
      {
        name: 'data.deleteRowByIndex',
        signature: '(index: number) => void',
        description: 'Delete a row by its index position.',
      },
      {
        name: 'data.deleteSelectedRows',
        signature: '() => void',
        description: 'Delete all currently selected rows.',
      },
      {
        name: 'data.replaceAllData',
        signature: '(newData: T[]) => void',
        description: 'Replace all table data with new data array.',
      },
      {
        name: 'data.updateMultipleRows',
        signature: '(updates: Array<{ rowId: string; data: Partial<T> }>) => void',
        description: 'Update multiple rows in a single operation.',
      },
      {
        name: 'data.insertMultipleRows',
        signature: '(newRows: T[], startIndex?: number) => void',
        description: 'Insert multiple rows at once starting from a specific index.',
      },
      {
        name: 'data.deleteMultipleRows',
        signature: '(rowIds: string[]) => void',
        description: 'Delete multiple rows by their IDs in a single operation.',
      },
      {
        name: 'data.findRows',
        signature: '(predicate: (row: T) => boolean) => T[]',
        description: 'Find all rows matching a predicate function.',
      },
      {
        name: 'data.findRowIndex',
        signature: '(predicate: (row: T) => boolean) => number',
        description: 'Find the index of the first row matching a predicate function.',
      },
    ],
  },
  {
    title: 'Layout Management',
    description: 'Save, restore, and reset table layout configuration.',
    methods: [
      {
        name: 'layout.resetLayout',
        signature: '() => void',
        description: 'Reset column sizing, visibility, and sorting to defaults.',
      },
      {
        name: 'layout.resetAll',
        signature: '() => void',
        description: 'Reset all table state (columns, filters, sorting, pagination, selection) to initial state.',
      },
      {
        name: 'layout.saveLayout',
        signature: '() => any',
        description: 'Save current table layout configuration (column visibility, sizing, order, pinning, sorting, pagination, filters).',
      },
      {
        name: 'layout.restoreLayout',
        signature: '(layout: Partial<TableState>) => void',
        description: 'Restore a previously saved layout configuration.',
      },
    ],
  },
  {
    title: 'Table State',
    description: 'Query current table state and configuration.',
    methods: [
      {
        name: 'state.getTableState',
        signature: '() => any',
        description: 'Get the complete table state object with all current configurations.',
      },
      {
        name: 'state.getCurrentFilters',
        signature: '() => ColumnFilterState',
        description: 'Get the current column filter state.',
      },
      {
        name: 'state.getCurrentSorting',
        signature: '() => SortingState',
        description: 'Get the current sorting state.',
      },
      {
        name: 'state.getCurrentPagination',
        signature: '() => { pageIndex: number; pageSize: number }',
        description: 'Get the current pagination state (page index and page size).',
      },
      {
        name: 'state.getCurrentSelection',
        signature: '() => string[]',
        description: 'Get an array of currently selected row IDs.',
      },
    ],
  },
  {
    title: 'Export Operations',
    description: 'Trigger data exports and manage export state.',
    methods: [
      {
        name: 'export.exportCSV',
        signature: '(options?: { filename?: string; onlyVisibleColumns?: boolean; onlySelectedRows?: boolean; includeHeaders?: boolean }) => Promise<void>',
        description: 'Trigger client-side CSV export with support for visible columns and selected rows.',
      },
      {
        name: 'export.exportExcel',
        signature: '(options?: { filename?: string; onlyVisibleColumns?: boolean; onlySelectedRows?: boolean; includeHeaders?: boolean }) => Promise<void>',
        description: 'Trigger client-side Excel export with formatting options.',
      },
      {
        name: 'export.exportServerData',
        signature: "(options: { format: 'csv' | 'excel'; filename?: string; fetchData: (filters?: Partial<TableState>) => Promise<{ data: T[]; total: number }>; pageSize?: number; includeHeaders?: boolean }) => Promise<void>",
        description: 'Delegate heavy exports to your backend while keeping the same toolbar UI.',
      },
      {
        name: 'export.isExporting',
        signature: '() => boolean',
        description: 'Check if an export operation is currently in progress.',
      },
      {
        name: 'export.cancelExport',
        signature: '() => void',
        description: 'Cancel an ongoing export operation.',
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
          Usage Examples
        </Typography>
        <CodeBlock
          language="tsx"
          code={`import { useRef } from 'react';
import { DataTable, DataTableApi } from '@ackplus/react-tanstack-data-table';

function MyComponent() {
  const tableRef = useRef<DataTableApi<User>>(null);

  // Data operations
  const handleRefresh = () => {
    tableRef.current?.data.refresh();
  };

  // Export operations
  const handleExport = () => {
    tableRef.current?.export.exportCSV({
      filename: 'users',
      onlyVisibleColumns: true,
      onlySelectedRows: true,
    });
  };

  // Column management
  const handleShowColumn = (columnId: string) => {
    tableRef.current?.columnVisibility.showColumn(columnId);
  };

  // Selection management
  const handleSelectAll = () => {
    tableRef.current?.selection.selectAll();
  };

  const selectedCount = tableRef.current?.selection.getSelectedCount() ?? 0;

  // Filtering
  const handleSearch = (query: string) => {
    tableRef.current?.filtering.setGlobalFilter(query);
  };

  // Sorting
  const handleSort = (columnId: string, direction: 'asc' | 'desc') => {
    tableRef.current?.sorting.sortColumn(columnId, direction);
  };

  // Pagination
  const handleGoToPage = (page: number) => {
    tableRef.current?.pagination.goToPage(page);
  };

  // Layout management
  const handleSaveLayout = () => {
    const layout = tableRef.current?.layout.saveLayout();
    localStorage.setItem('tableLayout', JSON.stringify(layout));
  };

  const handleRestoreLayout = () => {
    const saved = localStorage.getItem('tableLayout');
    if (saved) {
      tableRef.current?.layout.restoreLayout(JSON.parse(saved));
    }
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
        />
      </Paper>
    </Box>
  );
}
