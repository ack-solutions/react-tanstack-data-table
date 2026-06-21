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
import { Fragment, useCallback, useMemo, useState, type CSSProperties, type ReactNode } from 'react';

import { SortAscFeatherIcon, SortDescFeatherIcon } from '../icons';
import { useDataTableTokens } from '../../theme/use-data-table-tokens';
import type { DataTableProps } from '../../types/data-table.types';
import type { UseDataTableResult } from '../../core/use-data-table';
import { GridRoot, GridScroller, GridHeader, GridHeaderRow, GridHeaderCell, GridBody, GridRow, GridCell, GridDetailPanel, GridFooter, GridFooterRow, GridOverlay, GridPinnedTopBand, GridPinnedBottomBand } from './styled';
import { resolveScrollLayout } from './scroll-layout';
import { useKeyboardNav, type FocusedCell } from './use-keyboard-nav';
import { EditCell } from './edit-cell';
import { ColumnMenu } from './column-menu';
import { GridAnnouncer } from './grid-announcer';
import { computeColumnTotals, formatAggregation } from '../../utils/aggregation';
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

// Join class hooks (per-column + table-level), dropping falsy results; returns
// `undefined` when empty so we never emit a bare `class=""`.
function joinClassNames(...names: Array<string | undefined | null | false>): string | undefined {
    const joined = names.filter(Boolean).join(' ');
    return joined || undefined;
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
        processRowUpdate,
        onProcessRowUpdateError,
    } = props;

    const showToolbar = !!(enableGlobalFilter || enableColumnFilter || enableColumnVisibility || enableColumnPinning || enableExport || enableDensitySelector || enableReset || enableRefresh || enableSavedViews || extraFilter);
    // `slots.toolbar` fully replaces the toolbar; otherwise the built-in one
    // (which itself honours `renderToolbar` for rearranging controls).
    const ToolbarComponent = (slots?.toolbar ?? DataTableToolbar) as typeof DataTableToolbar;

    const SortAscIcon = slots?.sortIconAsc ?? SortAscFeatherIcon;
    const SortDescIcon = slots?.sortIconDesc ?? SortDescFeatherIcon;

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
        const field = ((column.columnDef as any).accessorKey as string) ?? column.id;
        if (value === rowObj.getValue(column.id)) return;
        const oldRow = rowObj.original;
        const newRow = { ...oldRow, [field]: value };
        if (processRowUpdate) {
            Promise.resolve(processRowUpdate(newRow, oldRow))
                .then((result) => engine.api.data.updateRow(rowObj.id, (result ?? newRow) as any))
                .catch((err) => onProcessRowUpdateError?.(err));
        } else {
            engine.api.data.updateRow(rowObj.id, newRow as any);
        }
    };

    // Keyboard navigation (WCAG grid): roving tabindex over header(row 0) + data rows.
    // Enter/F2 on an editable cell starts editing; otherwise it activates the cell's control.
    const handleCellActivate = useCallback((cell: FocusedCell) => {
        if (cell.row > 0) {
            // data-r is the monotonic display index (+1), so index the combined band array.
            const r = allRenderedRows[cell.row - 1];
            const col = table.getVisibleLeafColumns()[cell.col];
            if (r && col && isColEditable(col, r)) { setEditing({ rowId: r.id, columnId: col.id }); return; }
        }
        const container = refs.tableContainerRef.current;
        const el = container?.querySelector<HTMLElement>(`[data-r="${cell.row}"][data-c="${cell.col}"]`);
        if (!el) return;
        const interactive = el.querySelector<HTMLElement>('button, a[href], input:not([type="hidden"]), select, textarea, [role="button"], [role="checkbox"], [role="menuitem"]');
        if (interactive) interactive.click();
        else el.click();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allRenderedRows, table, refs.tableContainerRef]);

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
            <GridHeaderRow key={hg.id} role="row" aria-rowindex={hgIndex + 1}>
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
                        <GridHeaderCell
                            key={header.id}
                            role="columnheader"
                            data-col-id={column.id}
                            data-placeholder={header.isPlaceholder || undefined}
                            aria-colspan={header.colSpan > 1 ? header.colSpan : undefined}
                            data-r={isLeafRow ? 0 : undefined}
                            data-c={isLeafRow ? colIndex : undefined}
                            tabIndex={isLeafRow ? (kbd.isFocused(0, colIndex) ? 0 : -1) : undefined}
                            aria-colindex={isLeafRow ? colIndex + 1 : undefined}
                            onFocus={isLeafRow ? () => kbd.setFocused({ row: 0, col: colIndex }) : undefined}
                            className={headerClassName}
                            aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none'}
                            onClick={canSort ? column.getToggleSortingHandler() : undefined}
                            onDragOver={canDrag ? (e) => { e.preventDefault(); if (dragOverId !== column.id) setDragOverId(column.id); } : undefined}
                            onDragLeave={canDrag ? () => setDragOverId((cur) => (cur === column.id ? null : cur)) : undefined}
                            onDrop={canDrag ? (e) => {
                                e.preventDefault();
                                const dragged = e.dataTransfer.getData('text/plain');
                                if (dragged && dragged !== column.id) actions.handleColumnReorder(dragged, column.id);
                                setDragOverId(null);
                                setDraggingId(null);
                            } : undefined}
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
                            {sorted ? (
                                // Size via CSS on the child icon (not props) so MUI *and* custom
                                // non-MUI icons (lucide/SVG) both render at 16px without receiving an `sx` prop.
                                <Box
                                    component="span"
                                    aria-hidden
                                    sx={{ display: 'inline-flex', alignItems: 'center', '& > svg': { fontSize: 16, width: 16, height: 16 } }}
                                >
                                    {sorted === 'asc' ? <SortAscIcon /> : <SortDescIcon />}
                                </Box>
                            ) : null}
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
                                        width: '6px',
                                        cursor: 'col-resize',
                                        userSelect: 'none',
                                        touchAction: 'none',
                                        '&:hover': { background: 'var(--dt-resize-handle)' },
                                        ...(column.getIsResizing() ? { background: 'var(--dt-resize-handle)' } : {}),
                                    }}
                                />
                            ) : null}
                        </GridHeaderCell>
                    );
                })}
            </GridHeaderRow>
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
        // Pinned rows float across pages, so report their true data position (stable) rather
        // than a page-relative index that would change per page and collide with center rows.
        // +1 is 1-based; +headerRowCount skips the (possibly multiple, grouped) header rows.
        const ariaRowIndex = (pinned ? row.index : ariaRowStart + displayIndex) + headerRowCount + 1;
        return (
            <Fragment key={row.id}>
            <GridRow
                role="row"
                aria-rowindex={ariaRowIndex}
                aria-level={isTree ? row.depth + 1 : undefined}
                aria-expanded={isTree && (row.getCanExpand?.() ?? false) ? row.getIsExpanded() : undefined}
                className={rowClassName}
                aria-selected={isSelected || undefined}
                onClick={onRowClick ? (e) => onRowClick(e as any, row) : undefined}
                sx={{
                    '--dt-row-bg': isSelected
                        ? 'var(--dt-row-bg-selected)'
                        : striped && isOdd
                            ? 'var(--dt-row-bg-stripe)'
                            : 'var(--dt-pinned-bg)',
                    background: 'var(--dt-row-bg)',
                    cursor: onRowClick ? 'pointer' : 'default',
                    ...(hover ? { '&:hover': { '--dt-row-bg': 'var(--dt-row-bg-hover)' } } : {}),
                }}
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
                    return (
                        <GridCell
                            key={cell.id}
                            role="gridcell"
                            data-col-id={column.id}
                            data-r={displayIndex + 1}
                            data-c={colIndex}
                            tabIndex={kbd.isFocused(displayIndex + 1, colIndex) ? 0 : -1}
                            aria-colindex={colIndex + 1}
                            onFocus={() => kbd.setFocused({ row: displayIndex + 1, col: colIndex })}
                            onDoubleClick={editable ? (e) => { e.stopPropagation(); setEditing({ rowId: row.id, columnId: column.id }); } : undefined}
                            onClick={editable || cellEditing ? (e) => e.stopPropagation() : undefined}
                            className={cellClassName}
                            style={{
                                flex: flexFor(column),
                                width: `var(--col-${column.id}-size)`,
                                justifyContent: cellEditing ? 'stretch' : align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start',
                                cursor: editable && !cellEditing ? 'text' : undefined,
                                ...getPinnedStyle(column, isRtl),
                            }}
                        >
                            {cellEditing ? (
                                <EditCell
                                    column={column}
                                    row={row}
                                    initialValue={value}
                                    align={align}
                                    onCommit={(v) => commitEdit(row, column, v)}
                                    onCancel={() => setEditing(null)}
                                />
                            ) : (
                                <Box component="span" data-cell-content sx={{ minWidth: 0, width: '100%', overflow: 'hidden', ...textWrapSx(wrapText), textAlign: logicalTextAlign(align), ...(isTree && column.id === firstDataColId && row.depth ? { marginInlineStart: `${row.depth * 16}px` } : {}) }}>
                                    {flexRender(column.columnDef.cell, cell.getContext())}
                                </Box>
                            )}
                        </GridCell>
                    );
                })}
            </GridRow>
            {isExpanded ? (
                <GridDetailPanel role="row">{renderDetailPanel!(row)}</GridDetailPanel>
            ) : null}
            </Fragment>
        );
    };

    const renderBody = () => {
        if (loading) {
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
            return <GridOverlay role="row">{emptyText}</GridOverlay>;
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
        <GridRoot dir={isRtl ? 'rtl' : undefined} style={{ ...tokens, ...rootStyle }} className={props.className}>
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
                    renderToolbar={renderToolbar}
                />
            ) : null}
            {derived.isSomeRowsSelected ? (
                <BulkActionsToolbar
                    selectedCount={derived.selectedRowCount}
                    selectionState={state.selectionState}
                    onClear={() => engine.api.selection.deselectAll()}
                    onCopy={enableClipboardCopy ? () => { void engine.api.clipboard.copySelectedRows(); } : undefined}
                    renderBulkActions={renderBulkActions}
                />
            ) : null}
            <GridScroller
                ref={refs.tableContainerRef}
                role={isTree ? 'treegrid' : 'grid'}
                aria-rowcount={isTree ? -1 : derived.tableTotalRow + headerRowCount}
                aria-colcount={table.getVisibleLeafColumns().length}
                onKeyDown={kbd.onKeyDown}
                style={scrollerStyle}
            >
                <div style={{ ...columnSizeVars, width: fitToScreen ? '100%' : totalSize, minWidth: totalSize } as CSSProperties}>
                    <GridHeader role="rowgroup">{renderHeader()}</GridHeader>
                    {!loading && topRows.length ? (
                        // Parks just under the always-sticky header.
                        <GridPinnedTopBand role="rowgroup" style={{ top: 'var(--dt-header-height)' }}>
                            {renderPinnedBand(topRows, 0)}
                        </GridPinnedTopBand>
                    ) : null}
                    <GridBody role="rowgroup">{renderBody()}</GridBody>
                    {!loading && bottomRows.length ? (
                        // Parks above the aggregation footer (when present), else at the viewport bottom.
                        <GridPinnedBottomBand role="rowgroup" style={{ bottom: showAggregation ? 'var(--dt-row-height)' : 0 }}>
                            {renderPinnedBand(bottomRows, topCount + rows.length)}
                        </GridPinnedBottomBand>
                    ) : null}
                    {showAggregation ? <div role="rowgroup">{renderAggregation()}</div> : null}
                </div>
            </GridScroller>

            {enablePagination ? (
                <GridFooter>
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
                            />
                        );
                    })()}
                </GridFooter>
            ) : null}
        </GridRoot>
        </LocaleTextProvider>
    );
}
