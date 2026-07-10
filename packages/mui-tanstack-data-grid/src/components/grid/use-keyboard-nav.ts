/**
 * Keyboard navigation for the grid (WCAG grid pattern). A single "focused cell"
 * `{ row, col }` drives a roving tabindex — one cell is tabbable at a time, and
 * arrow / Home / End / Ctrl+Home-End / PageUp-Down move it. Row `0` is the header
 * row; data rows are `1..rowCount`. Columns are `0..colCount-1` (visible order).
 *
 * The hook owns only the index + key handling; the view stamps `data-r`/`data-c`
 * and `tabIndex` on cells and re-applies DOM focus via the returned effect ref.
 */
import { useCallback, useLayoutEffect, useRef, useState, type KeyboardEvent, type RefObject } from 'react';

export interface FocusedCell {
    row: number;
    col: number;
}

export interface KeyboardNavOptions {
    rowCount: number;
    colCount: number;
    /** Lowest focusable row. `0` = the header is a tab stop (grid mode); `1` = no header
     *  (list view), so the first data row is the home cell instead. */
    minRow?: number;
    containerRef: RefObject<HTMLElement | null>;
    /** Bring a data row (0-based) into view before focusing (virtualization). */
    scrollToRow?: (dataIndex: number) => void;
    pageSize?: number;
    /** Called when Enter/F2 activates an editable focused data cell (col → columnId via the view). */
    onActivate?: (cell: FocusedCell) => void;
    enabled?: boolean;
}

export interface KeyboardNav {
    focused: FocusedCell;
    setFocused: (cell: FocusedCell) => void;
    isFocused: (row: number, col: number) => boolean;
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export function useKeyboardNav(opts: KeyboardNavOptions): KeyboardNav {
    const { rowCount, colCount, minRow = 0, containerRef, scrollToRow, pageSize = 10, onActivate, enabled = true } = opts;
    const [focused, setFocusedState] = useState<FocusedCell>({ row: minRow, col: 0 });
    const moveByKeyRef = useRef(false);
    const maxRow = rowCount; // header(0) + data rows (or, in list view, minRow=1 → data only)
    const maxCol = Math.max(0, colCount - 1);

    // Keep focus in range as the grid changes (filtering, paging, column visibility).
    const safe = { row: clamp(focused.row, minRow, maxRow), col: clamp(focused.col, 0, maxCol) };

    const setFocused = useCallback((cell: FocusedCell) => {
        setFocusedState({ row: clamp(cell.row, minRow, rowCount), col: clamp(cell.col, 0, Math.max(0, colCount - 1)) });
    }, [rowCount, colCount, minRow]);

    const focusCell = useCallback((row: number, col: number, viaKey: boolean) => {
        moveByKeyRef.current = viaKey;
        setFocusedState({ row, col });
    }, []);

    // Re-apply DOM focus when the focused cell changes via the keyboard. For a data
    // row not currently rendered (virtualization), scroll it in and retry once.
    useLayoutEffect(() => {
        if (!moveByKeyRef.current) return;
        moveByKeyRef.current = false;
        const container = containerRef.current;
        if (!container) return;
        const select = () => container.querySelector<HTMLElement>(`[data-r="${safe.row}"][data-c="${safe.col}"]`);
        const el = select();
        if (el) {
            el.focus();
        } else if (safe.row > 0 && scrollToRow) {
            scrollToRow(safe.row - 1);
            const t = setTimeout(() => select()?.focus(), 60);
            return () => clearTimeout(t);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [safe.row, safe.col, containerRef]);

    const onKeyDown = useCallback((e: KeyboardEvent<HTMLElement>) => {
        if (!enabled) return;
        const target = e.target as HTMLElement;
        // Don't hijack arrows/Home/End while typing in an editor or interacting with a native control.
        const tag = target?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable) return;
        // Derive the current position from the actually-focused cell (robust to click-focus
        // not having synced React state yet), falling back to the roving state.
        const cellEl = target?.closest?.('[data-r][data-c]') as HTMLElement | null;
        const row = cellEl ? Number(cellEl.getAttribute('data-r')) : safe.row;
        const col = cellEl ? Number(cellEl.getAttribute('data-c')) : safe.col;
        let next: FocusedCell | null = null;
        switch (e.key) {
            case 'ArrowDown': next = { row: clamp(row + 1, minRow, maxRow), col }; break;
            case 'ArrowUp': next = { row: clamp(row - 1, minRow, maxRow), col }; break;
            case 'ArrowRight': next = { row, col: clamp(col + 1, 0, maxCol) }; break;
            case 'ArrowLeft': next = { row, col: clamp(col - 1, 0, maxCol) }; break;
            case 'Home': next = e.ctrlKey ? { row: minRow, col: 0 } : { row, col: 0 }; break;
            case 'End': next = e.ctrlKey ? { row: maxRow, col: maxCol } : { row, col: maxCol }; break;
            case 'PageDown': next = { row: clamp(row + pageSize, minRow, maxRow), col }; break;
            case 'PageUp': next = { row: clamp(row - pageSize, minRow, maxRow), col }; break;
            case 'Enter':
            case 'F2':
                if (onActivate) { onActivate({ row, col }); e.preventDefault(); }
                return;
            default:
                return;
        }
        if (next) {
            e.preventDefault();
            focusCell(next.row, next.col, true);
        }
    }, [enabled, safe.row, safe.col, maxRow, maxCol, pageSize, onActivate, focusCell]);

    const isFocused = useCallback((r: number, c: number) => safe.row === r && safe.col === c, [safe.row, safe.col]);

    return { focused: safe, setFocused, isFocused, onKeyDown };
}
