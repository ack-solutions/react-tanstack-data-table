import { Box, Alert, Typography, Card, CardContent, Button, Chip } from '@mui/material';
import { useState, useRef } from 'react';

import { DataTable } from '../components/table/data-table';
import { DataTableApi } from '../types/data-table-api';


// Sample data with complex values
const sampleData = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    age: Math.floor(Math.random() * 50) + 20,
    salary: Math.floor(Math.random() * 100000) + 30000,
    joinDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
    status: [
        'Active',
        'Inactive',
        'Pending',
    ][Math.floor(Math.random() * 3)],
    metadata: {
        department: [
            'Engineering',
            'Sales',
            'Marketing',
            'HR',
        ][Math.floor(Math.random() * 4)],
        skills: Math.floor(Math.random() * 10) + 1,
    },
}));

// Columns with valueFormatter and valueGetter examples
const columns = [
    {
        accessorKey: 'id',
        header: 'ID',
        size: 80,
        exportHeader: 'User ID', // Custom export header
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
        valueFormatter: ({ value }: any) => `${value} years`, // Shows "25 years" in export
    },
    {
        accessorKey: 'salary',
        header: 'Salary',
        size: 120,
        valueFormatter: ({ value }: any) => {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            }).format(value);
        },
        exportHeader: 'Annual Salary', // Different header for export
    },
    {
        accessorKey: 'joinDate',
        header: 'Join Date',
        size: 120,
        valueFormatter: ({ value }: any) => {
            return new Date(value).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        size: 100,
        cell: ({ getValue }: any) => {
            const status = getValue();
            return (
                <Chip
                    label={status}
                    color={status === 'Active' ? 'success' : status === 'Inactive' ? 'error' : 'warning'}
                    size="small"
                />
            );
        },
        // Export will show the raw status value, not the Chip component
    },
    {
        id: 'department',
        header: 'Department',
        size: 120,
        valueGetter: ({ row }: any) => row.metadata?.department || 'N/A', // Extract from nested object
        exportHeader: 'Employee Department',
    },
    {
        id: 'skillLevel',
        header: 'Skill Level',
        size: 100,
        valueGetter: ({ row }: any) => row.metadata?.skills || 0,
        valueFormatter: ({ value }: any) => {
            if (value >= 8) return 'Expert';
            if (value >= 6) return 'Advanced';
            if (value >= 4) return 'Intermediate';
            return 'Beginner';
        },
        exportHeader: 'Skill Level Rating',
    },
];

export function ImprovedExportExample() {
    const [exportStatus, setExportStatus] = useState<string>('');
    const tableRef = useRef<DataTableApi<any>>(null);

    const handleExportComplete = (result: { success: boolean; filename: string; totalRows: number }) => {
        setExportStatus(result.success
            ? `✅ Export completed! ${result.totalRows} rows exported to ${result.filename}`
            : '❌ Export failed');
    };

    const handleExportError = (error: { message: string; code: string }) => {
        setExportStatus(`❌ Export error: ${error.message} (${error.code})`);
    };

    const programmaticExport = async (format: 'csv' | 'excel') => {
        if (!tableRef.current) return;

        try {
            setExportStatus(`Starting ${format.toUpperCase()} export...`);

            if (format === 'csv') {
                await tableRef.current.export.exportCSV({
                    filename: 'programmatic-export',
                });
            } else {
                await tableRef.current.export.exportExcel({
                    filename: 'programmatic-export',
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
                Improved Export Example
            </Typography>

            <Typography
                variant="body1"
                paragraph
            >
                This example demonstrates the corrected export functionality that:
            </Typography>
            <ul>
                <li>
                    <strong>Uses Column Logic:</strong>
                    {' '}
                    Respects valueFormatter and valueGetter
                </li>
                <li>
                    <strong>Only Visible Columns:</strong>
                    {' '}
                    Exports only visible columns
                </li>
                <li>
                    <strong>Auto-Selected Rows:</strong>
                    {' '}
                    If rows are selected, exports only selected rows
                </li>
                <li>
                    <strong>Custom Export Headers:</strong>
                    {' '}
                    Uses exportHeader property if defined
                </li>
                <li>
                    <strong>Proper Value Formatting:</strong>
                    {' '}
                    Formats values like in the table display
                </li>
            </ul>

            <Alert
                severity="info"
                sx={{ mb: 3 }}
            >
                <Typography variant="body2">
                    <strong>Try this:</strong>
                    {' '}
                    Select some rows and then export. The export will
                    automatically include only the selected rows. If no rows are selected,
                    it exports all filtered rows.
                </Typography>
            </Alert>

            {/* Export Status */}
            {exportStatus ? (
                <Alert
                    severity={
                        exportStatus.includes('❌') ? 'error' :
                            exportStatus.includes('✅') ? 'success' : 'info'
                    }
                    sx={{ mb: 3 }}
                >
                    {exportStatus}
                </Alert>
            ) : null}

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
                        >
                            Export CSV (Ref API)
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => programmaticExport('excel')}
                        >
                            Export Excel (Ref API)
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* DataTable with improved export */}
            <Card>
                <CardContent>
                    <Typography
                        variant="h6"
                        gutterBottom
                    >
                        DataTable with Column-Based Export
                    </Typography>
                    <DataTable
                        ref={tableRef}
                        data={sampleData}
                        columns={columns}
                        dataMode="client"
                        enableGlobalFilter
                        enableSorting
                        enableRowSelection
                        enableMultiRowSelection
                        enableExport
                        exportFilename="improved-export"
                        onExportComplete={handleExportComplete}
                        onExportError={handleExportError}
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
                severity="success"
                sx={{ mt: 3 }}
            >
                <Typography variant="body2">
                    <strong>Export Features:</strong>
                    <br />
                    • Salary exports as formatted currency (e.g., "$65,000.00")
                    <br />
                    • Age exports with "years" suffix (e.g., "25 years")
                    <br />
                    • Join Date exports as formatted date (e.g., "Jan 15, 2022")
                    <br />
                    • Department extracts from nested metadata object
                    <br />
                    • Skill Level converts numbers to text levels
                    <br />
                    • Custom export headers replace display headers
                    <br />
                    • Status shows raw value (not Chip component)
                </Typography>
            </Alert>
        </Box>
    );
}
