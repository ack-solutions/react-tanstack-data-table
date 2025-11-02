import { Autorenew } from '@mui/icons-material';
import { IconButton, Tooltip, IconButtonProps } from '@mui/material';

import { useDataTableContext } from '../../contexts/data-table-context';
import { getSlotComponent, mergeSlotProps, extractSlotProps } from '../../utils/slot-helpers';

export interface ColumnResetControlProps {
    // Allow full customization of any prop
    iconButtonProps?: IconButtonProps;
    tooltipProps?: any;
    resetActions?: ('columnOrder' | 'columnPinning' | 'columnSizing' | 'columnVisibility' | 'filters' | 'sorting' | 'pagination')[];
    [key: string]: any;
}

export function ColumnResetControl(props: ColumnResetControlProps = {}) {
    const {apiRef, table, slots, slotProps } = useDataTableContext();
    
    // Extract slot-specific props with enhanced merging
    const resetIconSlotProps = extractSlotProps(slotProps, 'resetIcon');
    const ResetIconSlot = getSlotComponent(slots, 'resetIcon', Autorenew);

    const handleResetLayout = () => {
        const actions = props.resetActions || ['columnOrder', 'columnPinning', 'columnSizing'];
        if (!apiRef?.current) return;
        
        // Reset based on specified actions
        if (actions.includes('columnOrder')) {
            apiRef?.current?.columnOrdering?.resetColumnOrder();
        }
        if (actions.includes('columnPinning')) {
            apiRef?.current?.columnPinning?.resetColumnPinning();
        }
        if (actions.includes('columnSizing')) {
            apiRef?.current?.columnResizing?.resetColumnSizing();
        }
        if (actions.includes('columnVisibility')) {
            apiRef?.current?.columnVisibility?.resetColumnVisibility();
        }
        if (actions.includes('filters')) {
            apiRef?.current?.filtering?.clearAllFilters();
        }
        if (actions.includes('sorting')) {
            apiRef?.current?.sorting?.resetSorting();
        }
        if (actions.includes('pagination')) {
            apiRef?.current?.pagination?.resetPagination();
        }
    };

    // Merge all props for maximum flexibility
    const mergedIconButtonProps = mergeSlotProps(
        {
            size: 'small',
            onClick: handleResetLayout,
            sx: { flexShrink: 0 },
        },
        resetIconSlotProps,
        props.iconButtonProps || {}
    );

    return (
        <Tooltip 
            title="Reset layout"
            {...props.tooltipProps}
        >
            <IconButton
                {...mergedIconButtonProps}
            >
                <ResetIconSlot {...resetIconSlotProps} />
            </IconButton>
        </Tooltip>
    );
}
