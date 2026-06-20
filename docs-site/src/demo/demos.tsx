import { useMemo, useState } from 'react';
import { Box, Button } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import EditOutlined from '@mui/icons-material/EditOutlined';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@ackplus/mui-tanstack-data-grid';

import { columns, users, makeUsers } from './sample';

const page5 = { pagination: { pageIndex: 0, pageSize: 5 } };

export function DarkModeDemo() {
    // Toggling the theme's mode restyles the grid — it derives every colour from
    // the theme (and follows `colorSchemes` under `cssVariables` apps too).
    const [mode, setMode] = useState<'light' | 'dark'>('light');
    const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);
    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 1 }}>
                <Button size="small" variant="outlined" onClick={() => setMode((m) => (m === 'dark' ? 'light' : 'dark'))} sx={{ mb: 1.5 }}>
                    Toggle theme — currently {mode}
                </Button>
                <DataTable
                    columns={columns}
                    data={users}
                    enableSorting
                    enableColumnResizing
                    enableColumnPinning
                    enableColumnVisibility
                    enablePagination
                    enableDensitySelector
                    initialState={{ pagination: { pageIndex: 0, pageSize: 5 }, columnPinning: { left: ['name'] } }}
                />
            </Box>
        </ThemeProvider>
    );
}

export function PersistenceDemo() {
    return (
        <DataTable
            columns={columns}
            data={makeUsers(48)}
            stateKey="docs-persistence-demo"
            enableSorting
            enableColumnResizing
            enableColumnReordering
            enableColumnPinning
            enableColumnVisibility
            enableDensitySelector
            enablePagination
            initialState={page5}
        />
    );
}

export function HeightAutoDemo() {
    // Auto height (default): no bound → the grid is exactly as tall as its rows.
    return <DataTable columns={columns} data={makeUsers(5)} enableSorting />;
}

export function HeightCappedDemo() {
    // Capped: maxHeight on its own caps the body and scrolls; the header stays pinned.
    return <DataTable columns={columns} data={makeUsers(60)} maxHeight={260} enableSorting />;
}

export function HeightFillDemo() {
    // Fixed/fill: the grid fills its 340px parent, the body scrolls, and the header +
    // pagination footer stay pinned. Scroll the rows — header and footer hold.
    return (
        <Box sx={{ height: 340 }}>
            <DataTable
                columns={columns}
                data={makeUsers(80)}
                height="100%"
                enablePagination
                enableColumnPinning
                initialState={{ pagination: { pageIndex: 0, pageSize: 25 }, columnPinning: { left: ['name'] } }}
            />
        </Box>
    );
}

export function BasicDemo() {
    return <DataTable columns={columns} data={users} enableSorting enableColumnResizing enablePagination initialState={page5} />;
}

export function SortingDemo() {
    return <DataTable columns={columns} data={users} enableSorting enablePagination initialState={page5} />;
}

export function FilteringDemo() {
    return <DataTable columns={columns} data={users} enableGlobalFilter enableColumnFilter enablePagination initialState={page5} />;
}

export function PaginationDemo() {
    return <DataTable columns={columns} data={makeUsers(48)} enablePagination initialState={page5} />;
}

export function SelectionDemo() {
    return (
        <DataTable
            columns={columns}
            data={users}
            enableRowSelection
            enableBulkActions
            enablePagination
            initialState={page5}
            renderBulkActions={(s) => (
                <Button size="small" variant="contained" color="inherit" onClick={() => window.alert(`Delete ${s.ids.length} row(s)`)}>
                    Delete
                </Button>
            )}
        />
    );
}

export function ColumnsDemo() {
    return (
        <DataTable
            columns={columns}
            data={users}
            enableColumnResizing
            enableColumnReordering
            enableColumnPinning
            enableColumnVisibility
            enablePagination
            initialState={{ pagination: { pageIndex: 0, pageSize: 5 }, columnPinning: { left: ['name'] } }}
        />
    );
}

export function ExportDemo() {
    return <DataTable columns={columns} data={users} enableExport exportFilename="users" enablePagination initialState={page5} />;
}

export function ToolbarLayoutDemo() {
    return (
        <DataTable
            columns={columns}
            data={users}
            enableGlobalFilter
            enableColumnFilter
            enableColumnVisibility
            enableDensitySelector
            enableExport
            enableRefresh
            enableReset
            enablePagination
            initialState={page5}
            // Rearrange the built-in controls: actions on the left, search on the right.
            renderToolbar={(c) => (
                <>
                    {c.columns}{c.density}{c.export}{c.refresh}{c.reset}
                    <Box sx={{ flex: 1 }} />
                    {c.filter}{c.search}
                </>
            )}
        />
    );
}

export function PinningDemo() {
    return (
        <DataTable
            columns={columns}
            data={users}
            enableColumnPinning
            enableColumnVisibility
            enableRowSelection
            enablePagination
            initialState={{ pagination: { pageIndex: 0, pageSize: 5 }, columnPinning: { left: ['_selection', 'name'], right: ['actions'] } }}
        />
    );
}

export function ExpansionDemo() {
    return (
        <DataTable
            columns={columns}
            data={users}
            enableRowExpansion
            enablePagination
            initialState={page5}
            renderDetailPanel={(row) => (
                <div style={{ padding: 8, fontSize: 14 }}>
                    <strong>{row.original.name}</strong> — {row.original.email} · {row.original.role} · {row.original.status}
                </div>
            )}
        />
    );
}

const brandedTheme = createTheme({
    palette: { tanstackDataGrid: { headerBg: '#eef2ff', headerColor: '#4338ca', borderColor: '#e0e7ff' } },
    components: {
        MuiTanstackDataGrid: {
            defaultProps: { density: 'compact', striped: true },
            styleOverrides: {
                header: { textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: 11 },
                cell: { borderRight: '1px solid var(--dt-border-color)' },
            },
        },
    },
});

export function ThemingDemo() {
    return (
        <ThemeProvider theme={brandedTheme}>
            <DataTable columns={columns} data={users} enableSorting enablePagination initialState={page5} />
        </ThemeProvider>
    );
}

interface StyledRow {
    id: number;
    name: string;
    role: 'Admin' | 'Editor' | 'Viewer';
    bio: string;
}

const styledRows: StyledRow[] = [
    { id: 1, name: 'Liam Smith', role: 'Admin', bio: 'Owns billing and platform infrastructure; long-time maintainer of the export pipeline.' },
    { id: 2, name: 'Olivia Chen', role: 'Editor', bio: 'Writes and reviews the documentation and curates the component examples.' },
    { id: 3, name: 'Noah Patel', role: 'Viewer', bio: 'Read-only analytics access for the quarterly reporting dashboards.' },
    { id: 4, name: 'Emma Rossi', role: 'Admin', bio: 'Manages user provisioning and the SSO integration across every workspace.' },
];

const styledColumns: ColumnDef<StyledRow, any>[] = [
    { id: 'name', header: 'Name', accessorKey: 'name', size: 150 },
    {
        id: 'role',
        header: 'Role',
        accessorKey: 'role',
        size: 120,
        // Per-column hooks: a static class on the header, a conditional one per cell.
        headerClassName: 'dt-role-header',
        cellClassName: ({ value }) => (value === 'Admin' ? 'dt-admin' : ''),
    },
    // `wrapText` lets the long Bio text wrap (and the row grow) instead of truncating.
    { id: 'bio', header: 'Bio', accessorKey: 'bio', size: 240, wrapText: true },
];

export function CellRowStylingDemo() {
    // The class-name hooks emit plain CSS classes onto the grid's cells/rows; here
    // they're scoped via the wrapper's `sx` so the demo stays self-contained.
    return (
        <Box
            sx={{
                '& .dt-role-header': { color: 'primary.main' },
                '& .dt-admin': { fontWeight: 700, color: 'success.main' },
                '& .dt-viewer-row': { fontStyle: 'italic', color: 'text.secondary' },
            }}
        >
            <DataTable
                columns={styledColumns}
                data={styledRows}
                // Table-level hooks: italicise Viewer rows; merges with per-column `cellClassName`.
                getRowClassName={({ row }) => (row.original.role === 'Viewer' ? 'dt-viewer-row' : '')}
                getCellClassName={({ columnId, value }) => (columnId === 'role' && value === 'Admin' ? 'dt-admin' : '')}
            />
        </Box>
    );
}

export function RowActionsDemo() {
    // `getRowActions` adds an auto-generated, right-pinned actions column. Two actions
    // here render as inline icon buttons; returning 3+ (or any without an icon) collapses
    // them into an overflow ⋮ menu.
    return (
        <DataTable
            columns={columns}
            data={users}
            enablePagination
            enableColumnPinning
            initialState={page5}
            getRowActions={(row) => [
                { label: 'View', icon: VisibilityOutlined, onClick: () => window.alert(`View ${row.original.name}`) },
                { label: 'Edit', icon: EditOutlined, onClick: () => window.alert(`Edit ${row.original.name}`) },
                {
                    label: 'Delete',
                    icon: DeleteOutline,
                    color: 'error',
                    disabled: row.original.status === 'active',
                    onClick: () => window.alert(`Delete ${row.original.name}`),
                },
            ]}
        />
    );
}

interface Sale {
    id: number;
    first: string;
    last: string;
    amount: number;
    closedOn: string;
    won: boolean;
}

const salesRows: Sale[] = [
    { id: 1, first: 'Ada', last: 'Lovelace', amount: 12500.5, closedOn: '2026-01-18', won: true },
    { id: 2, first: 'Alan', last: 'Turing', amount: 9800, closedOn: '2026-02-03', won: false },
    { id: 3, first: 'Grace', last: 'Hopper', amount: 23150.75, closedOn: '2026-02-21', won: true },
    { id: 4, first: 'Edsger', last: 'Dijkstra', amount: 4300, closedOn: '2026-03-09', won: false },
];

const salesColumns: ColumnDef<Sale, any>[] = [
    // valueGetter: a computed column with no accessorKey — sorting/filtering use it too.
    { id: 'name', header: 'Rep', valueGetter: ({ row }) => `${row.first} ${row.last}`, size: 160 },
    // type drives the default cell formatting (no hand-written renderers):
    { id: 'amount', header: 'Amount', accessorKey: 'amount', type: 'number',
      valueFormatter: ({ value }) => `$${Number(value).toLocaleString()}`, align: 'right', size: 130 },
    { id: 'closedOn', header: 'Closed', accessorKey: 'closedOn', type: 'date', size: 140 },
    { id: 'won', header: 'Won', accessorKey: 'won', type: 'boolean', align: 'center', size: 90 },
];

export function ValueFormatterDemo() {
    // `valueGetter` derives a value (feeds sort/filter/export); `type` gives a default
    // display cell (number/date/boolean); `valueFormatter` customizes display only.
    return <DataTable columns={salesColumns} data={salesRows} enableSorting />;
}

const aggColumns: ColumnDef<Sale, any>[] = [
    { id: 'name', header: 'Rep', valueGetter: ({ row }) => `${row.first} ${row.last}`, size: 160, aggregation: 'count' },
    { id: 'amount', header: 'Amount', accessorKey: 'amount', type: 'number', align: 'right', size: 130, aggregation: 'sum' },
    { id: 'closedOn', header: 'Closed', accessorKey: 'closedOn', type: 'date', size: 140 },
    { id: 'won', header: 'Won', accessorKey: 'won', type: 'boolean', align: 'center', size: 90 },
];

export function AggregationDemo() {
    // `enableAggregation` + per-column `aggregation` → a sticky footer summary row
    // (count of reps, sum of amounts) over the filtered rows.
    return <DataTable columns={aggColumns} data={salesRows} enableAggregation enableColumnFilter />;
}

// A partial French override — only the keys you set change; the rest fall back to English.
const frFR = {
    toolbarSearch: 'Rechercher',
    searchPlaceholder: 'Rechercher…',
    toolbarColumns: 'Colonnes',
    toolbarDensity: 'Densité',
    toolbarExport: 'Exporter',
    exportAs: 'Exporter en',
    filterButton: 'Filtres',
    filterTitle: 'Filtres de colonne',
    filterApply: 'Appliquer',
    filterClearAll: 'Tout effacer',
    filterAddFilter: 'Ajouter un filtre',
    filterColumn: 'Colonne',
    filterOperator: 'Opérateur',
    filterValue: 'Valeur',
    columnsManageTitle: 'Colonnes',
    columnsShowAll: 'Tout afficher',
    columnsReset: 'Réinitialiser',
    columnsDone: 'Terminé',
    noRows: 'Aucune ligne',
    clearSelection: 'Effacer',
    selectedRows: (n: number) => `${n} sélectionné(s)`,
    paginationRowsPerPage: 'Lignes par page :',
    paginationDisplayedRows: ({ from, to, count }: { from: number; to: number; count: number }) => `${from}–${to} sur ${count}`,
    operators: { contains: 'Contient', equals: 'Égal à', startsWith: 'Commence par', between: 'Entre' },
};

export function LocaleDemo() {
    const [fr, setFr] = useState(false);
    return (
        <Box>
            <Button size="small" variant="outlined" sx={{ mb: 1.5 }} onClick={() => setFr((f) => !f)}>
                {fr ? 'Switch to English' : 'Passer en français'}
            </Button>
            <DataTable
                columns={columns}
                data={users}
                localeText={fr ? frFR : undefined}
                enableGlobalFilter
                enableColumnFilter
                enableColumnVisibility
                enableDensitySelector
                enableExport
                enablePagination
                initialState={page5}
            />
        </Box>
    );
}

const editableColumns: ColumnDef<typeof users[number], any>[] = [
    { id: 'name', header: 'Name', accessorKey: 'name', editable: true, size: 170 },
    { id: 'email', header: 'Email', accessorKey: 'email', editable: true, size: 220 },
    {
        id: 'role', header: 'Role', accessorKey: 'role', editable: true, type: 'select', size: 130,
        options: [{ label: 'Admin', value: 'Admin' }, { label: 'Editor', value: 'Editor' }, { label: 'Viewer', value: 'Viewer' }],
    },
    {
        id: 'status', header: 'Status', accessorKey: 'status', editable: true, type: 'select', size: 130,
        options: [{ label: 'Active', value: 'active' }, { label: 'Invited', value: 'invited' }],
    },
];

export function EditingDemo() {
    // Double-click a cell (or focus it and press Enter) to edit. processRowUpdate commits;
    // here it just echoes the row back, so the grid applies the edit to its data.
    return (
        <DataTable
            columns={editableColumns}
            data={makeUsers(6)}
            enablePagination
            initialState={page5}
            processRowUpdate={(newRow) => newRow}
        />
    );
}

interface FileNode {
    id: number;
    name: string;
    kind: string;
    size: string;
    children?: FileNode[];
}

const fileTree: FileNode[] = [
    { id: 1, name: 'src', kind: 'Folder', size: '—', children: [
        { id: 2, name: 'components', kind: 'Folder', size: '—', children: [
            { id: 3, name: 'Button.tsx', kind: 'File', size: '2 KB' },
            { id: 4, name: 'Input.tsx', kind: 'File', size: '3 KB' },
        ] },
        { id: 5, name: 'index.ts', kind: 'File', size: '1 KB' },
    ] },
    { id: 6, name: 'package.json', kind: 'File', size: '1 KB' },
    { id: 7, name: 'README.md', kind: 'File', size: '4 KB' },
];

const treeColumns: ColumnDef<FileNode, any>[] = [
    { id: 'name', header: 'Name', accessorKey: 'name', size: 260 },
    { id: 'kind', header: 'Kind', accessorKey: 'kind', size: 120 },
    { id: 'size', header: 'Size', accessorKey: 'size', size: 100, align: 'right' },
];

export function TreeDemo() {
    // `getSubRows` turns nested data into a tree: an expander on parent rows + depth indentation.
    return (
        <DataTable
            columns={treeColumns}
            data={fileTree}
            getSubRows={(row) => row.children}
            enableColumnPinning
            initialState={{ expanded: true } as any}
        />
    );
}

export function FullDemo() {
    return (
        <DataTable
            columns={columns}
            data={makeUsers(48)}
            enableSorting
            enableColumnResizing
            enableColumnReordering
            enableColumnPinning
            enableColumnVisibility
            enableRowSelection
            enableBulkActions
            enableRowExpansion
            enableGlobalFilter
            enableColumnFilter
            enableExport
            enableDensitySelector
            enableReset
            enablePagination
            stickyHeader
            maxHeight={420}
            initialState={{ pagination: { pageIndex: 0, pageSize: 8 }, columnPinning: { left: ['_selection', '_expanding', 'name'], right: ['actions'] } }}
            renderDetailPanel={(row) => (
                <div style={{ padding: 8, fontSize: 14 }}>
                    <strong>{row.original.name}</strong> — {row.original.email} · {row.original.role} · {row.original.status}
                </div>
            )}
            renderBulkActions={(s) => (
                <Button size="small" variant="contained" color="inherit" onClick={() => window.alert(`Delete ${s.ids.length} row(s)`)}>
                    Delete
                </Button>
            )}
        />
    );
}
