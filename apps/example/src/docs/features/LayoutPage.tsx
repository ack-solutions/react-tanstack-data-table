import { useMemo } from 'react';
import { Box, Paper, Stack, Typography, Chip, Alert } from '@mui/material';
import { DataTable } from '@ackplus/mui-tanstack-data-grid';
import type { ColumnDef } from '@tanstack/react-table';
import { FeatureLayout } from './common/FeatureLayout';
import { CodeBlock } from './common/CodeBlock';

interface Row {
    id: number;
    name: string;
    email: string;
    role: string;
    city: string;
}

const ROLES = ['Admin', 'Editor', 'Viewer', 'Owner'];
const CITIES = ['London', 'Berlin', 'Paris', 'Tokyo', 'Austin', 'Oslo'];

function makeRows(n: number): Row[] {
    return Array.from({ length: n }, (_, i) => ({
        id: i + 1,
        name: `Person ${i + 1}`,
        email: `person${i + 1}@example.com`,
        role: ROLES[i % ROLES.length],
        city: CITIES[i % CITIES.length],
    }));
}

const COLUMNS: ColumnDef<Row, any>[] = [
    { accessorKey: 'id', header: 'ID', size: 80 },
    { accessorKey: 'name', header: 'Name', size: 180 },
    { accessorKey: 'email', header: 'Email', size: 240 },
    { accessorKey: 'role', header: 'Role', size: 120 },
    { accessorKey: 'city', header: 'City', size: 140 },
];

export function LayoutPage() {
    const few = useMemo(() => makeRows(5), []);
    const many = useMemo(() => makeRows(60), []);
    const lots = useMemo(() => makeRows(200), []);

    return (
        <FeatureLayout
            title="Height & scrolling"
            subtitle="Layout"
            description="The grid is a flex column: the header pins to the top, the footer (pagination) pins to the bottom, and the body scrolls between them. Pick one of three height modes."
        >
            <Stack spacing={4}>
                <Alert severity="info">
                    <Typography variant="body2">
                        <strong>Three modes.</strong> <code>Auto</code> (default) grows to content, no inner scroll ·{' '}
                        <code>maxHeight</code> caps the body and scrolls past it · <code>height</code> fixes the grid (use{' '}
                        <code>{"height=\"100%\""}</code> to fill a sized parent) and the body scrolls to fill. A bounded
                        height is all that&apos;s needed for the body to scroll — <strong>no <code>minHeight</code> is required</strong>.
                    </Typography>
                </Alert>

                {/* 1. Auto height */}
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>Auto height</Typography>
                        <Chip label="Default" size="small" color="primary" variant="outlined" />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        No height bound — the grid is exactly as tall as its rows and never scrolls internally.
                    </Typography>
                    <Box id="demo-auto" sx={{ mb: 2 }}>
                        <DataTable<Row> columns={COLUMNS} data={few} />
                    </Box>
                    <CodeBlock language="tsx" code={`<DataTable columns={columns} data={data} />`} />
                </Paper>

                {/* 2. maxHeight (capped) */}
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Capped — <code>maxHeight</code></Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        The body grows until it hits <code>maxHeight</code>, then scrolls. The sticky header stays put.
                        <code>maxHeight</code> works on its own — you don&apos;t also need <code>stickyHeader</code>.
                    </Typography>
                    <Box id="demo-capped" sx={{ mb: 2 }}>
                        <DataTable<Row> columns={COLUMNS} data={many} maxHeight={260} />
                    </Box>
                    <CodeBlock language="tsx" code={`<DataTable columns={columns} data={data} maxHeight={260} />`} />
                </Paper>

                {/* 3. height (fixed / fill) */}
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Fixed / fill — <code>height</code></Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Give the grid a fixed <code>height</code> (or <code>{"\"100%\""}</code> to fill a sized parent). The
                        body flexes to fill the space and scrolls, while the header and the pagination footer stay pinned —
                        the classic dashboard panel. Here the grid fills a fixed-height parent.
                    </Typography>
                    <Box id="demo-fill" sx={{ height: 360, mb: 2 }}>
                        <DataTable<Row>
                            columns={COLUMNS}
                            data={lots}
                            height="100%"
                            enablePagination
                            initialState={{ pagination: { pageIndex: 0, pageSize: 25 } }}
                        />
                    </Box>
                    <CodeBlock
                        language="tsx"
                        code={`// Fill a sized parent — body scrolls between a pinned header & footer
<Box sx={{ height: 360 }}>
  <DataTable columns={columns} data={data} height="100%" enablePagination />
</Box>

// …or a fixed pixel height
<DataTable columns={columns} data={data} height={360} enablePagination />`}
                    />
                </Paper>
            </Stack>
        </FeatureLayout>
    );
}
