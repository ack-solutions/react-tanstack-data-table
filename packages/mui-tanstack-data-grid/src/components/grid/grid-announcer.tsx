/**
 * GridAnnouncer — a visually-hidden aria-live region that speaks state changes
 * (sort, filter, page, selection) to screen-reader users.
 *
 * A single effect tracks the last-announced values and fires only on a real change
 * (silent on first render; StrictMode double-invoke is a no-op). When one user action
 * changes several signals at once — e.g. sorting/filtering also resets the page — the
 * meaningful change wins via priority (filter > sort > selection > page).
 */
import { Box } from '@mui/material';
import { useEffect, useRef, useState, type ReactElement } from 'react';

import type { UseDataTableResult } from '../../core/use-data-table';

const srOnly = {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
    border: 0,
} as const;

export function GridAnnouncer<T>({ engine }: { engine: UseDataTableResult<T> }): ReactElement {
    const locale = engine.localeText;
    const { table } = engine;
    const sorting = engine.state.sorting;
    const globalFilter = engine.state.globalFilter;
    const columnFilter = engine.state.columnFilter;
    const pageIndex = engine.state.pagination.pageIndex;
    const pageSize = engine.state.pagination.pageSize;
    const total = engine.derived.tableTotalRow;
    const selected = engine.derived.selectedRowCount;

    const [message, setMessage] = useState('');

    const sortKey = sorting.map((s) => `${s.id}:${s.desc ? 'd' : 'a'}`).join(',');
    const filterKey = `${globalFilter ?? ''}|${JSON.stringify(columnFilter?.filters ?? [])}`;
    const pageKey = `${pageIndex}/${pageSize}`;
    const prev = useRef({ sort: sortKey, filter: filterKey, page: pageKey, sel: selected });

    useEffect(() => {
        const p = prev.current;
        const sortChanged = p.sort !== sortKey;
        const filterChanged = p.filter !== filterKey;
        const pageChanged = p.page !== pageKey;
        const selChanged = p.sel !== selected;
        prev.current = { sort: sortKey, filter: filterKey, page: pageKey, sel: selected };
        if (!sortChanged && !filterChanged && !pageChanged && !selChanged) return; // first render / no-op

        let msg = '';
        if (filterChanged) {
            // Post-filter count (pre-pagination), NOT the unfiltered grand total.
            const filtered = ((table as any).getPrePaginationRowModel?.() ?? table.getRowModel()).rows.length;
            msg = locale.announceFilteredRows(filtered);
        } else if (sortChanged) {
            const s = sorting[0];
            if (!s) {
                msg = locale.announceSort('', 'none');
            } else {
                const col = table.getColumn?.(s.id);
                const header = col && typeof col.columnDef.header === 'string' ? (col.columnDef.header as string) : s.id;
                msg = locale.announceSort(header, s.desc ? 'descending' : 'ascending');
            }
        } else if (selChanged) {
            msg = locale.selectedRows(selected);
        } else if (pageChanged) {
            const pageCount = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
            msg = locale.announcePage(pageIndex + 1, pageCount);
        }
        if (msg) setMessage(msg);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortKey, filterKey, pageKey, selected]);

    return <Box aria-live="polite" aria-atomic="true" sx={srOnly}>{message}</Box>;
}
