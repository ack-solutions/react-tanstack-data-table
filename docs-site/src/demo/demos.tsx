import { Button } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { DataTable } from '@ackplus/mui-tanstack-data-grid';

import { columns, users, makeUsers } from './sample';

const page5 = { pagination: { pageIndex: 0, pageSize: 5 } };

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
            enableGlobalFilter
            enableColumnFilter
            enableExport
            enableDensitySelector
            enableReset
            enablePagination
            stickyHeader
            maxHeight={420}
            initialState={{ pagination: { pageIndex: 0, pageSize: 8 }, columnPinning: { left: ['name'] } }}
            renderBulkActions={(s) => (
                <Button size="small" variant="contained" color="inherit" onClick={() => window.alert(`Delete ${s.ids.length} row(s)`)}>
                    Delete
                </Button>
            )}
        />
    );
}
