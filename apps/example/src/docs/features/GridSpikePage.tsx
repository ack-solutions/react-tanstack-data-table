/**
 * Grid Spike (Phase 0 POC)
 * --------------------------------------------------------------------------
 * Proves the rebuild approach in isolation — NO HTML <table>.
 *
 * Demonstrates the hard combo working together:
 *   1. div + flex layout (cells are real boxes, not table-cells)
 *   2. column widths driven by CSS variables (--col-<id>-size)
 *   3. column resize that updates ONLY the dragged column (no spring-back),
 *      respecting minSize/maxSize, by rewriting the CSS variable
 *   4. pinned columns (sticky, offsets from the same numbers)
 *   5. row virtualization over 10,000 rows
 *   6. MUI theming feel + density + a CSS-variable theme token preview
 *
 * This file intentionally does NOT use the package engine — the point of a
 * spike is to de-risk the *rendering* before porting the real components.
 */
import { useMemo, useRef, useState, type CSSProperties } from 'react';
import {
    Box,
    Chip,
    FormControlLabel,
    LinearProgress,
    Paper,
    Stack,
    Switch,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type Column,
    type ColumnDef,
    type ColumnPinningState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';

// ---------------------------------------------------------------- data model
interface Person {
    id: number;
    index: number;
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

function makeData(count: number): Person[] {
    const rows: Person[] = [];
    for (let i = 0; i < count; i++) {
        const first = FIRST[i % FIRST.length];
        const last = LAST[(i * 7) % LAST.length];
        rows.push({
            id: i + 1,
            index: i + 1,
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
        });
    }
    return rows;
}

const STATUS_COLOR: Record<Person['status'], 'success' | 'warning' | 'default'> = {
    active: 'success',
    pending: 'warning',
    inactive: 'default',
};

const RIGHT_ALIGNED = new Set(['age', 'amount']);
const alignOf = (id: string): 'left' | 'right' => (RIGHT_ALIGNED.has(id) ? 'right' : 'left');

// ------------------------------------------------------------------- columns
const columns: ColumnDef<Person>[] = [
    { id: 'index', header: '#', accessorKey: 'index', size: 64, minSize: 64, maxSize: 64, enableResizing: false },
    { id: 'name', header: 'Name', accessorKey: 'name', size: 200, minSize: 120, maxSize: 360 },
    { id: 'email', header: 'Email', accessorKey: 'email', size: 250, minSize: 160 },
    { id: 'company', header: 'Company', accessorKey: 'company', size: 180, minSize: 120 },
    { id: 'city', header: 'City', accessorKey: 'city', size: 150, minSize: 100 },
    { id: 'country', header: 'Country', accessorKey: 'country', size: 140, minSize: 90 },
    { id: 'age', header: 'Age', accessorKey: 'age', size: 90, minSize: 70, maxSize: 140 },
    {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
        size: 130,
        minSize: 110,
        cell: (ctx) => {
            const v = ctx.getValue() as Person['status'];
            return <Chip size="small" label={v} color={STATUS_COLOR[v]} variant={v === 'inactive' ? 'outlined' : 'filled'} />;
        },
    },
    {
        id: 'amount',
        header: 'Amount',
        accessorKey: 'amount',
        size: 140,
        minSize: 100,
        cell: (ctx) => `$${(ctx.getValue() as number).toLocaleString()}`,
    },
    {
        id: 'progress',
        header: 'Progress',
        accessorKey: 'progress',
        size: 180,
        minSize: 120,
        cell: (ctx) => {
            const v = ctx.getValue() as number;
            return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <LinearProgress variant="determinate" value={v} sx={{ flex: 1, height: 6, borderRadius: 3 }} />
                    <Box component="span" sx={{ fontSize: '0.75rem', minWidth: 34, textAlign: 'right' }}>{v}%</Box>
                </Box>
            );
        },
    },
    { id: 'date', header: 'Date', accessorKey: 'date', size: 140, minSize: 110 },
    {
        id: 'actions',
        header: 'Actions',
        size: 100,
        minSize: 100,
        maxSize: 100,
        enableResizing: false,
        cell: () => <Chip size="small" label="View" variant="outlined" clickable />,
    },
];

// ------------------------------------------------------ pinned sticky styling
function getPinnedStyles(column: Column<Person>): CSSProperties {
    const pinned = column.getIsPinned();
    if (!pinned) return {};
    const isLastLeft = pinned === 'left' && column.getIsLastColumn('left');
    const isFirstRight = pinned === 'right' && column.getIsFirstColumn('right');
    return {
        position: 'sticky',
        left: pinned === 'left' ? column.getStart('left') : undefined,
        right: pinned === 'right' ? column.getAfter('right') : undefined,
        zIndex: 2,
        // Opaque base + row tint overlay so scrolling content never bleeds
        // through, even when --row-bg is a translucent stripe/hover colour.
        backgroundColor: 'var(--dt-base-bg)',
        backgroundImage: 'linear-gradient(var(--row-bg), var(--row-bg))',
        boxShadow: isLastLeft
            ? '2px 0 4px -2px rgba(0,0,0,0.25)'
            : isFirstRight
                ? '-2px 0 4px -2px rgba(0,0,0,0.25)'
                : undefined,
    };
}

// ------------------------------------------------------------------ the page
export function GridSpikePage() {
    const theme = useTheme();
    const [density, setDensity] = useState<'compact' | 'standard'>('standard');
    const [stripes, setStripes] = useState(true);
    const [fitToScreen, setFitToScreen] = useState(false);

    const data = useMemo(() => makeData(10000), []);

    const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
        left: ['index', 'name'],
        right: ['actions'],
    });

    const table = useReactTable({
        data,
        columns,
        state: { columnPinning },
        onColumnPinningChange: setColumnPinning,
        columnResizeMode: 'onChange',
        enableColumnResizing: true,
        enableColumnPinning: true,
        getCoreRowModel: getCoreRowModel(),
    });

    const rowHeight = density === 'compact' ? 38 : 50;

    const scrollRef = useRef<HTMLDivElement>(null);
    const { rows } = table.getRowModel();

    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => scrollRef.current,
        estimateSize: () => rowHeight,
        overscan: 10,
    });

    const virtualRows = rowVirtualizer.getVirtualItems();
    const totalHeight = rowVirtualizer.getTotalSize();
    const paddingTop = virtualRows.length ? virtualRows[0].start : 0;
    const paddingBottom = virtualRows.length ? totalHeight - virtualRows[virtualRows.length - 1].end : 0;

    // The key trick: publish every column width as a CSS variable. Cells read
    // width: var(--col-<id>-size). On resize we only rewrite the variable for the
    // dragged column, so neighbours never move and there is no spring-back.
    // Recomputed only when sizing changes (cheap — just numbers).
    const columnSizeVars = useMemo(() => {
        const vars: Record<string, string> = {};
        for (const header of table.getFlatHeaders()) {
            vars[`--col-${header.column.id}-size`] = `${header.getSize()}px`;
        }
        return vars;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [table.getState().columnSizingInfo, table.getState().columnSizing]);

    const totalSize = table.getTotalSize();

    const flexFor = (column: Column<Person>) =>
        fitToScreen && !column.getIsPinned()
            ? `1 1 var(--col-${column.id}-size)`
            : `0 0 var(--col-${column.id}-size)`;

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Grid Spike — div + CSS Grid (POC)</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 760 }}>
                No HTML <code>&lt;table&gt;</code>. Column widths are CSS variables on a flex layout.
                Drag a column edge to resize — only that column changes, neighbours stay put, and{' '}
                <code>minSize</code>/<code>maxSize</code> are respected. Scroll 10,000 virtualized rows;
                the pinned <strong>#</strong>/<strong>Name</strong> (left) and <strong>Actions</strong> (right)
                columns stay aligned to the pixel.
            </Typography>

            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <ToggleButtonGroup size="small" exclusive value={density} onChange={(_, v) => v && setDensity(v)}>
                    <ToggleButton value="compact">Compact</ToggleButton>
                    <ToggleButton value="standard">Standard</ToggleButton>
                </ToggleButtonGroup>
                <FormControlLabel control={<Switch checked={stripes} onChange={(e) => setStripes(e.target.checked)} />} label="Stripes" />
                <FormControlLabel control={<Switch checked={fitToScreen} onChange={(e) => setFitToScreen(e.target.checked)} />} label="Fit to screen" />
                <Box sx={{ flex: 1 }} />
                <Typography variant="caption" color="text.secondary">
                    {rows.length.toLocaleString()} rows · {table.getVisibleLeafColumns().length} cols
                </Typography>
            </Stack>

            <Paper variant="outlined" sx={{ overflow: 'hidden', borderRadius: 2 }}>
                <Box
                    ref={scrollRef}
                    role="table"
                    aria-rowcount={rows.length}
                    aria-colcount={table.getVisibleLeafColumns().length}
                    sx={{
                        position: 'relative',
                        overflow: 'auto',
                        maxHeight: 560,
                        // Phase 3 preview: theme tokens exposed as CSS variables
                        '--dt-border': theme.palette.divider,
                        '--dt-base-bg': theme.palette.background.paper,
                        '--header-bg': theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100],
                    }}
                >
                    <Box style={{ ...columnSizeVars, width: fitToScreen ? '100%' : totalSize, minWidth: totalSize } as CSSProperties}>
                        {/* ----------------------------------------------- header */}
                        <Box role="rowgroup" sx={{ position: 'sticky', top: 0, zIndex: 3 }}>
                            {table.getHeaderGroups().map((hg) => (
                                <Box
                                    key={hg.id}
                                    role="row"
                                    sx={{
                                        display: 'flex',
                                        height: rowHeight,
                                        '--row-bg': 'var(--header-bg)',
                                        background: 'var(--row-bg)',
                                        borderBottom: '1px solid var(--dt-border)',
                                    }}
                                >
                                    {hg.headers.map((header) => {
                                        const align = alignOf(header.column.id);
                                        const canResize = header.column.getCanResize();
                                        const isPinned = !!header.column.getIsPinned();
                                        return (
                                            <Box
                                                key={header.id}
                                                role="columnheader"
                                                aria-sort="none"
                                                sx={{
                                                    boxSizing: 'border-box',
                                                    flex: flexFor(header.column),
                                                    width: `var(--col-${header.column.id}-size)`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
                                                    position: 'relative',
                                                    px: 1.5,
                                                    fontWeight: 600,
                                                    fontSize: density === 'compact' ? '0.75rem' : '0.8125rem',
                                                    color: 'text.secondary',
                                                    ...getPinnedStyles(header.column),
                                                    ...(isPinned ? { backgroundColor: 'var(--header-bg)', backgroundImage: 'none' } : {}),
                                                }}
                                            >
                                                <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                </Box>
                                                {canResize && (
                                                    <Box
                                                        onMouseDown={header.getResizeHandler()}
                                                        onTouchStart={header.getResizeHandler()}
                                                        onClick={(e) => e.stopPropagation()}
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            right: 0,
                                                            height: '100%',
                                                            width: '6px',
                                                            cursor: 'col-resize',
                                                            userSelect: 'none',
                                                            touchAction: 'none',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            '&:hover > span': { background: theme.palette.primary.main, width: '2px' },
                                                        }}
                                                    >
                                                        <Box
                                                            component="span"
                                                            sx={{
                                                                width: header.column.getIsResizing() ? '2px' : '1px',
                                                                height: '60%',
                                                                background: header.column.getIsResizing() ? theme.palette.primary.main : 'var(--dt-border)',
                                                            }}
                                                        />
                                                    </Box>
                                                )}
                                            </Box>
                                        );
                                    })}
                                </Box>
                            ))}
                        </Box>

                        {/* ------------------------------------------------- body */}
                        <Box role="rowgroup">
                            {paddingTop > 0 && <Box style={{ height: paddingTop }} />}
                            {virtualRows.map((vr) => {
                                const row = rows[vr.index];
                                const isOdd = vr.index % 2 === 1;
                                return (
                                    <Box
                                        key={row.id}
                                        role="row"
                                        sx={{
                                            display: 'flex',
                                            height: rowHeight,
                                            '--row-bg': stripes && isOdd ? alpha(theme.palette.primary.main, 0.04) : theme.palette.background.paper,
                                            background: 'var(--row-bg)',
                                            borderBottom: '1px solid var(--dt-border)',
                                            '&:hover': { '--row-bg': theme.palette.action.hover },
                                        }}
                                    >
                                        {row.getVisibleCells().map((cell) => {
                                            const align = alignOf(cell.column.id);
                                            return (
                                                <Box
                                                    key={cell.id}
                                                    role="cell"
                                                    sx={{
                                                        boxSizing: 'border-box',
                                                        flex: flexFor(cell.column),
                                                        width: `var(--col-${cell.column.id}-size)`,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
                                                        px: 1.5,
                                                        minWidth: 0,
                                                        fontSize: density === 'compact' ? '0.8125rem' : '0.875rem',
                                                        ...getPinnedStyles(cell.column),
                                                    }}
                                                >
                                                    <Box
                                                        component="span"
                                                        sx={{
                                                            minWidth: 0,
                                                            width: '100%',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                            textAlign: align,
                                                        }}
                                                    >
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </Box>
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                );
                            })}
                            {paddingBottom > 0 && <Box style={{ height: paddingBottom }} />}
                        </Box>
                    </Box>
                </Box>
            </Paper>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                What to try: (1) drag the right edge of <strong>Email</strong> or <strong>Company</strong> — smooth, no neighbour movement;
                (2) shrink <strong>Name</strong> past 120px — it stops (minSize); (3) toggle <strong>Fit to screen</strong> —
                columns fill the width while pinned columns stay fixed; (4) scroll fast — virtualization keeps it light.
            </Typography>
        </Box>
    );
}

export default GridSpikePage;
