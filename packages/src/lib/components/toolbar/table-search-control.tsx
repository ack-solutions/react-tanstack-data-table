import { Clear, Search } from '@mui/icons-material';
import { Box, Tooltip } from '@mui/material';
import { IconButton } from '@mui/material';
import { Collapse } from '@mui/material';
import { OutlinedInput } from '@mui/material';
import { InputAdornment } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useDataTableContext } from '../../contexts/data-table-context';
import { getSlotComponent } from '../../utils/slot-helpers';


export function TableSearchControl() {
    const { table, slots, slotProps } = useDataTableContext();
    const [searchVisible, setSearchVisible] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const globalFilter = table.getState().globalFilter || '';
    const hasSearch = globalFilter.length > 0;

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
        console.log('🔍 searchVisible', searchVisible);
        console.log('🔍 searchInputRef.current', searchInputRef.current);
        if (searchVisible && searchInputRef.current) {
            // Add a delay to ensure the Collapse animation completes
            const timer = setTimeout(() => {
                searchInputRef.current?.focus();
            }, 200);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [searchVisible]);

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
            }}
        >
            {!(searchVisible || hasSearch) && (
                <Tooltip title="Search">
                    <IconButton
                        size="small"
                        onClick={handleSearchToggle}
                        color={hasSearch ? 'primary' : 'default'}
                        sx={{
                            flexShrink: 0,
                        }}
                    >
                        <SearchIconSlot {...slotProps?.searchIcon} />
                    </IconButton>
                </Tooltip>
            )}
            <Collapse
                in={searchVisible || hasSearch}
                orientation="horizontal"
            >
                <OutlinedInput
                    inputRef={searchInputRef}
                    placeholder="Search..."
                    value={globalFilter}
                    onChange={handleChange}
                    size="small"
                    onBlur={handleSearchBlur}
                    sx={{ minWidth: 200 }}
                    endAdornment={
                        hasSearch ? (
                            <InputAdornment position="end">
                                <Tooltip title="Clear search">
                                    <IconButton
                                        size="small"
                                        onClick={handleSearchClear}
                                        edge="end"
                                    >
                                        <ClearIconSlot
                                            size="small"
                                            {...slotProps?.clearIcon}
                                        />
                                    </IconButton>
                                </Tooltip>
                            </InputAdornment>
                        ) : null
                    }
                    startAdornment={
                        searchVisible || hasSearch ? (
                            <InputAdornment position="start">
                                <SearchIconSlot
                                    size="small"
                                    {...slotProps?.searchIcon}
                                />
                            </InputAdornment>
                        ) : null
                    }
                />
            </Collapse>
        </Box>
    );
}
