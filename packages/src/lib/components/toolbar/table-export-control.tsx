import { CloudDownloadOutlined } from '@mui/icons-material';
import {
    IconButton,
    Tooltip,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Typography,
    Box,
} from '@mui/material';

import { MenuDropdown } from '../droupdown/menu-dropdown';
import { useDataTableContext } from '../../contexts/data-table-context';
import { ExcelIcon, CsvIcon } from '../../icons';
import {  TableState } from '../../types';
import { exportClientData, exportServerData } from '../../utils/export-utils';
import { getSlotComponent } from '../../utils/slot-helpers';
import { SelectionState } from '../../features/custom-selection.feature';

interface TableExportControlProps {
    // Optional props to override context defaults
    exportFilename?: string;
    onServerExport?: (filters?: Partial<TableState>, selection?: SelectionState) => Promise<{ data: any[]; total: number }>;
    onExportProgress?: (progress: { processedRows: number; totalRows: number; percentage: number }) => void;
    onExportComplete?: (result: { success: boolean; filename: string; totalRows: number }) => void;
    onExportError?: (error: { message: string; code: string }) => void;
}

export function TableExportControl({
    exportFilename: propsExportFilename,
    onServerExport: propsOnServerExport,
    onExportProgress: propsOnExportProgress,
    onExportComplete: propsOnExportComplete,
    onExportError: propsOnExportError,
}: TableExportControlProps = {}) {
    const {
        table,
        apiRef,
        slots,
        slotProps,
        dataMode,
        isExporting,
        onCancelExport,
        // Export callbacks from context (DataTable props)
        exportFilename: contextExportFilename,
        onServerExport: contextOnServerExport,
        onExportProgress: contextOnExportProgress,
        onExportComplete: contextOnExportComplete,
        onExportError: contextOnExportError,
    } = useDataTableContext();

    // Use props if provided, otherwise fall back to context values
    const exportFilename = propsExportFilename || contextExportFilename || 'export';
    const onServerExport = propsOnServerExport || contextOnServerExport;
    const onExportProgress = propsOnExportProgress || contextOnExportProgress;
    const onExportComplete = propsOnExportComplete || contextOnExportComplete;
    const onExportError = propsOnExportError || contextOnExportError;

    const ExportIconSlot = getSlotComponent(slots, 'exportIcon', CloudDownloadOutlined);
    const CsvIconSlot = getSlotComponent(slots, 'csvIcon', CsvIcon);
    const ExcelIconSlot = getSlotComponent(slots, 'excelIcon', ExcelIcon);

    const handleExport = async (format: 'csv' | 'excel') => {
        try {
            if (dataMode === 'server' && onServerExport) {
                // Server mode export - fetch data with current filters and selection
                const currentState = table.getState();
                const currentFilters = {
                    globalFilter: currentState.globalFilter,
                    sorting: currentState.sorting,
                    columnFilters: currentState.columnFilters,
                };

                // Get selection data from apiRef if available
                const selectionData = apiRef?.current?.selection?.getSelectionState();
                await exportServerData(table, {
                    format,
                    filename: exportFilename,
                    fetchData: (filters, selection) => onServerExport(filters || currentFilters, selection),
                    currentFilters,
                    selection: selectionData,
                    onProgress: onExportProgress,
                    onComplete: onExportComplete,
                    onError: onExportError,
                });
            } else {
                // Client mode export - export selected rows if any, otherwise all filtered rows
                await exportClientData(table, {
                    format,
                    filename: exportFilename,
                    onProgress: onExportProgress,
                    onComplete: onExportComplete,
                    onError: onExportError,
                });
            }
        } catch (error) {
            console.error('Export failed:', error);
            onExportError?.({
                message: error instanceof Error ? error.message : 'Export failed',
                code: 'PROCESSING_ERROR',
            });
        }
    };

    const selectedRowCount = Object.keys(table.getState().rowSelection).filter(
        key => table.getState().rowSelection[key],
    ).length;

    const summary = {
        filteredRows: table.getFilteredRowModel().rows.length,
        totalColumns: table.getVisibleLeafColumns().filter(col => col.getIsVisible()).length,
        selectedRows: selectedRowCount,
        hasSelection: selectedRowCount > 0,
    };

    return (
        <MenuDropdown
            anchor={(
                <Tooltip title="Export data">
                    <IconButton
                        size="small"
                        disabled={isExporting}
                        sx={{
                            flexShrink: 0,
                            color: isExporting ? 'warning.main' : 'text.secondary',
                        }}
                    >
                        <ExportIconSlot
                            {...slotProps?.exportIcon}
                        />
                    </IconButton>
                </Tooltip>
            )}
        >
            {({ handleClose }: { handleClose: () => void }) => (
                <Box
                    sx={{
                        p: 1,
                        minWidth: 280,
                    }}
                >
                    {/* Export Summary */}
                    <Box
                        sx={{
                            mb: 2,
                            p: 1,
                            bgcolor: 'grey.50',
                            borderRadius: 1,
                        }}
                    >
                        <Typography
                            variant="subtitle2"
                            gutterBottom
                        >
                            Export Summary
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            {summary.hasSelection
                                ? `${summary.selectedRows} selected • ${summary.totalColumns} visible columns`
                                : `${summary.filteredRows} filtered • ${summary.totalColumns} visible columns`
                            }
                        </Typography>
                        {summary.hasSelection ? (
                            <Typography
                                variant="caption"
                                color="primary.main"
                                sx={{ fontWeight: 'medium' }}
                            >
                                Will export selected rows only
                            </Typography>
                        ) : null}
                    </Box>

                    {/* Export Options */}
                    {isExporting ? (
                        <MenuItem
                            onClick={() => {
                                onCancelExport?.();
                                handleClose();
                            }}
                        >
                            <ListItemIcon>
                                <ExportIconSlot
                                    fontSize="small"
                                    color="warning"
                                    {...slotProps?.exportIcon}
                                />
                            </ListItemIcon>
                            <ListItemText
                                primary="Cancel Export"
                                secondary="Stop current export"
                            />
                        </MenuItem>
                    ) : (
                        <>
                            <MenuItem
                                onClick={async () => {
                                    await handleExport('csv');
                                    handleClose();
                                }}
                                disabled={isExporting}
                            >
                                <ListItemIcon>
                                    <CsvIconSlot
                                        fontSize="small"
                                        {...slotProps?.csvIcon}
                                    />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Export as CSV"
                                    secondary=".csv format"
                                />
                            </MenuItem>

                            <MenuItem
                                onClick={async () => {
                                    await handleExport('excel');
                                    handleClose();
                                }}
                                disabled={isExporting}
                            >
                                <ListItemIcon>
                                    <ExcelIconSlot
                                        fontSize="small"
                                        {...slotProps?.excelIcon}
                                    />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Export as Excel"
                                    secondary=".xlsx format"
                                />
                            </MenuItem>
                        </>
                    )}
                </Box>
            )}
        </MenuDropdown>
    );
}
