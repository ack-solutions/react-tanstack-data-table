/**
 * v2 live demo — exercises the rebuilt @ackplus/data-table-next end to end:
 * div/CSS-Grid render, sorting, column resize, pinning, row selection,
 * pagination, density, fit-to-screen, striped/hover, row click — all on the
 * new headless engine + MUI-themed render layer.
 */
import { useMemo, useRef, useState } from 'react';
import {
    Box,
    Button,
    Chip,
    FormControlLabel,
    LinearProgress,
    Stack,
    Switch,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from '@mui/material';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable, type DataTableApi } from '@ackplus/mui-tanstack-data-grid';

interface Person {
    id: number;
    name: string;
    email: string;
    company: string;
    city: string;
    country: string;
    age: number;
    status: 'active' | 'pending' | 'inactive';
    amount: number;
    progress: number;
    date: string;
}

const FIRST = ['Liam', 'Olivia', 'Noah', 'Emma', 'Aarav', 'Diya', 'Mia', 'Lucas', 'Ava', 'Ethan', 'Saanvi', 'Kabir', 'Zoe', 'Leo', 'Ivy'];
const LAST = ['Smith', 'Johnson', 'Patel', 'Garcia', 'Khan', 'Muller', 'Rossi', 'Chen', 'Singh', 'Brown', 'Lopez', 'Nguyen', 'Kim', 'Silva', 'Haddad'];
const COMPANY = ['Acme Co', 'Globex', 'Initech', 'Umbrella', 'Soylent', 'Stark Ind', 'Wayne LLC', 'Hooli', 'Pied Piper', 'Wonka'];
const CITY = ['London', 'New York', 'Mumbai', 'Berlin', 'Tokyo', 'Paris', 'Toronto', 'Sydney', 'Dubai', 'Sao Paulo'];
const COUNTRY = ['UK', 'USA', 'India', 'Germany', 'Japan', 'France', 'Canada', 'Australia', 'UAE', 'Brazil'];
const STATUSES: Person['status'][] = ['active', 'pending', 'inactive'];
const STATUS_COLOR: Record<Person['status'], 'success' | 'warning' | 'default'> = { active: 'success', pending: 'warning', inactive: 'default' };

function makeData(count: number): Person[] {
    return Array.from({ length: count }, (_, i) => {
        const first = FIRST[i % FIRST.length];
        const last = LAST[(i * 7) % LAST.length];
        return {
            id: i + 1,
            name: `${first} ${last}`,
            email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
            company: COMPANY[(i * 3) % COMPANY.length],
            city: CITY[(i * 5) % CITY.length],
            country: COUNTRY[(i * 5) % COUNTRY.length],
            age: 20 + ((i * 13) % 45),
            status: STATUSES[(i * 2) % STATUSES.length],
            amount: ((i * 97) % 10000) + 100,
            progress: (i * 17) % 101,
            date: `2026-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
        };
    });
}

export function V2DemoPage() {
    const data = useMemo(() => makeData(237), []);
    const apiRef = useRef<DataTableApi<Person> | null>(null);

    const [striped, setStriped] = useState(true);
    const [fitToScreen, setFitToScreen] = useState(true);
    const [selectedCount, setSelectedCount] = useState(0);

    const columns = useMemo<ColumnDef<Person, any>[]>(() => [
        { id: 'name', header: 'Name', accessorKey: 'name', size: 180, minSize: 120 },
        { id: 'email', header: 'Email', accessorKey: 'email', size: 240, minSize: 160 },
        { id: 'company', header: 'Company', accessorKey: 'company', size: 180 },
        { id: 'city', header: 'City', accessorKey: 'city', size: 150 },
        { id: 'country', header: 'Country', accessorKey: 'country', size: 140 },
        { id: 'age', header: 'Age', accessorKey: 'age', size: 90, align: 'right', type: 'number' } as ColumnDef<Person, any>,
        {
            id: 'status', header: 'Status', accessorKey: 'status', size: 130,
            type: 'select',
            options: [
                { label: 'Active', value: 'active' },
                { label: 'Pending', value: 'pending' },
                { label: 'Inactive', value: 'inactive' },
            ],
            cell: (ctx) => {
                const v = ctx.getValue() as Person['status'];
                return <Chip size="small" label={v} color={STATUS_COLOR[v]} variant={v === 'inactive' ? 'outlined' : 'filled'} />;
            },
        },
        { id: 'amount', header: 'Amount', accessorKey: 'amount', size: 130, align: 'right', type: 'number', cell: (ctx) => `$${(ctx.getValue() as number).toLocaleString()}` } as ColumnDef<Person, any>,
        {
            id: 'progress', header: 'Progress', accessorKey: 'progress', size: 160, enableSorting: false,
            cell: (ctx) => {
                const v = ctx.getValue() as number;
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <LinearProgress variant="determinate" value={v} sx={{ flex: 1, height: 6, borderRadius: 3 }} />
                        <Box component="span" sx={{ fontSize: '0.75rem', minWidth: 32, textAlign: 'right' }}>{v}%</Box>
                    </Box>
                );
            },
        },
        { id: 'date', header: 'Date', accessorKey: 'date', size: 130, type: 'date' } as ColumnDef<Person, any>,
        {
            id: 'actions', header: 'Actions', size: 100, enableSorting: false, enableResizing: false,
            cell: () => <Chip size="small" label="View" variant="outlined" clickable />,
        },
    ], []);

    return (
        <Box>
            <Typography variant="h4" gutterBottom>v2 Live Demo — @ackplus/data-table-next</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 820 }}>
                The rebuilt grid: no HTML <code>&lt;table&gt;</code>, headless TanStack engine, MUI-themed div/CSS-Grid
                render layer. Click headers to sort, drag column edges to resize, select rows, change density — the
                pinned <strong>checkbox</strong>/<strong>Name</strong> (left) and <strong>Actions</strong> (right) stay put.
            </Typography>

            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="caption" color="text.secondary">Density / columns / export are in the grid toolbar →</Typography>
                <FormControlLabel control={<Switch checked={striped} onChange={(e) => setStriped(e.target.checked)} />} label="Striped" />
                <FormControlLabel control={<Switch checked={fitToScreen} onChange={(e) => setFitToScreen(e.target.checked)} />} label="Fit to screen" />
                <Box sx={{ flex: 1 }} />
                <Button size="small" variant="outlined" onClick={() => apiRef.current?.selection.selectAll()}>Select all</Button>
                <Button size="small" variant="outlined" onClick={() => apiRef.current?.selection.deselectAll()}>Clear</Button>
                <Typography variant="caption" color="text.secondary">{selectedCount} selected</Typography>
            </Stack>

            <Box>
                <DataTable<Person>
                    apiRef={apiRef}
                    columns={columns}
                    data={data}
                    striped={striped}
                    hover
                    fitToScreen={fitToScreen}
                    enableSorting
                    enableColumnResizing
                    enableColumnPinning
                    enableRowSelection
                    enableBulkActions
                    enableColumnReordering
                    renderBulkActions={(s) => (
                        <Button size="small" variant="contained" color="inherit"
                            onClick={() => window.alert(`Delete ${s.type === 'exclude' ? 'all except ' + s.ids.length : s.ids.length} row(s)`)}>
                            Delete
                        </Button>
                    )}
                    enablePagination
                    enableGlobalFilter
                    enableColumnFilter
                    filterMode="client"
                    enableColumnVisibility
                    enableDensitySelector
                    enableExport
                    enableReset
                    stickyHeader
                    maxHeight={520}
                    onSelectionChange={(s) => setSelectedCount(s.type === 'exclude' ? data.length - s.ids.length : s.ids.length)}
                    onRowClick={(_, row) => console.log('row click', row.original.name)}
                    initialState={{
                        pagination: { pageIndex: 0, pageSize: 10 },
                        columnPinning: { left: ['_selection', 'name'], right: ['actions'] },
                    }}
                    slotProps={{ selectionColumn: { enablePinning: true } }}
                />
            </Box>
        </Box>
    );
}

export default V2DemoPage;
