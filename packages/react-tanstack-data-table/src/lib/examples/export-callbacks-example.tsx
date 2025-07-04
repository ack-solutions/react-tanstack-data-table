import { Box, Button, Alert, LinearProgress, Typography, Card, CardContent } from '@mui/material';
import { useState, useRef } from 'react';

import { DataTable } from '../components/table/data-table';
import { DataTableApi } from '../types/data-table-api';


// Sample data
const sampleData = Array.from({ length: 1000 }, (_, i) => ({
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

export function ExportCallbacksExample() {
    const [exportProgress, setExportProgress] = useState<{
        processedRows: number;
        totalRows: number;
        percentage: number;
    } | null>(null);
    const [exportStatus, setExportStatus] = useState<string>('');
    const [isExporting, setIsExporting] = useState(false);
    const [exportResult, setExportResult] = useState<{
        success: boolean;
        filename: string;
        totalRows: number;
    } | null>(null);

    const tableRef = useRef<DataTableApi<any>>(null);

    const handleExportProgress = (progress: { processedRows: number; totalRows: number; percentage: number }) => {
        setExportProgress(progress);
        setExportStatus(`Exporting... ${progress.percentage.toFixed(1)}%`);
    };

    const handleExportComplete = (result: { success: boolean; filename: string; totalRows: number }) => {
        setExportProgress(null);
        setExportResult(result);
        setIsExporting(false);
        setExportStatus(result.success
            ? `✅ Export completed! ${result.totalRows} rows exported to ${result.filename}`
            : '❌ Export failed');
    };

    const handleExportError = (error: { message: string; code: string }) => {
        setExportProgress(null);
        setIsExporting(false);
        setExportStatus(`❌ Export error: ${error.message} (${error.code})`);
    };

    const handleExportCancel = () => {
        setExportProgress(null);
        setIsExporting(false);
        setExportStatus('🚫 Export cancelled by user');
    };

    // Server export simulation
    const handleServerExport = async (filters?: any) => {
        // Simulate server delay and chunked processing
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

    const programmaticExport = async (format: 'csv' | 'excel') => {
        if (!tableRef.current) return;

        try {
            setIsExporting(true);
            setExportStatus(`Starting ${format.toUpperCase()} export...`);

            if (format === 'csv') {
                await tableRef.current.export.exportCSV({
                    filename: 'programmatic-export',
                    onlyVisibleColumns: true,
                });
            } else {
                await tableRef.current.export.exportExcel({
                    filename: 'programmatic-export',
                    onlyVisibleColumns: true,
                });
            }
        } catch (error) {
            console.error('Programmatic export failed:', error);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography
                variant="h4"
                gutterBottom
            >
                Export with Callbacks Example
            </Typography>

            <Typography
                variant="body1"
                paragraph
            >
                This example demonstrates:
            </Typography>
            <ul>
                <li>Export progress callbacks</li>
                <li>Export completion/error handling</li>
                <li>Export cancellation</li>
                <li>Programmatic exports via ref API</li>
                <li>Background export processing (doesn't block UI)</li>
                <li>Server-side export with filters</li>
            </ul>

            {/* Export Status Card */}
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
                            sx={{ mb: 2 }}
                        >
                            {exportStatus}
                        </Alert>
                    ) : null}

                    {exportResult ? (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Last export:
                            {' '}
                            {exportResult.filename}
                            {' '}
                            (
                            {exportResult.totalRows}
                            {' '}
                            rows)
                        </Typography>
                    ) : null}
                </CardContent>
            </Card>

            {/* Programmatic Export Controls */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography
                        variant="h6"
                        gutterBottom
                    >
                        Programmatic Export (via Ref API)
                    </Typography>
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 2,
                        }}
                    >
                        <Button
                            variant="contained"
                            onClick={() => programmaticExport('csv')}
                            disabled={isExporting}
                        >
                            Export CSV (Ref API)
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => programmaticExport('excel')}
                            disabled={isExporting}
                        >
                            Export Excel (Ref API)
                        </Button>
                        <Button
                            variant="outlined"
                            color="warning"
                            onClick={() => tableRef.current?.export.cancelExport()}
                            disabled={!isExporting}
                        >
                            Cancel Export
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Client Mode Table */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography
                        variant="h6"
                        gutterBottom
                    >
                        Client Mode Export (1000 rows in memory)
                    </Typography>
                    <DataTable
                        ref={tableRef}
                        data={sampleData}
                        columns={columns}
                        dataMode="client"
                        enableGlobalFilter
                        enableSorting
                        exportFilename="client-export"
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
                        Server Mode Export (simulated server data)
                    </Typography>
                    <DataTable
                        data={sampleData.slice(0, 10)} // Show only first 10 for demo
                        totalRow={sampleData.length}
                        columns={columns}
                        dataMode="server"
                        enableGlobalFilter
                        enableSorting
                        exportFilename="server-export"
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
                    />
                </CardContent>
            </Card>

            <Alert
                severity="info"
                sx={{ mt: 3 }}
            >
                <Typography variant="body2">
                    <strong>Note:</strong>
                    {' '}
                    Export functionality works in the background.
                    You can continue using the table, changing filters, or navigating pages during export.
                    The export captures the current state when started and won't be affected by subsequent changes.
                </Typography>
            </Alert>
        </Box>
    );
}
