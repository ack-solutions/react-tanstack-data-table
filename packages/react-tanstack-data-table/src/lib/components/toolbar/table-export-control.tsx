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
    Divider,
    LinearProgress,
} from '@mui/material';

import { MenuDropdown } from '../droupdown/menu-dropdown';
import { useDataTableContext } from '../../contexts/data-table-context';
import { ExcelIcon, CsvIcon } from '../../icons';
import { getSlotComponent, mergeSlotProps, extractSlotProps } from '../../utils/slot-helpers';

interface TableExportControlProps {
    // Optional props to override context defaults
    exportFilename?: string;
    // onServerExport?: (filters?: Partial<TableFilters>, selection?: SelectionState) => Promise<{ data: any[]; total: number }>;
    // onExportProgress?: (progress: { processedRows?: number; totalRows?: number; percentage?: number }) => void;
    // onExportComplete?: (result: { success: boolean; filename: string; totalRows: number }) => void;
    // onExportError?: (error: { message: string; code: string }) => void;
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
        iconButtonProps,
        tooltipProps,
        menuSx,
        menuItemProps,
    } = props;

    const {
        apiRef,
        slots,
        slotProps,
        isExporting,
        exportPhase,
        exportProgress,
        onCancelExport,
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

    const handleCancelExport = () => {
        if (onCancelExport) {
            onCancelExport();
            return;
        }
        apiRef?.current?.export.cancelExport();
    };

    // Merge all props for maximum flexibility
    const mergedIconButtonProps = mergeSlotProps(
        {
            size: 'small',
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

    const progressPercentage = typeof exportProgress?.percentage === 'number'
        ? Math.max(0, Math.min(100, exportProgress.percentage))
        : undefined;

    const getPhaseLabel = () => {
        switch (exportPhase) {
            case 'fetching':
                return 'Fetching rows from server...';
            case 'processing':
                return 'Preparing export file...';
            case 'downloading':
                return 'Downloading file...';
            case 'starting':
                return 'Starting export...';
            default:
                return 'Export in progress...';
        }
    };

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
                        <>
                            <Box sx={{ px: 2, pb: 1 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
                                    {getPhaseLabel()}
                                </Typography>
                                <LinearProgress
                                    variant={progressPercentage !== undefined ? 'determinate' : 'indeterminate'}
                                    value={progressPercentage !== undefined ? progressPercentage : 0}
                                />
                                {(exportProgress?.processedRows !== undefined || exportProgress?.totalRows !== undefined) && (
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                                        {`${exportProgress?.processedRows ?? 0}${exportProgress?.totalRows !== undefined ? ` / ${exportProgress.totalRows}` : ''}${progressPercentage !== undefined ? ` (${progressPercentage}%)` : ''}`}
                                    </Typography>
                                )}
                            </Box>
                            <Divider sx={{ my: 1 }} />
                            <MenuItem
                                onClick={() => {
                                    handleCancelExport();
                                    handleClose();
                                }}
                                {...mergedMenuItemProps}
                            >
                                <ListItemText
                                    primary="Cancel Export"
                                    secondary="Stop current export job"
                                    slotProps={{
                                        primary: {
                                            color: 'error.main',
                                        },
                                    }}
                                />
                            </MenuItem>
                        </>
                    )}
                </Box>
            )}
        </MenuDropdown>
    );
}
