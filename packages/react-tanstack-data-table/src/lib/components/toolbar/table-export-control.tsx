import { CloudDownloadOutlined } from '@mui/icons-material';
import React from 'react';
import {
    IconButton,
    Tooltip,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Typography,
    Box,
    IconButtonProps,
    SxProps,
} from '@mui/material';

import { MenuDropdown } from '../droupdown/menu-dropdown';
import { useDataTableContext } from '../../contexts/data-table-context';
import { ExcelIcon, CsvIcon } from '../../icons';
import { TableFilters } from '../../types';
import { getSlotComponent, mergeSlotProps, extractSlotProps } from '../../utils/slot-helpers';
import { SelectionState } from '../../features';

interface TableExportControlProps {
    // Optional props to override context defaults
    exportFilename?: string;
    onServerExport?: (filters?: Partial<TableFilters>, selection?: SelectionState) => Promise<{ data: any[]; total: number }>;
    onExportProgress?: (progress: { processedRows?: number; totalRows?: number; percentage?: number }) => void;
    onExportComplete?: (result: { success: boolean; filename: string; totalRows: number }) => void;
    onExportError?: (error: { message: string; code: string }) => void;
    // Enhanced customization props
    iconButtonProps?: IconButtonProps;
    tooltipProps?: any;
    menuSx?: SxProps;
    menuItemProps?: any;
    [key: string]: any;
}

export function TableExportControl(props: TableExportControlProps = {}) {
    const {
        exportFilename: propsExportFilename,
        onServerExport: propsOnServerExport,
        onExportProgress: propsOnExportProgress,
        onExportComplete: propsOnExportComplete,
        onExportError: propsOnExportError,
        iconButtonProps,
        tooltipProps,
        menuSx,
        menuItemProps,
        ...otherProps
    } = props;

    const {
        apiRef,
        slots,
        slotProps,
        isExporting,
        // Export callbacks from context (DataTable props)
        exportFilename: contextExportFilename,
    } = useDataTableContext();

    // Use props if provided, otherwise fall back to context values
    const exportFilename = propsExportFilename || contextExportFilename || 'export';

    // Extract slot-specific props with enhanced merging
    const exportIconSlotProps = extractSlotProps(slotProps, 'exportIcon');
    const csvIconSlotProps = extractSlotProps(slotProps, 'csvIcon');
    const excelIconSlotProps = extractSlotProps(slotProps, 'excelIcon');

    const ExportIconSlot = getSlotComponent(slots, 'exportIcon', CloudDownloadOutlined);
    const CsvIconSlot = getSlotComponent(slots, 'csvIcon', CsvIcon);
    const ExcelIconSlot = getSlotComponent(slots, 'excelIcon', ExcelIcon);

    const handleExport = async (format: 'csv' | 'excel') => {
        if (!apiRef?.current) return;

        try {
            if (format === 'csv') {
                await apiRef.current.export.exportCSV({
                    filename: exportFilename,
                });
            } else {
                await apiRef.current.export.exportExcel({
                    filename: exportFilename,
                });
            }
        } catch (error) {
            console.error('Export failed:', error);
        }
    };

    // Merge all props for maximum flexibility
    const mergedIconButtonProps = mergeSlotProps(
        {
            size: 'small',
            disabled: isExporting,
            sx: { flexShrink: 0 },
        },
        exportIconSlotProps,
        iconButtonProps || {}
    );

    const mergedMenuItemProps = mergeSlotProps(
        {
            sx: { minWidth: 150 },
        },
        menuItemProps || {}
    );

    return (
        <MenuDropdown
            anchor={(
                <Tooltip 
                    title={isExporting ? 'Export in progress...' : 'Export data'}
                    {...tooltipProps}
                >
                    <IconButton
                        {...mergedIconButtonProps}
                    >
                        <ExportIconSlot {...exportIconSlotProps} />
                    </IconButton>
                </Tooltip>
            )}
        >
            {({ handleClose }: { handleClose: () => void }) => (
                <Box
                    sx={{
                        minWidth: 200,
                        ...menuSx,
                    }}
                >
                    <Typography
                        variant="subtitle2"
                        sx={{ p: 2, pb: 1 }}
                    >
                        Export Format
                    </Typography>
                    
                    <MenuItem
                        onClick={() => {
                            handleExport('csv');
                            handleClose();
                        }}
                        disabled={isExporting}
                        {...mergedMenuItemProps}
                    >
                        <ListItemIcon>
                            <CsvIconSlot {...csvIconSlotProps} />
                        </ListItemIcon>
                        <ListItemText
                            primary="CSV"
                            secondary="Comma-separated values"
                        />
                    </MenuItem>

                    <MenuItem
                        onClick={() => {
                            handleExport('excel');
                            handleClose();
                        }}
                        disabled={isExporting}
                        {...mergedMenuItemProps}
                    >
                        <ListItemIcon>
                            <ExcelIconSlot {...excelIconSlotProps} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Excel"
                            secondary="Microsoft Excel format"
                        />
                    </MenuItem>

                    {isExporting && (
                        <Box sx={{ p: 2, pt: 1 }}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: 'block', textAlign: 'center' }}
                            >
                                Export in progress...
                            </Typography>
                        </Box>
                    )}
                </Box>
            )}
        </MenuDropdown>
    );
}
