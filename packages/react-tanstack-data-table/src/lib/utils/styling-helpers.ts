/**
 * Styling utilities for DataTable components
 */

// Import types from centralized location
import type { DataTableColumn, PinnedColumnStyleOptions } from '../types';

/**
 * Generate consistent styling for pinned columns
 */
export function getPinnedColumnStyle(options: PinnedColumnStyleOptions) {
    const {
        width = 'auto',
        minWidth,
        maxWidth,
        isPinned,
        pinnedPosition,
        pinnedRightPosition,
        isLastLeftPinnedColumn,
        isFirstRightPinnedColumn,
        zIndex = 1,
        disableStickyHeader = false,
        wrapText = false,
    } = options;

    // Pinned columns should ALWAYS be sticky, regardless of enableStickyHeader setting
    const needsPinnedPositioning = isPinned;
    const shouldBeSticky = isPinned; // Pinned columns are always sticky

    // Position logic
    let positionStyle = {};
    if (shouldBeSticky) {
        // Pinned columns must always be sticky - override any Table-level sticky positioning
        positionStyle = { position: 'sticky' };
    } else if (!disableStickyHeader) {
        // Non-pinned columns: set relative when we're managing positioning
        positionStyle = { position: 'relative' };
    }
    // When disableStickyHeader is true and column is not pinned, let Table handle stickiness

    // Text wrapping styles - configurable per column
    const textWrappingStyles = wrapText
        ? {
            whiteSpace: 'normal' as const,
            wordBreak: 'break-word' as const,
            overflow: 'visible' as const,
        }
        : {
            overflow: 'hidden' as const,
            whiteSpace: 'nowrap' as const,
            textOverflow: 'ellipsis' as const,
        };

    return {
        // Width constraints - more strict for narrow columns
        width,
        ...(minWidth !== undefined && { minWidth }),
        ...(maxWidth !== undefined ? { maxWidth } : { maxWidth: width }),
        ...textWrappingStyles,
        // Position handling
        ...positionStyle,
        // Pinned positioning (works with both sticky modes)
        ...(needsPinnedPositioning ? {
            left: isPinned === 'left' ? pinnedPosition : undefined,
            right: isPinned === 'right' ? pinnedRightPosition : undefined,
            zIndex,
        } : {}),

        boxShadow:
            isPinned === 'left' && isLastLeftPinnedColumn
                ? 'inset -1px 0 0 var(--palette-TableCell-border), 2px 0 2px -4px rgba(0,0,0,.18)'
                : isPinned === 'right' && isFirstRightPinnedColumn
                    ? 'inset 1px 0 0 var(--palette-TableCell-border), -1px 0 2px -4px rgba(0,0,0,.18)'
                    : undefined,
        // For pinned columns: use solid background + transparent overlay to prevent text bleeding through
        ...(isPinned ? {
            // Solid base background (opaque)
            backgroundColor: (theme) => theme.palette.background.paper,
            // Transparent overlay for hover/selected states
            backgroundImage: (theme) => `linear-gradient(var(--row-bg, ${theme.palette.background.paper}), var(--row-bg, ${theme.palette.background.paper}))`,
        } : {
            // Non-pinned columns: use standard transparent background
            backgroundColor: (theme) => `var(--row-bg, ${theme.palette.background.paper})`,
        }),
    };
}

/**
 * Common table cell styling
 */
export const tableCellStyles = {
    sticky: {
        position: 'sticky',
        zIndex: 10,
        backgroundColor: 'background.paper',
    },
    pinned: {
        borderRight: '1px solid',
        borderColor: 'divider',
    },
} as const;

/**
 * Common table row styling
 */
export const tableRowStyles = {
    hover: {
        '&:hover': {
            backgroundColor: 'action.hover',
        },
    },
    striped: {
        '&:nth-of-type(odd)': {
            backgroundColor: 'action.selected',
        },
    },
} as const;

/**
 * Get text alignment style from column metadata
 */
export function getColumnAlignment(column?: DataTableColumn<any>): 'left' | 'center' | 'right' {
    if (!column) return 'left';
    return column.align || 'left';
}
