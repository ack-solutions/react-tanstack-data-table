import { Box, Alert, LinearProgress, Typography, Card, CardContent } from '@mui/material';
import { useState } from 'react';

import { DataTable } from '../components/table/data-table';
import { TableExportControl } from '../components/toolbar/table-export-control';


// Sample data
const sampleData = Array.from({ length: 500 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    age: Math.floor(Math.random() * 50) + 20,
    city: [
        'New York',
        'London',
        'Tokyo',
        'Paris',
        'Berlin',
    ][Math.floor(Math.random() * 5)],
    status: [
        'Active',
        'Inactive',
        'Pending',
    ][Math.floor(Math.random() * 3)],
}));

const columns = [
    {
        accessorKey: 'id',
        header: 'ID',
        size: 80,
    },
    {
        accessorKey: 'name',
        header: 'Name',
        size: 150,
    },
    {
        accessorKey: 'email',
        header: 'Email',
        size: 200,
    },
    {
        accessorKey: 'age',
        header: 'Age',
        size: 80,
    },
    {
        accessorKey: 'city',
        header: 'City',
        size: 120,
    },
    {
        accessorKey: 'status',
        header: 'Status',
        size: 100,
    },
];

export function SlotExportExample() {
    const [exportProgress, setExportProgress] = useState<{
        processedRows: number;
        totalRows: number;
        percentage: number;
    } | null>(null);
    const [exportStatus, setExportStatus] = useState<string>('');

    const handleExportProgress = (progress: { processedRows: number; totalRows: number; percentage: number }) => {
        setExportProgress(progress);
        setExportStatus(`Exporting... ${progress.percentage.toFixed(1)}%`);
    };

    const handleExportComplete = (result: { success: boolean; filename: string; totalRows: number }) => {
        setExportProgress(null);
        setExportStatus(result.success
            ? `✅ Export completed! ${result.totalRows} rows exported to ${result.filename}`
            : '❌ Export failed');
    };

    const handleExportError = (error: { message: string; code: string }) => {
        setExportProgress(null);
        setExportStatus(`❌ Export error: ${error.message} (${error.code})`);
    };

    const handleExportCancel = () => {
        setExportProgress(null);
        setExportStatus('🚫 Export cancelled by user');
    };

    // Server export simulation
    const handleServerExport = async (filters?: any) => {
        // Simulate server delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Return filtered data based on current filters
        let filteredData = [...sampleData];

        // Apply global filter if exists
        if (filters?.globalFilter) {
            const search = filters.globalFilter.toLowerCase();
            filteredData = filteredData.filter(item => Object.values(item).some(value => String(value).toLowerCase().includes(search)));
        }

        // Apply sorting if exists
        if (filters?.sorting?.length > 0) {
            const sort = filters.sorting[0];
            filteredData.sort((a, b) => {
                const aVal = a[sort.id as keyof typeof a];
                const bVal = b[sort.id as keyof typeof b];
                if (aVal < bVal) return sort.desc ? 1 : -1;
                if (aVal > bVal) return sort.desc ? -1 : 1;
                return 0;
            });
        }

        return {
            data: filteredData,
            total: filteredData.length,
        };
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography
                variant="h4"
                gutterBottom
            >
                Slot Export Example
            </Typography>

            <Typography
                variant="body1"
                paragraph
            >
                This example shows how the TableExportControl slot component automatically
                receives export callbacks from the DataTable props through context.
            </Typography>

            <Alert
                severity="info"
                sx={{ mb: 3 }}
            >
                <Typography variant="body2">
                    <strong>Key Feature:</strong>
                    {' '}
                    The export control in the toolbar automatically
                    gets the export callbacks from the DataTable props. You don't need to manually
                    pass them to the slot component.
                </Typography>
            </Alert>

            {/* Export Status */}
            {(exportProgress || exportStatus) ? (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography
                            variant="h6"
                            gutterBottom
                        >
                            Export Status
                        </Typography>

                        {exportProgress ? (
                            <Box sx={{ mb: 2 }}>
                                <Typography
                                    variant="body2"
                                    gutterBottom
                                >
                                    Progress:
                                    {' '}
                                    {exportProgress.processedRows}
                                    {' '}
                                    /
                                    {' '}
                                    {exportProgress.totalRows}
                                    {' '}
                                    rows
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={exportProgress.percentage}
                                    sx={{
                                        height: 8,
                                        borderRadius: 4,
                                    }}
                                />
                            </Box>
                        ) : null}

                        {exportStatus ? (
                            <Alert
                                severity={
                                    exportStatus.includes('❌') ? 'error' :
                                        exportStatus.includes('🚫') ? 'warning' :
                                            exportStatus.includes('✅') ? 'success' : 'info'
                                }
                            >
                                {exportStatus}
                            </Alert>
                        ) : null}
                    </CardContent>
                </Card>
            ) : null}

            {/* Client Mode Table */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography
                        variant="h6"
                        gutterBottom
                    >
                        Client Mode with Export Callbacks
                    </Typography>
                    <DataTable
                        data={sampleData}
                        columns={columns}
                        dataMode="client"
                        enableGlobalFilter
                        enableSorting
                        enableExport
                        exportFilename="client-slot-export"
                        onExportProgress={handleExportProgress}
                        onExportComplete={handleExportComplete}
                        onExportError={handleExportError}
                        onExportCancel={handleExportCancel}
                        enablePagination
                        initialState={{
                            pagination: {
                                pageIndex: 0,
                                pageSize: 10,
                            },
                        }}
                        slots={{
                            exportButton: TableExportControl, // Using as slot
                        }}
                        slotProps={{
                            exportButton: {
                                // No need to pass export callbacks here!
                                // They're automatically available from context
                            },
                        }}
                    />
                </CardContent>
            </Card>

            {/* Server Mode Table */}
            <Card>
                <CardContent>
                    <Typography
                        variant="h6"
                        gutterBottom
                    >
                        Server Mode with Export Callbacks
                    </Typography>
                    <DataTable
                        data={sampleData.slice(0, 10)} // Show only first 10 for demo
                        totalRow={sampleData.length}
                        columns={columns}
                        dataMode="server"
                        enableGlobalFilter
                        enableSorting
                        enableExport
                        exportFilename="server-slot-export"
                        onExportProgress={handleExportProgress}
                        onExportComplete={handleExportComplete}
                        onExportError={handleExportError}
                        onExportCancel={handleExportCancel}
                        onServerExport={handleServerExport}
                        enablePagination
                        initialState={{
                            pagination: {
                                pageIndex: 0,
                                pageSize: 10,
                            },
                        }}
                        slots={{
                            exportButton: TableExportControl, // Using as slot
                        }}
                        slotProps={{
                            exportButton: {
                                // You can still override specific callbacks if needed
                                // exportFilename: 'custom-override-filename',
                            },
                        }}
                    />
                </CardContent>
            </Card>

            <Alert
                severity="success"
                sx={{ mt: 3 }}
            >
                <Typography variant="body2">
                    <strong>How it works:</strong>
                    {' '}
                    The DataTable passes export callbacks to the context,
                    and the TableExportControl slot component automatically receives them.
                    You can still override individual callbacks via slot props if needed.
                </Typography>
            </Alert>
        </Box>
    );
}
