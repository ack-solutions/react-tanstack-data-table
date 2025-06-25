/**
 * Styling utilities for DataTable components
 */

// Import types from centralized location
import type { DataTableColumn, PinnedColumnStyleOptions } from '../types';


/**
 * Generate box shadow for pinned columns using subtle theme-compatible shadows
 * Only shows shadow on the trailing edge of pinned columns
 */
const getBoxShadow = (isPinned: 'left' | 'right' | false | undefined, isLastLeftPinnedColumn: boolean, isFirstRightPinnedColumn: boolean) => {
    if (isPinned === 'left' && isLastLeftPinnedColumn) {
        // Subtle shadow on right side of left-pinned column
        return '1px 0 3px rgba(0, 0, 0, 0.12)';
    }

    if (isPinned === 'right' && isFirstRightPinnedColumn) {
        // Subtle shadow on left side of right-pinned column
        return '-1px 0 3px rgba(0, 0, 0, 0.12)';
    }

    return 'none';
};

/**
 * Generate consistent styling for pinned columns
 */
export function getPinnedColumnStyle(options: PinnedColumnStyleOptions) {
    const {
        width = 'auto',
        isPinned,
        pinnedPosition,
        pinnedRightPosition,
        isLastLeftPinnedColumn,
        isFirstRightPinnedColumn,
        zIndex = 1,
        disableStickyHeader = false,
    } = options;

    // Pinned columns should ALWAYS be sticky, regardless of enableStickyHeader setting
    const needsPinnedPositioning = isPinned;
    const shouldBeSticky = isPinned; // Pinned columns are always sticky

    // Position logic
    let positionStyle = {};
    if (shouldBeSticky) {
        // Pinned columns must always be sticky
        positionStyle = { position: 'sticky' };
    } else if (!disableStickyHeader) {
        // Non-pinned columns: only sticky when enableStickyHeader is false
        positionStyle = { position: 'relative' };
    }
    // When disableStickyHeader is true and column is not pinned, let Table handle stickiness

    return {
        // Width constraints - more strict for narrow columns
        width,
        maxWidth: width,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        // Position handling
        ...positionStyle,
        // Pinned positioning (works with both sticky modes)
        ...(needsPinnedPositioning ? {
            left: isPinned === 'left' ? pinnedPosition : undefined,
            right: isPinned === 'right' ? pinnedRightPosition : undefined,
            zIndex,
        } : {}),

        // Background handling for pinned columns - simpler approach
        ...(isPinned && {
            // Use theme background as fallback, but allow inheritance from parent
            backgroundColor: 'background.paper',
        }),

        // Box shadow only on trailing edge with subtle shadows
        boxShadow: getBoxShadow(isPinned, !!isLastLeftPinnedColumn, !!isFirstRightPinnedColumn),
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
