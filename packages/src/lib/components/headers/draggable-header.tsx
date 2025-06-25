import { ArrowUpwardOutlined, ArrowDownwardOutlined } from '@mui/icons-material';
import { Box } from '@mui/material';
import { Header, flexRender } from '@tanstack/react-table';
import React, { useState, useRef, useCallback } from 'react';

import { getSlotComponent } from '../../utils/slot-helpers';


interface DraggableHeaderProps<T> {
    header: Header<T, unknown>;
    enableSorting?: boolean;
    draggable?: boolean;
    onColumnReorder?: (draggedColumnId: string, targetColumnId: string) => void;
    slots?: Record<string, any>;
    slotProps?: Record<string, any>;
}

export function DraggableHeader<T>({
    header,
    enableSorting = true,
    draggable = false,
    onColumnReorder,
    slots,
    slotProps,
}: DraggableHeaderProps<T>) {
    const [isDragging, setIsDragging] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const dragStartPositionRef = useRef<{ x: number; y: number } | null>(null);
    const headerElementRef = useRef<HTMLDivElement>(null);

    const SortIconAscSlot = getSlotComponent(slots, 'sortIconAsc', ArrowUpwardOutlined);
    const SortIconDescSlot = getSlotComponent(slots, 'sortIconDesc', ArrowDownwardOutlined);

    // Auto-scroll configuration
    const AUTO_SCROLL_THRESHOLD = 50; // Distance from edge to trigger scroll
    const AUTO_SCROLL_SPEED = 10; // Pixels per scroll interval
    const AUTO_SCROLL_INTERVAL = 16; // ~60fps

    const findScrollableContainer = useCallback((element?: HTMLElement): HTMLElement | null => {
        // Start from the provided element or try to find the current table
        let searchElement = element;

        if (!searchElement) {
            // Start from the header element if available
            if (headerElementRef.current) {
                searchElement = headerElementRef.current.closest('table') as HTMLElement;
            }
        }

        if (!searchElement) {
            // Find the table that contains our header
            const tables = Array.from(document.querySelectorAll('table'));
            for (const table of tables) {
                // Check if this table contains a header with our ID
                const headerExists = table.querySelector('th'); // fallback
                if (headerExists) {
                    searchElement = table;
                    break;
                }
            }
        }

        if (!searchElement) {
            // Last resort: use the first table found
            searchElement = document.querySelector('table') as HTMLElement;
        }

        if (!searchElement) return null;

        // Walk up the DOM tree to find the scrollable container
        let container: HTMLElement | null = searchElement;
        while (container && container !== document.body) {
            const styles = window.getComputedStyle(container);
            if (styles.overflowX === 'auto' || styles.overflowX === 'scroll') {
                return container;
            }
            container = container.parentElement;
        }

        return null;
    }, []);

    const startAutoScroll = useCallback((direction: 'left' | 'right') => {
        if (autoScrollIntervalRef.current) {
            clearInterval(autoScrollIntervalRef.current);
        }

        const container = findScrollableContainer();
        if (!container) return;

        autoScrollIntervalRef.current = setInterval(() => {
            const scrollAmount = direction === 'left' ? -AUTO_SCROLL_SPEED : AUTO_SCROLL_SPEED;
            const newScrollLeft = container.scrollLeft + scrollAmount;

            // Check bounds
            if (direction === 'left' && newScrollLeft <= 0) {
                container.scrollLeft = 0;
                clearInterval(autoScrollIntervalRef.current!);
                autoScrollIntervalRef.current = null;
            } else if (direction === 'right' && newScrollLeft >= container.scrollWidth - container.clientWidth) {
                container.scrollLeft = container.scrollWidth - container.clientWidth;
                clearInterval(autoScrollIntervalRef.current!);
                autoScrollIntervalRef.current = null;
            } else {
                container.scrollLeft = newScrollLeft;
            }
        }, AUTO_SCROLL_INTERVAL);
    }, [findScrollableContainer]);

    const stopAutoScroll = useCallback(() => {
        if (autoScrollIntervalRef.current) {
            clearInterval(autoScrollIntervalRef.current);
            autoScrollIntervalRef.current = null;
        }
    }, []);

    const checkAutoScroll = useCallback((clientX: number) => {
        const container = findScrollableContainer();
        if (!container) {
            return;
        }

        const rect = container.getBoundingClientRect();
        const distanceFromLeft = clientX - rect.left;
        const distanceFromRight = rect.right - clientX;

        // Stop any existing auto-scroll
        stopAutoScroll();

        // Check if we should start auto-scrolling
        if (distanceFromLeft < AUTO_SCROLL_THRESHOLD && container.scrollLeft > 0) {
            // Near left edge and can scroll left
            startAutoScroll('left');
        } else if (distanceFromRight < AUTO_SCROLL_THRESHOLD &&
            container.scrollLeft < container.scrollWidth - container.clientWidth) {
            // Near right edge and can scroll right
            startAutoScroll('right');
        }
    }, [
        findScrollableContainer,
        startAutoScroll,
        stopAutoScroll,
    ]);

    const handleDragStart = (e: React.DragEvent) => {
        if (!draggable) return;

        setIsDragging(true);
        dragStartPositionRef.current = {
            x: e.clientX,
            y: e.clientY,
        };
        e.dataTransfer.setData('text/plain', header.id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDrag = useCallback((e: React.DragEvent) => {
        if (!isDragging || !draggable) return;

        // Only check for auto-scroll if we have valid coordinates
        if (e.clientX > 0 && e.clientY > 0) {
            checkAutoScroll(e.clientX);
        }
    }, [
        isDragging,
        draggable,
        checkAutoScroll,
    ]);

    const getSortIcon = () => {
        if (!enableSorting) return null;
        const sortDirection = header.column.getIsSorted();

        // Only show icons when column is actually sorted
        if (sortDirection === 'asc') {
            return (
                <SortIconAscSlot
                    fontSize="small"
                    {...slotProps?.sortIconAsc}
                />
            );
        } if (sortDirection === 'desc') {
            return (
                <SortIconDescSlot
                    fontSize="small"
                    {...slotProps?.sortIconDesc}
                />
            );
        }
        // Don't show any icon when not sorted
        return null;
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        setDragOver(false);
        stopAutoScroll();
        dragStartPositionRef.current = null;
    };

    const handleDragOver = (e: React.DragEvent) => {
        if (!draggable) return;

        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOver(true);

        // Check for auto-scroll during drag over
        checkAutoScroll(e.clientX);
    };

    const handleDragLeave = () => {
        setDragOver(false);
        // Don't stop auto-scroll on drag leave as the drag might continue outside this element
    };

    const handleDrop = (e: React.DragEvent) => {
        if (!draggable) return;

        e.preventDefault();
        const draggedColumnId = e.dataTransfer.getData('text/plain');
        if (draggedColumnId !== header.id && onColumnReorder) {
            onColumnReorder(draggedColumnId, header.id);
        }

        setDragOver(false);
        stopAutoScroll();
    };

    const handleSort = () => {
        if (!enableSorting || !header.column.getCanSort()) return;

        const currentSort = header.column.getIsSorted();
        if (currentSort === false) {
            header.column.toggleSorting(false); // asc
        } else if (currentSort === 'asc') {
            header.column.toggleSorting(true); // desc
        } else {
            header.column.clearSorting(); // none
        }
    };

    const getCursor = () => {
        if (draggable) return 'grab';
        if (enableSorting && header.column.getCanSort()) return 'pointer';
        return 'default';
    };

    if (!draggable && !enableSorting) {
        return flexRender(header.column.columnDef.header, header.getContext());
    }

    return (
        <Box
            ref={headerElementRef}
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: getCursor(),
                userSelect: 'none',
                opacity: isDragging ? 0.5 : 1,
                backgroundColor: dragOver ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                borderLeft: dragOver ? '2px solid #1976d2' : 'none',
                padding: dragOver ? '0 0 0 -2px' : '0',
                width: '100%',
                height: '100%',
                '&:active': {
                    cursor: draggable ? 'grabbing' : 'pointer',
                },
            }}
            draggable={draggable}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={enableSorting ? handleSort : undefined}
        >
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                }}
            >
                {flexRender(header.column.columnDef.header, header.getContext())}
                {getSortIcon()}
            </Box>
        </Box>
    );
}
