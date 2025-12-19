import { Clear, Search } from '@mui/icons-material';
import { Box, Tooltip, IconButton, Collapse, OutlinedInput, InputAdornment, IconButtonProps, OutlinedInputProps, SxProps } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState, ReactElement } from 'react';

import { useDataTableContext } from '../../contexts/data-table-context';
import { getSlotComponent, mergeSlotProps, extractSlotProps } from '../../utils/slot-helpers';

export interface TableSearchControlProps {
    // Allow full customization of any prop
    placeholder?: string;
    autoFocus?: boolean;
    searchIconProps?: IconButtonProps;
    clearIconProps?: IconButtonProps;
    inputProps?: OutlinedInputProps;
    containerSx?: SxProps;
    tooltipProps?: any;
    [key: string]: any;
}

export function TableSearchControl(props: TableSearchControlProps = {}): ReactElement {
    const { table, slots, slotProps } = useDataTableContext();
    const [searchVisible, setSearchVisible] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const globalFilter = table.getState().globalFilter || '';
    const hasSearch = globalFilter.length > 0;

    // Extract slot-specific props with enhanced merging
    const searchIconSlotProps = extractSlotProps(slotProps, 'searchIcon');
    const clearIconSlotProps = extractSlotProps(slotProps, 'clearIcon');
    
    const SearchIconSlot = getSlotComponent(slots, 'searchIcon', Search);
    const ClearIconSlot = getSlotComponent(slots, 'clearIcon', Clear);
    
    const handleChange = useCallback(
        (e: any) => {
            table.setGlobalFilter(e.target.value);
        },
        [table],
    );

    const handleSearchToggle = () => {
        if (searchVisible || hasSearch) {
            // If search is visible or has text, hide it and clear
            setSearchVisible(false);
            table.setGlobalFilter('');
        } else {
            // Show search input
            setSearchVisible(true);
        }
    };

    const handleSearchClear = () => {
        table.setGlobalFilter('');
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    };

    const handleSearchBlur = () => {
        // Only auto-hide if search is empty
        if (searchVisible && !hasSearch) {
            setSearchVisible(false);
        }
    };

    useEffect(() => {
        if (searchVisible && searchInputRef.current) {
            // Add a delay to ensure the Collapse animation completes
            const timer = setTimeout(() => {
                searchInputRef.current?.focus();
            }, 200);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [searchVisible]);

    // Merge all props for maximum flexibility
    const mergedSearchIconProps = mergeSlotProps(
        {
            size: 'small',
            onClick: handleSearchToggle,
            color: hasSearch ? 'primary' : 'default',
            sx: { flexShrink: 0 },
        },
        searchIconSlotProps,
        props.searchIconProps || {}
    );

    const mergedClearIconProps = mergeSlotProps(
        {
            size: 'small',
            onClick: handleSearchClear,
        },
        clearIconSlotProps,
        props.clearIconProps || {}
    );

    const mergedInputProps = mergeSlotProps(
        {
            inputRef: searchInputRef,
            size: 'small',
            placeholder: props.placeholder || 'Search...',
            value: globalFilter,
            onChange: handleChange,
            onBlur: handleSearchBlur,
            autoFocus: props.autoFocus,
            sx: { minWidth: 200 },
        },
        props.inputProps || {}
    );

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                ...props.containerSx,
            }}
        >
            {!(searchVisible || hasSearch) && (
                <Tooltip 
                    title="Search"
                    {...props.tooltipProps}
                >
                    <IconButton
                        {...mergedSearchIconProps}
                    >
                        <SearchIconSlot {...searchIconSlotProps} />
                    </IconButton>
                </Tooltip>
            )}

            <Collapse
                in={searchVisible || hasSearch}
                orientation="horizontal"
                timeout={200}
            >
                <OutlinedInput
                    {...mergedInputProps}
                    endAdornment={
                        hasSearch ? (
                            <InputAdornment position="end">
                                <IconButton
                                    {...mergedClearIconProps}
                                >
                                    <ClearIconSlot {...clearIconSlotProps} />
                                </IconButton>
                            </InputAdornment>
                        ) : null
                    }
                />
            </Collapse>
        </Box>
    );
}
