import { useMemo, useState } from 'react';
import { Box, Button } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
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
