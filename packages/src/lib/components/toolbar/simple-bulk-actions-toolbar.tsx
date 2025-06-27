/**
 * Simple Bulk Actions Toolbar - Clean Implementation
 * Uses the user's server selection approach
 */
import {
    Box,
    Toolbar,
    Typography,
    IconButton,
    Button,
    Checkbox,
    Tooltip,
    Divider,
    Stack,
    Chip,
} from '@mui/material';
import {
    SelectAllOutlined,
    ClearAllOutlined,
    InfoOutlined,
} from '@mui/icons-material';
import { ReactNode } from 'react';

// User's exact state structure
type ServerSelectionState = {
  selectAllMatching: boolean;
  selectedRowIds: string[];
  excludedRowIds: string[];
};

interface SimpleBulkActionsToolbarProps<T> {
    // Server selection state and handlers
    serverSelection: ServerSelectionState;
    onSelectAllMatching: () => void;
    onClearAllSelection: () => void;
    onTogglePageSelection: () => void;
    
    // Page selection state
    pageSelectionState: {
        checked: boolean;
        indeterminate: boolean;
    };
    
    // Selection counts
    selectedCount: {
        count: number;
        isApproximate: boolean;
    };
    totalFilteredCount?: number; // Total rows matching current filters (from server)
    
    // Bulk actions
    bulkActions?: (payload: any) => ReactNode;
    getBulkActionPayload: () => any;
    
    // Styling
    sx?: any;
}

export function SimpleBulkActionsToolbar<T>({
    serverSelection,
    onSelectAllMatching,
    onClearAllSelection,
    onTogglePageSelection,
    pageSelectionState,
    selectedCount,
    totalFilteredCount,
    bulkActions,
    getBulkActionPayload,
    sx,
}: SimpleBulkActionsToolbarProps<T>) {
    
    // Show toolbar only when there are selections
    const hasSelections = serverSelection.selectAllMatching || 
                         serverSelection.selectedRowIds.length > 0;
    
    if (!hasSelections) return null;

    // Selection summary text
    const getSelectionSummary = () => {
        if (serverSelection.selectAllMatching) {
            const excludedCount = serverSelection.excludedRowIds.length;
            if (totalFilteredCount !== undefined) {
                const selectedTotal = totalFilteredCount - excludedCount;
                return `${selectedTotal.toLocaleString()} of ${totalFilteredCount.toLocaleString()} filtered rows selected`;
            }
            return excludedCount > 0 
                ? `All filtered rows selected (${excludedCount} excluded)`
                : 'All filtered rows selected';
        } else {
            return `${selectedCount.count.toLocaleString()} row${selectedCount.count === 1 ? '' : 's'} selected`;
        }
    };

    return (
        <Toolbar
            sx={{
                bgcolor: 'primary.50',
                borderBottom: '1px solid',
                borderColor: 'primary.200',
                minHeight: '64px !important',
                px: 2,
                ...sx,
            }}
        >
            <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ width: '100%' }}
            >
                {/* Page Selection Checkbox */}
                <Tooltip title="Select/deselect all rows on current page">
                    <Checkbox
                        checked={pageSelectionState.checked}
                        indeterminate={pageSelectionState.indeterminate}
                        onChange={onTogglePageSelection}
                        color="primary"
                    />
                </Tooltip>

                {/* Selection Controls */}
                <Stack direction="row" spacing={1} alignItems="center">
                    {/* Select All Matching Button */}
                    {!serverSelection.selectAllMatching && (
                        <Tooltip title="Select all rows matching current filters">
                            <Button
                                size="small"
                                variant="outlined"
                                startIcon={<SelectAllOutlined />}
                                onClick={onSelectAllMatching}
                            >
                                Select All Matching
                            </Button>
                        </Tooltip>
                    )}

                    {/* Clear All Button */}
                    <Tooltip title="Clear all selections">
                        <IconButton
                            size="small"
                            onClick={onClearAllSelection}
                            color="error"
                        >
                            <ClearAllOutlined />
                        </IconButton>
                    </Tooltip>
                </Stack>

                <Divider orientation="vertical" flexItem />

                {/* Selection Summary */}
                <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" color="primary.main" fontWeight="medium">
                        {getSelectionSummary()}
                    </Typography>
                    
                    {/* Selection Mode Indicator */}
                    {serverSelection.selectAllMatching && (
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                            <Chip
                                size="small"
                                label="All Matching Selected"
                                color="success"
                                variant="outlined"
                                icon={<InfoOutlined />}
                            />
                            {serverSelection.excludedRowIds.length > 0 && (
                                <Typography variant="caption" color="text.secondary">
                                    {serverSelection.excludedRowIds.length} manually deselected
                                </Typography>
                            )}
                        </Stack>
                    )}
                </Box>

                {/* Bulk Actions */}
                {bulkActions && (
                    <>
                        <Divider orientation="vertical" flexItem />
                        <Box>
                            {bulkActions(getBulkActionPayload())}
                        </Box>
                    </>
                )}
            </Stack>
        </Toolbar>
    );
} 