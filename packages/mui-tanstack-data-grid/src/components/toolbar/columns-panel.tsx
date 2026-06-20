/**
 * ColumnsPanel — the toolbar "Columns" popover: per-column show/hide (eye
 * toggle), pin left/right, and drag-to-reorder, plus Show all / Reset / Done.
 * Changes apply live through the engine API. The built-in selection/expander
 * columns (ids starting with "_") are excluded.
 */
import AlignHorizontalLeftOutlined from '@mui/icons-material/AlignHorizontalLeftOutlined';
import AlignHorizontalRightOutlined from '@mui/icons-material/AlignHorizontalRightOutlined';
import DragIndicatorOutlined from '@mui/icons-material/DragIndicatorOutlined';
import { Box, Button, Divider, IconButton, Popover, Tooltip, Typography } from '@mui/material';
import { useState, type ReactElement } from 'react';

import { EyeFeatherIcon, EyeOffFeatherIcon } from '../icons';
import { DEFAULT_ACTIONS_COLUMN_ID } from '../../types/column.types';
import type { UseDataTableResult } from '../../core/use-data-table';

const columnLabel = (col: any): string => {
    const header = col.columnDef?.header;
    return typeof header === 'string' && header ? header : col.id;
};

export interface ColumnsPanelProps<T> {
    engine: UseDataTableResult<T>;
    anchorEl: HTMLElement | null;
    open: boolean;
    onClose: () => void;
    enableColumnVisibility?: boolean;
    enableColumnPinning?: boolean;
    enableColumnReordering?: boolean;
}

export function ColumnsPanel<T extends Record<string, any>>(props: ColumnsPanelProps<T>): ReactElement {
    const { engine, anchorEl, open, onClose, enableColumnVisibility, enableColumnPinning, enableColumnReordering } = props;
    const { table, api } = engine;
    const locale = engine.localeText;

    const dataCols = table.getAllLeafColumns().filter((c: any) => !c.id.startsWith('_'));
    const [dragId, setDragId] = useState<string | null>(null);

    // Display order DERIVES from the engine each render (sorted by columnOrder),
    // so Reset / header-drag / any external change stays in sync — no stale local
    // copy. Reorder is committed to the engine on drop, which re-derives this.
    const orderState = engine.state.columnOrder;
    const orderedCols: any[] = orderState && orderState.length
        ? [...dataCols].sort((a, b) => {
            const ia = orderState.indexOf(a.id);
            const ib = orderState.indexOf(b.id);
            return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
        })
        : dataCols;

    const commitOrder = (ids: string[]) => {
        if (!enableColumnReordering) return;
        // Keep special columns out of the reordered data ids, on the correct side:
        // _selection/_expanding lead, the right-pinned _actions trails.
        const specialIds = table.getAllLeafColumns().map((c: any) => c.id).filter((id: string) => id.startsWith('_'));
        const leftSpecials = specialIds.filter((id: string) => id !== DEFAULT_ACTIONS_COLUMN_ID);
        const rightSpecials = specialIds.filter((id: string) => id === DEFAULT_ACTIONS_COLUMN_ID);
        api.columnOrdering.setColumnOrder([...leftSpecials, ...ids, ...rightSpecials]);
    };

    const handleDrop = (overId: string) => {
        if (!dragId || dragId === overId) {
            setDragId(null);
            return;
        }
        const ids = orderedCols.map((c) => c.id);
        const from = ids.indexOf(dragId);
        const to = ids.indexOf(overId);
        setDragId(null);
        if (from < 0 || to < 0) return;
        const next = [...ids];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        commitOrder(next);
    };

    const handleReset = () => {
        if (enableColumnVisibility) api.columnVisibility.resetColumnVisibility();
        if (enableColumnReordering) api.columnOrdering.resetColumnOrder();
        if (enableColumnPinning) api.columnPinning.resetColumnPinning();
    };

    return (
        <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{ paper: { elevation: 3, sx: { mt: 0.75, borderRadius: 2, width: 320 } } }}
        >
            <Typography variant="subtitle2" sx={{ px: 2, py: 1.25 }}>
                {locale.columnsManageTitle}
            </Typography>
            <Divider />

            <Box sx={{ maxHeight: 360, overflowY: 'auto', px: 0.75, py: 0.5 }}>
                {orderedCols.map((col) => {
                    const visible = col.getIsVisible();
                    const pinned = col.getIsPinned();
                    const canHide = !!enableColumnVisibility && col.getCanHide();
                    const canPin = !!enableColumnPinning && col.getCanPin();
                    return (
                        <Box
                            key={col.id}
                            draggable={!!enableColumnReordering}
                            onDragStart={() => setDragId(col.id)}
                            onDragOver={(e) => { if (dragId) e.preventDefault(); }}
                            onDrop={() => handleDrop(col.id)}
                            onDragEnd={() => setDragId(null)}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.25,
                                height: 36,
                                px: 0.5,
                                borderRadius: 1,
                                opacity: dragId === col.id ? 0.4 : 1,
                                '&:hover': { bgcolor: 'action.hover' },
                            }}
                        >
                            {enableColumnReordering ? (
                                <Box component="span" sx={{ display: 'inline-flex', color: 'text.disabled', cursor: 'grab', '& svg': { fontSize: 18 } }}>
                                    <DragIndicatorOutlined fontSize="small" />
                                </Box>
                            ) : null}

                            {canHide ? (
                                <Tooltip title={visible ? locale.hideColumn : locale.showColumn}>
                                    <IconButton size="small" onClick={() => api.columnVisibility.toggleColumn(col.id)} sx={{ color: visible ? 'text.secondary' : 'text.disabled' }}>
                                        {visible ? <EyeFeatherIcon fontSize="small" /> : <EyeOffFeatherIcon fontSize="small" />}
                                    </IconButton>
                                </Tooltip>
                            ) : (
                                <Box sx={{ width: 30 }} />
                            )}

                            <Typography
                                variant="body2"
                                sx={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: visible ? 'text.primary' : 'text.disabled' }}
                            >
                                {columnLabel(col)}
                            </Typography>

                            {canPin ? (
                                <>
                                    <Tooltip title={pinned === 'left' ? locale.unpin : locale.pinLeft}>
                                        <IconButton size="small" color={pinned === 'left' ? 'primary' : 'default'} onClick={() => (pinned === 'left' ? api.columnPinning.unpinColumn(col.id) : api.columnPinning.pinColumnLeft(col.id))}>
                                            <AlignHorizontalLeftOutlined fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={pinned === 'right' ? locale.unpin : locale.pinRight}>
                                        <IconButton size="small" color={pinned === 'right' ? 'primary' : 'default'} onClick={() => (pinned === 'right' ? api.columnPinning.unpinColumn(col.id) : api.columnPinning.pinColumnRight(col.id))}>
                                            <AlignHorizontalRightOutlined fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </>
                            ) : null}
                        </Box>
                    );
                })}
            </Box>

            <Divider />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1 }}>
                {enableColumnVisibility ? (
                    <Button size="small" onClick={() => api.columnVisibility.showAllColumns()}>
                        {locale.columnsShowAll}
                    </Button>
                ) : null}
                <Box sx={{ flex: 1 }} />
                <Button size="small" color="inherit" onClick={handleReset}>
                    {locale.columnsReset}
                </Button>
                <Button size="small" variant="contained" disableElevation onClick={onClose}>
                    {locale.columnsDone}
                </Button>
            </Box>
        </Popover>
    );
}
