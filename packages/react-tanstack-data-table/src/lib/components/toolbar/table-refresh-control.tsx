import React, { ReactElement, useCallback } from 'react';
import { Refresh } from '@mui/icons-material';
import { IconButton, Tooltip, IconButtonProps, CircularProgress } from '@mui/material';

import { useDataTableContext } from '../../contexts/data-table-context';
import { extractSlotProps, getSlotComponent, mergeSlotProps } from '../../utils/slot-helpers';

export interface TableRefreshControlProps {
    iconButtonProps?: IconButtonProps;
    tooltipProps?: any;

    /** optional override */
    onRefresh?: () => void | Promise<void>;

    /** disable + show spinner if true */
    loading?: boolean;

    /** use spinner instead of icon while loading */
    showSpinnerWhileLoading?: boolean;

    [key: string]: any;
}

export function TableRefreshControl(props: TableRefreshControlProps = {}): ReactElement {
    const { apiRef, slots, slotProps } = useDataTableContext();

    const refreshIconSlotProps = extractSlotProps(slotProps, 'refreshIcon');
    const RefreshIconSlot = getSlotComponent(slots, 'refreshIcon', Refresh);

    const handleRefresh = useCallback(() => {
        if (props.onRefresh) return props.onRefresh();
        // Default: use internal api
        apiRef?.current?.data?.reload?.();
    }, [props, apiRef]);

    const mergedIconButtonProps = mergeSlotProps(
        {
            size: 'small',
            onClick: handleRefresh,
            disabled: !!props.loading,
            sx: { flexShrink: 0 },
        },
        refreshIconSlotProps,
        props.iconButtonProps || {}
    );

    return (
        <Tooltip title="Refresh data" {...props.tooltipProps}>
            <IconButton {...mergedIconButtonProps}>
                {props.loading && props.showSpinnerWhileLoading ? (
                    <CircularProgress size={16} />
                ) : (
                    <RefreshIconSlot {...refreshIconSlotProps} />
                )}
            </IconButton>
        </Tooltip>
    );
}