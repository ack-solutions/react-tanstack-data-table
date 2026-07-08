/**
 * GridView — the div/CSS-Grid presentation layer (no HTML <table>).
 *
 * Column widths are CSS variables (`--col-<id>-size`) so resize updates one
 * variable instead of re-rendering every cell; pinned columns are sticky with
 * offsets from the same numbers; rows are virtualized when enabled. Theming and
 * density come from the `--dt-*` tokens applied to the root.
 */
import { Box, Skeleton, TablePagination } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { flexRender, type Column, type Row } from '@tanstack/react-table';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';

import { SortAscFeatherIcon, SortDescFeatherIcon } from '../icons';
import { useDataTableTokens } from '../../theme/use-data-table-tokens';
import type { DataTableProps } from '../../types/data-table.types';
import type { UseDataTableResult } from '../../core/use-data-table';
import { GridRoot, GridScroller, GridGrid, GridHeader, GridHeaderRow, GridHeaderCell, GridBody, GridRow, GridCell, GridDetailPanel, GridFooter, GridFooterRow, GridOverlay, GridLoadingOverlay, GridPagination, GridPinnedTopBand, GridPinnedBottomBand } from './styled';
import { resolveSlotProps, mergeSx, joinClassNames } from './slot-utils';
import { resolveScrollLayout } from './scroll-layout';
import { useKeyboardNav, type FocusedCell } from './use-keyboard-nav';
import { EditCell } from './edit-cell';
import { ColumnMenu } from './column-menu';
import { GridAnnouncer } from './grid-announcer';
import { computeColumnTotals, formatAggregation } from '../../utils/aggregation';
import { setNestedValue, coerceEditValue } from '../../utils/table-helpers';
import { LocaleTextProvider } from '../../locale/locale-context';
import { DataTableToolbar } from '../toolbar/data-table-toolbar';
import { BulkActionsToolbar } from '../toolbar/bulk-actions-toolbar';

export interface GridViewProps<T> extends DataTableProps<T> {
    engine: UseDataTableResult<T>;
}

function getAlign(column: Column<any, unknown>): 'left' | 'center' | 'right' {
    return (column.columnDef as any).align ?? 'left';
}

// Map physical align to a LOGICAL text-align so wrapped text flips under RTL
// (start/end resolve by direction). Identity under LTR (start=left, end=right).
function logicalTextAlign(align: 'left' | 'center' | 'right'): 'start' | 'center' | 'end' {
    return align === 'center' ? 'center' : align === 'right' ? 'end' : 'start';
}

// Cells/headers wrap (instead of ellipsis-truncating) when the column opts in.
function textWrapSx(wrapText: boolean): CSSProperties {
    return wrapText
        ? { whiteSpace: 'normal', wordBreak: 'break-word' }
        : { whiteSpace: 'nowrap', textOverflow: 'ellipsis' };
}

function getPinnedStyle(column: Column<any, unknown>, isRtl: boolean): CSSProperties {
    const pinned = column.getIsPinned();
    if (!pinned) return {};
    const isLastLeft = pinned === 'left' && column.getIsLastColumn('left');
    const isFirstRight = pinned === 'right' && column.getIsFirstColumn('right');
    // Logical inset props auto-flip with `dir` (left pin → inline-start), so the
    // pin offsets are correct under RTL with no JS flipping. The box-shadow x-offset
    // is NOT a logical property, so its sign is flipped explicitly under RTL.
    const sx = isRtl ? -1 : 1;
    return {
        position: 'sticky',
        insetInlineStart: pinned === 'left' ? column.getStart('left') : undefined,
        insetInlineEnd: pinned === 'right' ? column.getAfter('right') : undefined,
        zIndex: 'var(--dt-z-pinned)' as unknown as number,
        // Opaque base + row-tint overlay so scrolling content never bleeds through.
        backgroundColor: 'var(--dt-pinned-bg)',
        backgroundImage: 'linear-gradient(var(--dt-row-bg), var(--dt-row-bg))',
        boxShadow: isLastLeft
            ? `${2 * sx}px 0 4px -2px var(--dt-pinned-shadow)`
            : isFirstRight
                ? `${-2 * sx}px 0 4px -2px var(--dt-pinned-shadow)`
                : undefined,
    };
}

export function GridView<T extends Record<string, any>>(props: GridViewProps<T>): ReactNode {
    const {
        engine,
        enableColumnResizing = false,
        enableVirtualization = false,
        enablePagination = false,
        rowsPerPageOptions = [5, 10, 25, 50, 100],
        enableClipboardCopy = false,
        enableAggregation = false,
        stickyHeader,
        stickyFooter,
        enableStickyHeaderOrFooter,
        hover = true,
        striped = false,
        fitToScreen = true,
        maxHeight,
        height,
        minHeight,
        onRowClick,
        getRowClassName,
        getCellClassName,
        loading,
        skeletonRows = 5,
        noRowsMessage,
        emptyMessage,
        enableGlobalFilter,
        enableColumnFilter,
        enableColumnVisibility,
        enableColumnMenu = true,
        enableColumnPinning,
        enableExport,
        enableDensitySelector,
        enableReset,
        enableRefresh,
        enableSavedViews,
        extraFilter,
        enableColumnReordering,
        renderBulkActions,
        renderDetailPanel,
        renderToolbar,
        slots,
        slotProps,
        sx,
        processRowUpdate,
        onProcessRowUpdateError,
        editMode = 'cell',
        onRowEditStart,
        onRowEditStop,
    } = props;

    const showToolbar = !!(enableGlobalFilter || enableColumnFilter || enableColumnVisibility || enableColumnPinning || enableExport || enableDensitySelector || enableReset || enableRefresh || enableSavedViews || extraFilter);
    // `slots.toolbar` fully replaces the toolbar; otherwise the built-in one
    // (which itself honours `renderToolbar` for rearranging controls).
    const ToolbarComponent = (slots?.toolbar ?? DataTableToolbar) as typeof DataTableToolbar;

    const SortAscIcon = slots?.sortIconAsc ?? SortAscFeatherIcon;
    const SortDescIcon = slots?.sortIconDesc ?? SortDescFeatherIcon;

    // Structural slot swaps + their slotProps — resolved ONCE here (never inside
    // render loops; row/cell run per cell per render). See slot-utils.ts for the
    // canonical wiring order.
    const RootSlot = slots?.root ?? GridRoot;
    const ScrollerSlot = slots?.scroller ?? GridScroller;
    const GridTrackSlot = slots?.grid ?? GridGrid;
    const HeaderSlot = slots?.header ?? GridHeader;
    const HeaderRowSlot = slots?.headerRow ?? GridHeaderRow;
    const HeaderCellSlot = slots?.headerCell ?? GridHeaderCell;
    const BodySlot = slots?.body ?? GridBody;
    const RowSlot = slots?.row ?? GridRow;
    const CellSlot = slots?.cell ?? GridCell;
    const DetailPanelSlot = slots?.detailPanel ?? GridDetailPanel;
    const FooterSlot = slots?.footer ?? GridFooter;
    const BulkToolbarSlot = slots?.bulkActionsToolbar ?? BulkActionsToolbar;
    const LoadingOverlaySlot = slots?.loadingOverlay; // default stays skeleton rows
    const NoRowsOverlaySlot = slots?.noRowsOverlay; // default stays the localized text
    const rootSlotProps = resolveSlotProps(slotProps, 'root');
    const scrollerSlotProps = resolveSlotProps(slotProps, 'scroller');
    const gridSlotProps = resolveSlotProps(slotProps, 'grid');
    const headerSlotProps = resolveSlotProps(slotProps, 'header');
    const headerRowSlotProps = resolveSlotProps(slotProps, 'headerRow');
    const headerCellSlotProps = resolveSlotProps(slotProps, 'headerCell');
    const bodySlotProps = resolveSlotProps(slotProps, 'body');
    const rowSlotProps = resolveSlotProps(slotProps, 'row');
    const cellSlotProps = resolveSlotProps(slotProps, 'cell');
    const detailPanelSlotProps = resolveSlotProps(slotProps, 'detailPanel');
    const footerSlotProps = resolveSlotProps(slotProps, 'footer');
    const loadingOverlaySlotProps = resolveSlotProps(slotProps, 'loadingOverlay');
    const noRowsOverlaySlotProps = resolveSlotProps(slotProps, 'noRowsOverlay');

    const { table, refs, derived, state, actions } = engine;
    const locale = engine.localeText;
    const isTree = derived.isTree;
    // First non-special column carries the tree depth indentation.
    const firstDataColId = table.getVisibleLeafColumns().find((c) => !c.id.startsWith('_'))?.id;
    // aria-rowindex is page-global so it matches aria-rowcount (the grand total). Trees
    // grow/shrink as nodes expand, so their count is reported as unknown (-1) and the
    // index stays page/flatten-local.
    const ariaRowStart = isTree ? 0 : enablePagination ? state.pagination.pageIndex * state.pagination.pageSize : 0;
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);
    const density = derived.density;
    const tokens = useDataTableTokens(density);

    const rows = derived.rows;
    // Pinned-row bands (center = `rows`). Empty unless row pinning is active (client mode).
    const topRows = derived.topRows;
    const bottomRows = derived.bottomRows;
    // Monotonic display index across bands → contiguous data-r / aria-rowindex:
    // top rows 0..T-1, center T..T+C-1, bottom T+C..T+C+B-1.
    const topCount = topRows.length;
    const allRenderedRows = topRows.length || bottomRows.length ? [...topRows, ...rows, ...bottomRows] : rows;
    const rowVirtualizer = actions.renderRowModel.rowVirtualizer;
    const isVirtual = enableVirtualization && !enablePagination && rows.length > 0;

    // Publish column widths as CSS variables (recomputed only when sizing changes).
    const columnSizeVars = useMemo(() => {
        const vars: Record<string, string> = {};
        for (const header of table.getFlatHeaders()) {
            vars[`--col-${header.column.id}-size`] = `${header.getSize()}px`;
        }
        return vars;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [table.getState().columnSizingInfo, table.getState().columnSizing, table.getState().columnVisibility, table.getState().columnOrder]);

    const totalSize = table.getTotalSize();
    const columnSizing = table.getState().columnSizing;
    const isRtl = useTheme().direction === 'rtl';
    // Multi-level (grouped) headers: when there's more than one header row, columns
    // must hold their exact widths so a group header spans its leaves pixel-perfectly
    // (flex-grow would stretch a group cell by less than its leaves and misalign them).
    const headerRowCount = table.getHeaderGroups().length;
    const isGrouped = headerRowCount > 1;
    // Full-width default: untouched columns grow to fill spare width (never shrinking
    // below their size, so wide tables scroll instead of cramming). A pinned, non-fit,
    // or user-sized column (manually resized or auto-fitted) instead holds its exact
    // width — so an auto-fit visibly snaps even under fitToScreen.
    const flexFor = (column: Column<any, unknown>): string => {
        const holdWidth = isGrouped || !fitToScreen || column.getIsPinned() || columnSizing[column.id] != null;
        return holdWidth ? `0 0 var(--col-${column.id}-size)` : `1 0 var(--col-${column.id}-size)`;
    };

    // Footer aggregation — client mode only (in server mode the row model is just the
    // loaded page, so totals would be silently page-scoped). Recompute when the filtered
    // (pre-pagination) row set OR a column's aggregation config changes.
    const aggregationEnabled = enableAggregation && !derived.isServerMode;
    const preModel = aggregationEnabled ? (table as any).getPrePaginationRowModel?.() : null;
    const aggKey = aggregationEnabled
        ? table.getAllLeafColumns().map((c) => {
            const a = (c.columnDef as any).aggregation;
            return `${c.id}:${typeof a === 'function' ? 'fn' : a ?? ''}`;
        }).join('|')
        : '';
    const columnTotals = useMemo(
        () => (aggregationEnabled ? computeColumnTotals(table) : {}),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [aggregationEnabled, preModel, aggKey],
    );
    const showAggregation = aggregationEnabled && table.getVisibleLeafColumns().some((c) => columnTotals[c.id] != null);

    // ── Inline editing ────────────────────────────────────────────────────
    const [editing, setEditing] = useState<{ rowId: string; columnId: string } | null>(null);
    const isColEditable = (column: Column<any, unknown>, rowObj: any): boolean => {
        // Tree sub-rows (depth > 0) aren't editable: the local data update walks only the
        // top-level array, so a nested write would silently no-op.
        if ((rowObj.depth ?? 0) > 0) return false;
        const e = (column.columnDef as any).editable;
        return typeof e === 'function' ? !!e(rowObj.original) : !!e;
    };
    const commitEdit = (rowObj: any, column: Column<any, unknown>, value: any) => {
        setEditing(null);
        // Write to the column's accessor field (falling back to id) and compare via the
        // accessor, so columns where id !== accessorKey commit to the right field.
        // setNestedValue handles dot-path accessorKeys (e.g. 'address.city') by deep-setting.
        const field = ((column.columnDef as any).accessorKey as string) ?? column.id;
        if (value === rowObj.getValue(column.id)) return;
        const oldRow = rowObj.original;
        const newRow = setNestedValue(oldRow, field, value);
        if (processRowUpdate) {
            Promise.resolve(processRowUpdate(newRow, oldRow))
                .then((result) => engine.api.data.updateRow(rowObj.id, (result ?? newRow) as any))
                .catch((err) => onProcessRowUpdateError?.(err));
        } else {
            engine.api.data.updateRow(rowObj.id, newRow as any);
        }
    };

    // ── Whole-row edit mode (editMode: 'row') ──────────────────────────────
    // pendingValues are RAW (uncoerced) per columnId — coerced at Save, like cell mode.
    const [rowEditing, setRowEditing] = useState<{ rowId: string; pendingValues: Record<string, any> } | null>(null);
    const rowEditingRef = useRef(rowEditing);
    rowEditingRef.current = rowEditing;

    const enterRowEdit = (rowObj: any) => {
        if (!rowObj || (rowObj.depth ?? 0) > 0) return;
        const pendingValues: Record<string, any> = {};
        for (const cell of rowObj.getVisibleCells()) {
            if (isColEditable(cell.column, rowObj)) pendingValues[cell.column.id] = rowObj.getValue(cell.column.id);
        }
        if (Object.keys(pendingValues).length === 0) return; // nothing editable → no-op
        setEditing(null); // leave any single-cell edit
        setRowEditing({ rowId: rowObj.id, pendingValues });
        onRowEditStart?.({ row: rowObj });
    };
    // Latest enterRowEdit for the memoized handleCellActivate to call without going stale.
    const enterRowEditRef = useRef(enterRowEdit);
    enterRowEditRef.current = enterRowEdit;

    const cancelRowEdit = () => {
        const re = rowEditingRef.current;
        setRowEditing(null);
        if (re) {
            const rowObj = allRenderedRows.find((r) => r.id === re.rowId);
            if (rowObj) onRowEditStop?.({ row: rowObj as any, reason: 'cancel' });
        }
    };

    const commitRow = () => {
        const re = rowEditingRef.current;
        if (!re) return;
        const rowObj = allRenderedRows.find((r) => r.id === re.rowId);
        if (!rowObj) { setRowEditing(null); return; }
        const oldRow = rowObj.original;
        let newRow: any = oldRow;
        let dirty = false;
        for (const [colId, raw] of Object.entries(re.pendingValues)) {
            const col = table.getColumn(colId);
            const original = rowObj.getValue(colId);
            // Untouched fields hold the original (same object) — skip before coercing so a
            // date column (coerce makes a fresh Date) doesn't read as a phantom change.
            if (raw === original) continue;
            const coerced = coerceEditValue(raw, (col?.columnDef as any)?.type, original);
            const sameValue = coerced === original || (coerced instanceof Date && original instanceof Date && coerced.getTime() === original.getTime());
            if (sameValue) continue;
            const field = ((col?.columnDef as any)?.accessorKey as string) ?? colId;
            newRow = setNestedValue(newRow, field, coerced);
            dirty = true;
        }
        const finishStop = () => { setRowEditing(null); onRowEditStop?.({ row: rowObj as any, reason: 'save' }); };
        if (!dirty) { finishStop(); return; }
        if (processRowUpdate) {
            Promise.resolve(processRowUpdate(newRow, oldRow))
                .then((result) => { engine.api.data.updateRow(rowObj.id, (result ?? newRow) as any); finishStop(); })
                .catch((err) => onProcessRowUpdateError?.(err)); // keep the row in edit on reject
        } else {
            engine.api.data.updateRow(rowObj.id, newRow as any);
            finishStop();
        }
    };

    // Register the api.editing handlers (engine pre-seeds the namespace). No deps → each
    // render re-points to fresh closures; getters read the ref so they're always current.
    useEffect(() => {
        const ed = refs.apiRef.current?.editing;
        if (!ed) return;
        ed.startRowEdit = (rowId: string) => { const r = allRenderedRows.find((x) => x.id === rowId); if (r) enterRowEdit(r); };
        ed.saveRowEdit = () => commitRow();
        ed.cancelRowEdit = () => cancelRowEdit();
        ed.getEditingRowId = () => rowEditingRef.current?.rowId ?? null;
        ed.isRowInEditMode = (rowId: string) => rowEditingRef.current?.rowId === rowId;
    });

    // A page change can move the editing row off-page — cancel the in-flight row edit.
    useEffect(() => {
        if (rowEditingRef.current) cancelRowEdit();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.pagination.pageIndex]);

    // Keyboard navigation (WCAG grid): roving tabindex over header(row 0) + data rows.
    // Enter/F2 on an editable cell starts editing; otherwise it activates the cell's control.
    const handleCellActivate = useCallback((cell: FocusedCell) => {
        if (cell.row > 0) {
            // data-r is the monotonic display index (+1), so index the combined band array.
            const r = allRenderedRows[cell.row - 1];
            const col = table.getVisibleLeafColumns()[cell.col];
            if (r && col && isColEditable(col, r)) {
                if (editMode === 'row') enterRowEditRef.current(r);
                else setEditing({ rowId: r.id, columnId: col.id });
                return;
            }
        }
        const container = refs.tableContainerRef.current;
        const el = container?.querySelector<HTMLElement>(`[data-r="${cell.row}"][data-c="${cell.col}"]`);
        if (!el) return;
        const interactive = el.querySelector<HTMLElement>('button, a[href], input:not([type="hidden"]), select, textarea, [role="button"], [role="checkbox"], [role="menuitem"]');
        if (interactive) interactive.click();
        else el.click();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allRenderedRows, table, refs.tableContainerRef, editMode]);

    const kbd = useKeyboardNav({
        rowCount: allRenderedRows.length,
        colCount: table.getVisibleLeafColumns().length,
        containerRef: refs.tableContainerRef,
        // The virtualizer counts only center rows; keyboard row indices are display
        // indices (top band offsets them by topCount), so map back before scrolling.
        scrollToRow: isVirtual ? (i: number) => rowVirtualizer.scrollToIndex(i - topCount) : undefined,
        pageSize: enablePagination ? state.pagination.pageSize : 10,
        onActivate: handleCellActivate,
    });

    const { rootStyle, scrollerStyle } = resolveScrollLayout({
        // `enableStickyHeaderOrFooter` is the deprecated alias for `stickyHeader`.
        stickyHeader: stickyHeader ?? enableStickyHeaderOrFooter,
        stickyFooter,
        enableVirtualization,
        height,
        minHeight,
        maxHeight,
    });
    const emptyText = noRowsMessage ?? emptyMessage ?? locale.noRows;

    const renderHeader = () => {
        const headerGroups = table.getHeaderGroups();
        return headerGroups.map((hg, hgIndex) => (
            <HeaderRowSlot
                key={hg.id}
                {...headerRowSlotProps.rest}
                role="row"
                aria-rowindex={hgIndex + 1}
                className={headerRowSlotProps.className}
                style={headerRowSlotProps.style}
                sx={headerRowSlotProps.sx}
            >
                {hg.headers.map((header, colIndex) => {
                    const column = header.column;
                    // Only the LEAF header row (the last group) participates in the roving
                    // tabindex / data-r-c grid; group header rows above it are decorative.
                    const isLeafRow = hgIndex === headerGroups.length - 1;
                    const isGroupHeader = (column.columns?.length ?? 0) > 0;
                    const align = getAlign(column);
                    const wrapText = !!(column.columnDef as any).wrapText;
                    const headerClassName = (column.columnDef as any).headerClassName as string | undefined;
                    const canSort = column.getCanSort();
                    // Group headers never sort/resize/menu — operations target leaves.
                    const canResize = enableColumnResizing && column.getCanResize() && !isGroupHeader;
                    // Special columns (_selection/_expanding/_actions) are never reorderable —
                    // guard by id so it holds even when column pinning (their usual fence) is off.
                    const canDrag = !!enableColumnReordering && !column.getIsPinned() && !column.id.startsWith('_');
                    const sorted = column.getIsSorted();
                    // Per-column ⋮ menu: leaf, non-placeholder, non-special columns only,
                    // unless the column or table opts out.
                    const showMenu =
                        enableColumnMenu !== false &&
                        !header.isPlaceholder &&
                        (column.columns?.length ?? 0) === 0 &&
                        !column.id.startsWith('_') &&
                        (column.columnDef as any).disableColumnMenu !== true;
                    const isDropTarget = dragOverId === column.id && draggingId !== null && draggingId !== column.id;
                    return (
                        <HeaderCellSlot
                            key={header.id}
                            // slotProps rest FIRST — the behavior props below can't be clobbered.
                            {...headerCellSlotProps.rest}
                            role="columnheader"
                            data-col-id={column.id}
                            data-placeholder={header.isPlaceholder || undefined}
                            aria-colspan={header.colSpan > 1 ? header.colSpan : undefined}
                            {...(isLeafRow ? {
                                'data-r': 0,
                                'data-c': colIndex,
                                tabIndex: kbd.isFocused(0, colIndex) ? 0 : -1,
                                'aria-colindex': colIndex + 1,
                                onFocus: () => kbd.setFocused({ row: 0, col: colIndex }),
                            } : {})}
                            className={joinClassNames(headerClassName, headerCellSlotProps.className)}
                            aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none'}
                            {...(canSort ? { onClick: column.getToggleSortingHandler() } : {})}
                            {...(canDrag ? {
                                onDragOver: (e: any) => { e.preventDefault(); if (dragOverId !== column.id) setDragOverId(column.id); },
                                onDragLeave: () => setDragOverId((cur) => (cur === column.id ? null : cur)),
                                onDrop: (e: any) => {
                                    e.preventDefault();
                                    const dragged = e.dataTransfer.getData('text/plain');
                                    if (dragged && dragged !== column.id) actions.handleColumnReorder(dragged, column.id);
                                    setDragOverId(null);
                                    setDraggingId(null);
                                },
                            } : {})}
                            sx={headerCellSlotProps.sx}
                            style={{
                                // Group headers span their leaves: size from header.getSize() (sum of
                                // leaves) inline — NOT the --col-<id> var, which is keyed by column.id
                                // and collides when a partly-pinned group splits into two header cells.
                                flex: isGroupHeader ? `0 0 ${header.getSize()}px` : flexFor(column),
                                width: isGroupHeader ? `${header.getSize()}px` : `var(--col-${column.id}-size)`,
                                justifyContent: align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start',
                                cursor: canSort ? 'pointer' : 'default',
                                gap: 4,
                                ...getPinnedStyle(column, isRtl),
                                ...(column.getIsPinned() ? { backgroundColor: 'var(--dt-header-bg)', backgroundImage: 'none' } : {}),
                                ...(isDropTarget ? { boxShadow: `inset ${isRtl ? -2 : 2}px 0 0 0 var(--dt-resize-handle)` } : {}),
                                // Slot style LAST — the only channel that can beat inline styles
                                // (sx can't). Overriding flex/width is at-your-own-risk (documented).
                                ...headerCellSlotProps.style,
                            }}
                        >
                            {/* Title + sort icon grow to fill (flex:1) so the ⋮ menu and the
                                resize handle are pushed to the trailing edge — matching MUI. */}
                            <Box
                                component="span"
                                data-header-main
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    flex: 1,
                                    minWidth: 0,
                                    justifyContent: align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start',
                                }}
                            >
                                <Box
                                    component="span"
                                    data-cell-content
                                    draggable={canDrag || undefined}
                                    onDragStart={canDrag ? (e) => { e.dataTransfer.setData('text/plain', column.id); e.dataTransfer.effectAllowed = 'move'; setDraggingId(column.id); } : undefined}
                                    onDragEnd={canDrag ? () => { setDraggingId(null); setDragOverId(null); } : undefined}
                                    sx={{ overflow: 'hidden', ...textWrapSx(wrapText), cursor: canDrag ? 'grab' : undefined }}
                                >
                                    {header.isPlaceholder ? null : flexRender(column.columnDef.header, header.getContext())}
                                </Box>
                                {/* Sort indicator: shown for any sortable column. Faint on cell hover
                                    when unsorted (an affordance that clicking sorts), solid once sorted.
                                    Size via CSS on the child icon (not props) so MUI *and* custom non-MUI
                                    icons (lucide/SVG) both render at 16px without receiving an `sx` prop. */}
                                {canSort ? (
                                    <Box
                                        component="span"
                                        aria-hidden
                                        sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            flexShrink: 0,
                                            '& > svg': { fontSize: 16, width: 16, height: 16 },
                                            opacity: sorted ? 1 : 0,
                                            transition: 'opacity 120ms',
                                            ...(sorted ? {} : { '[role="columnheader"]:hover &': { opacity: 0.45 } }),
                                        }}
                                    >
                                        {sorted === 'desc' ? <SortDescIcon /> : <SortAscIcon />}
                                    </Box>
                                ) : null}
                            </Box>
                            {showMenu ? (
                                <ColumnMenu
                                    column={column}
                                    engine={engine}
                                    enableColumnResizing={enableColumnResizing}
                                    enableColumnVisibility={enableColumnVisibility}
                                    icon={slots?.columnMenuIcon}
                                />
                            ) : null}
                            {canResize ? (
                                // Full-height hit area (easy to grab / double-click to autofit), but the
                                // VISIBLE divider is a short centered line (::before) — revealed on cell
                                // hover, highlighted while hovering the handle or actively resizing.
                                <Box
                                    onMouseDown={header.getResizeHandler()}
                                    onTouchStart={header.getResizeHandler()}
                                    onClick={(e) => e.stopPropagation()}
                                    onDoubleClick={(e) => { e.stopPropagation(); engine.api.columnResizing.autoSizeColumn(column.id); }}
                                    title={locale.autoFitColumn}
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        insetInlineEnd: 0, // logical → flips to the left edge under RTL
                                        height: '100%',
                                        width: '11px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'col-resize',
                                        userSelect: 'none',
                                        touchAction: 'none',
                                        '&::before': {
                                            content: '""',
                                            width: '2px',
                                            height: '60%',
                                            maxHeight: '22px',
                                            borderRadius: '1px',
                                            background: column.getIsResizing() ? 'var(--dt-resize-handle)' : 'var(--dt-border-color)',
                                            opacity: column.getIsResizing() ? 1 : 0,
                                            transition: 'opacity 120ms, background 120ms',
                                        },
                                        '[role="columnheader"]:hover &::before': { opacity: 1 },
                                        '&:hover::before': { background: 'var(--dt-resize-handle)', opacity: 1 },
                                    }}
                                />
                            ) : null}
                        </HeaderCellSlot>
                    );
                })}
            </HeaderRowSlot>
        ));
    };

    const renderRow = (row: Row<T> | undefined, displayIndex: number) => {
        if (!row) return null;
        const isOdd = displayIndex % 2 === 1;
        const isSelected = table.getIsRowSelected?.(row.id) ?? false;
        const pinned = row.getIsPinned?.();
        // Tree mode uses the expander for sub-rows, not a detail panel (mutually exclusive).
        // Pinned rows live in a sticky band, so suppress their detail panel (deferred).
        const isExpanded = !isTree && !!renderDetailPanel && (row.getIsExpanded?.() ?? false) && !pinned;
        const rowClassName = getRowClassName?.({ row, index: displayIndex });
        // Whole-row edit: this row is open, and its first editable cell takes initial focus.
        const isEditingRow = !!rowEditing && rowEditing.rowId === row.id;
        const firstEditableColId = isEditingRow
            ? row.getVisibleCells().find((c) => isColEditable(c.column, row))?.column.id
            : undefined;
        // Pinned rows float across pages, so report their true data position (stable) rather
        // than a page-relative index that would change per page and collide with center rows.
        // +1 is 1-based; +headerRowCount skips the (possibly multiple, grouped) header rows.
        const ariaRowIndex = (pinned ? row.index : ariaRowStart + displayIndex) + headerRowCount + 1;
        return (
            <Fragment key={row.id}>
            <RowSlot
                {...rowSlotProps.rest}
                role="row"
                aria-rowindex={ariaRowIndex}
                aria-level={isTree ? row.depth + 1 : undefined}
                aria-expanded={isTree && (row.getCanExpand?.() ?? false) ? row.getIsExpanded() : undefined}
                className={joinClassNames(rowClassName, rowSlotProps.className)}
                aria-selected={isSelected || undefined}
                onClick={onRowClick ? (e: any) => onRowClick(e, row) : undefined}
                style={rowSlotProps.style}
                sx={mergeSx({
                    '--dt-row-bg': isSelected
                        ? 'var(--dt-row-bg-selected)'
                        : striped && isOdd
                            ? 'var(--dt-row-bg-stripe)'
                            : 'var(--dt-pinned-bg)',
                    background: 'var(--dt-row-bg)',
                    cursor: onRowClick ? 'pointer' : 'default',
                    ...(hover ? { '&:hover': { '--dt-row-bg': 'var(--dt-row-bg-hover)' } } : {}),
                }, rowSlotProps.sx)}
            >
                {row.getVisibleCells().map((cell, colIndex) => {
                    const column = cell.column;
                    const align = getAlign(column);
                    const def = column.columnDef as any;
                    const wrapText = !!def.wrapText;
                    const value = cell.getValue();
                    const cellClassName = joinClassNames(
                        typeof def.cellClassName === 'function'
                            ? def.cellClassName({ value, row: row.original })
                            : def.cellClassName,
                        getCellClassName?.({ row, columnId: column.id, value }),
                    );
                    const editable = isColEditable(column, row);
                    const cellEditing = !!editing && editing.rowId === row.id && editing.columnId === column.id;
                    const cellInRowEdit = isEditingRow && editable;
                    const cellOpen = cellEditing || cellInRowEdit;
                    return (
                        <CellSlot
                            key={cell.id}
                            // slotProps rest FIRST — keyboard/edit/aria props below can't be clobbered.
                            {...cellSlotProps.rest}
                            role="gridcell"
                            data-col-id={column.id}
                            data-r={displayIndex + 1}
                            data-c={colIndex}
                            tabIndex={kbd.isFocused(displayIndex + 1, colIndex) ? 0 : -1}
                            aria-colindex={colIndex + 1}
                            onFocus={() => kbd.setFocused({ row: displayIndex + 1, col: colIndex })}
                            onDoubleClick={editable ? (e: any) => { e.stopPropagation(); if (editMode === 'row') enterRowEdit(row); else setEditing({ rowId: row.id, columnId: column.id }); } : undefined}
                            onClick={editable || cellOpen ? (e: any) => e.stopPropagation() : undefined}
                            className={joinClassNames(cellClassName, cellSlotProps.className)}
                            {...(cellSlotProps.sx ? { sx: cellSlotProps.sx } : {})}
                            style={{
                                flex: flexFor(column),
                                width: `var(--col-${column.id}-size)`,
                                justifyContent: cellOpen ? 'stretch' : align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start',
                                cursor: editable && !cellOpen ? 'text' : undefined,
                                ...getPinnedStyle(column, isRtl),
                                // Edit mode: a clean full-cell ring (no stray underline), after
                                // getPinnedStyle so it wins over a pinned cell's shadow.
                                ...(cellOpen ? { boxShadow: 'inset 0 0 0 2px var(--dt-resize-handle)', backgroundColor: 'var(--dt-row-bg)' } : {}),
                                ...cellSlotProps.style,
                            }}
                        >
                            {cellOpen ? (
                                <EditCell
                                    column={column}
                                    row={row}
                                    initialValue={value}
                                    align={align}
                                    onCommit={(v) => commitEdit(row, column, v)}
                                    onCancel={cellInRowEdit ? cancelRowEdit : () => setEditing(null)}
                                    editMode={cellInRowEdit ? 'row' : 'cell'}
                                    value={cellInRowEdit ? rowEditing!.pendingValues[column.id] : undefined}
                                    onChange={cellInRowEdit ? (v) => setRowEditing((re) => (re ? { ...re, pendingValues: { ...re.pendingValues, [column.id]: v } } : re)) : undefined}
                                    onEnter={cellInRowEdit ? commitRow : undefined}
                                    autoFocusEditor={cellInRowEdit ? column.id === firstEditableColId : true}
                                />
                            ) : (
                                <Box component="span" data-cell-content sx={{ minWidth: 0, width: '100%', overflow: 'hidden', ...textWrapSx(wrapText), textAlign: logicalTextAlign(align), ...(isTree && column.id === firstDataColId && row.depth ? { marginInlineStart: `${row.depth * 16}px` } : {}) }}>
                                    {flexRender(column.columnDef.cell, cell.getContext())}
                                </Box>
                            )}
                        </CellSlot>
                    );
                })}
            </RowSlot>
            {isExpanded ? (
                <DetailPanelSlot
                    {...detailPanelSlotProps.rest}
                    role="row"
                    className={detailPanelSlotProps.className}
                    style={detailPanelSlotProps.style}
                    sx={detailPanelSlotProps.sx}
                >{renderDetailPanel!(row)}</DetailPanelSlot>
            ) : null}
            </Fragment>
        );
    };

    const renderBody = () => {
        if (loading) {
            // A custom loadingOverlay replaces the skeleton rows; else the default skeletons.
            if (LoadingOverlaySlot) {
                return (
                    <GridLoadingOverlay {...loadingOverlaySlotProps.rest} role="row" className={loadingOverlaySlotProps.className} style={loadingOverlaySlotProps.style} sx={loadingOverlaySlotProps.sx}>
                        <LoadingOverlaySlot />
                    </GridLoadingOverlay>
                );
            }
            return Array.from({ length: skeletonRows }).map((_, i) => (
                <GridRow key={`sk-${i}`} role="row">
                    {table.getVisibleLeafColumns().map((column) => (
                        <GridCell key={column.id} role="cell" style={{ flex: flexFor(column), width: `var(--col-${column.id}-size)`, ...getPinnedStyle(column, isRtl) }}>
                            <Skeleton width="80%" />
                        </GridCell>
                    ))}
                </GridRow>
            ));
        }
        if (rows.length === 0) {
            return (
                <GridOverlay {...noRowsOverlaySlotProps.rest} role="row" className={noRowsOverlaySlotProps.className} style={noRowsOverlaySlotProps.style} sx={noRowsOverlaySlotProps.sx}>
                    {NoRowsOverlaySlot ? <NoRowsOverlaySlot emptyText={emptyText} /> : emptyText}
                </GridOverlay>
            );
        }
        if (isVirtual) {
            const virtualRows = rowVirtualizer.getVirtualItems();
            const paddingTop = virtualRows.length ? virtualRows[0].start : 0;
            const paddingBottom = virtualRows.length ? rowVirtualizer.getTotalSize() - virtualRows[virtualRows.length - 1].end : 0;
            return (
                <>
                    {paddingTop > 0 ? <div style={{ height: paddingTop }} /> : null}
                    {virtualRows.map((vr) => renderRow(rows[vr.index], topCount + vr.index))}
                    {paddingBottom > 0 ? <div style={{ height: paddingBottom }} /> : null}
                </>
            );
        }
        // Center rows start after the top band so their display index stays contiguous.
        return rows.map((row, i) => renderRow(row, topCount + i));
    };

    // A pinned band (top or bottom) reuses renderRow with the band's display-index offset.
    const renderPinnedBand = (bandRows: Row<T>[], startDisplayIndex: number) =>
        bandRows.map((row, i) => renderRow(row, startDisplayIndex + i));

    const renderAggregation = () => (
        <GridFooterRow role="row">
            {table.getVisibleLeafColumns().map((column) => {
                const align = getAlign(column);
                const total = columnTotals[column.id];
                const text = total ? formatAggregation(total.kind, total.value) : '';
                return (
                    <GridCell
                        key={column.id}
                        role="cell"
                        data-col-id={column.id}
                        style={{
                            flex: flexFor(column),
                            width: `var(--col-${column.id}-size)`,
                            justifyContent: align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start',
                            ...getPinnedStyle(column, isRtl),
                            ...(column.getIsPinned() ? { backgroundColor: 'var(--dt-header-bg)', backgroundImage: 'none' } : {}),
                        }}
                    >
                        <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{text}</Box>
                    </GridCell>
                );
            })}
        </GridFooterRow>
    );

    return (
        <LocaleTextProvider value={locale}>
        <RootSlot
            // dir first so slotProps.root can deliberately override it.
            dir={isRtl ? 'rtl' : undefined}
            {...rootSlotProps.rest}
            className={joinClassNames(props.className, rootSlotProps.className)}
            // Merge (not replace) so slotProps.root.style adds properties without
            // nuking the whole style. The --dt-* tokens and scroll-layout height are
            // required, so they win per-property (spread LAST) — matching the scroller
            // and grid-track sites. Override tokens via `sx`/theme and height via the
            // `height` prop, not by racing this inline style.
            style={{ ...rootSlotProps.style, ...tokens, ...rootStyle }}
            sx={mergeSx(sx, rootSlotProps.sx)}
        >
            <GridAnnouncer engine={engine} />
            {showToolbar ? (
                <ToolbarComponent
                    engine={engine}
                    enableGlobalFilter={enableGlobalFilter}
                    enableColumnFilter={enableColumnFilter}
                    enableColumnVisibility={enableColumnVisibility}
                    enableColumnPinning={enableColumnPinning}
                    enableColumnReordering={enableColumnReordering}
                    enableExport={enableExport}
                    enableDensitySelector={enableDensitySelector}
                    enableReset={enableReset}
                    enableRefresh={enableRefresh}
                    enableSavedViews={enableSavedViews}
                    extraFilter={extraFilter}
                    slots={slots}
                    slotProps={slotProps}
                    renderToolbar={renderToolbar}
                />
            ) : null}
            {derived.isSomeRowsSelected ? (
                <BulkToolbarSlot
                    engine={engine}
                    selectedCount={derived.selectedRowCount}
                    selectionState={state.selectionState}
                    onClear={() => engine.api.selection.deselectAll()}
                    onCopy={enableClipboardCopy ? () => { void engine.api.clipboard.copySelectedRows(); } : undefined}
                    renderBulkActions={renderBulkActions}
                    {...(slotProps?.bulkActionsToolbar ?? {})}
                />
            ) : null}
            <ScrollerSlot
                {...scrollerSlotProps.rest}
                ref={refs.tableContainerRef}
                role={isTree ? 'treegrid' : 'grid'}
                aria-rowcount={isTree ? -1 : derived.tableTotalRow + headerRowCount}
                aria-colcount={table.getVisibleLeafColumns().length}
                onKeyDown={kbd.onKeyDown}
                className={scrollerSlotProps.className}
                sx={scrollerSlotProps.sx}
                // scrollerStyle is the required fixed-height layout — internal wins per-property.
                style={{ ...scrollerSlotProps.style, ...scrollerStyle }}
            >
                <GridTrackSlot
                    {...gridSlotProps.rest}
                    className={gridSlotProps.className}
                    sx={gridSlotProps.sx}
                    // columnSizeVars/width/minWidth are required layout — spread AFTER slot style.
                    style={{ ...gridSlotProps.style, ...columnSizeVars, width: fitToScreen ? '100%' : totalSize, minWidth: totalSize } as CSSProperties}
                >
                    <HeaderSlot {...headerSlotProps.rest} role="rowgroup" className={headerSlotProps.className} style={headerSlotProps.style} sx={headerSlotProps.sx}>{renderHeader()}</HeaderSlot>
                    {!loading && topRows.length ? (
                        // Parks just under the always-sticky header.
                        <GridPinnedTopBand role="rowgroup" style={{ top: 'var(--dt-header-height)' }}>
                            {renderPinnedBand(topRows, 0)}
                        </GridPinnedTopBand>
                    ) : null}
                    <BodySlot {...bodySlotProps.rest} role="rowgroup" className={bodySlotProps.className} style={bodySlotProps.style} sx={bodySlotProps.sx}>{renderBody()}</BodySlot>
                    {!loading && bottomRows.length ? (
                        // Parks above the aggregation footer (when present), else at the viewport bottom.
                        <GridPinnedBottomBand role="rowgroup" style={{ bottom: showAggregation ? 'var(--dt-row-height)' : 0 }}>
                            {renderPinnedBand(bottomRows, topCount + rows.length)}
                        </GridPinnedBottomBand>
                    ) : null}
                    {showAggregation ? <div role="rowgroup">{renderAggregation()}</div> : null}
                </GridTrackSlot>
            </ScrollerSlot>

            {enablePagination ? (
                <FooterSlot {...footerSlotProps.rest} className={footerSlotProps.className} style={footerSlotProps.style} sx={footerSlotProps.sx}>
                    <GridPagination>
                    {(() => {
                        const PaginationComponent = slots?.pagination ?? TablePagination;
                        // Keep the current pageSize in the options so MUI's Select always has a
                        // matching value (avoids its out-of-range console error when the active
                        // pageSize isn't one of the configured choices). `[]` still hides the selector.
                        const pageSizeOptions =
                            rowsPerPageOptions.length > 0 && !rowsPerPageOptions.includes(state.pagination.pageSize)
                                ? [...rowsPerPageOptions, state.pagination.pageSize].sort((a, b) => a - b)
                                : rowsPerPageOptions;
                        return (
                            <PaginationComponent
                                component="div"
                                count={derived.tableTotalRow}
                                page={state.pagination.pageIndex}
                                rowsPerPage={state.pagination.pageSize}
                                onPageChange={(_: unknown, page: number) => engine.api.pagination.goToPage(page)}
                                onRowsPerPageChange={(e: any) => engine.api.pagination.setPageSize(Number(e.target.value))}
                                rowsPerPageOptions={pageSizeOptions}
                                labelRowsPerPage={locale.paginationRowsPerPage}
                                labelDisplayedRows={({ from, to, count }: { from: number; to: number; count: number }) => locale.paginationDisplayedRows({ from, to, count })}
                                // slotProps.pagination LAST (leaf control) — deliberate overrides win.
                                {...(slotProps?.pagination ?? {})}
                            />
                        );
                    })()}
                    </GridPagination>
                </FooterSlot>
            ) : null}
        </RootSlot>
        </LocaleTextProvider>
    );
}
