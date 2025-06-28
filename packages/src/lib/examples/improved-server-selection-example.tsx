import React, { useState, useRef, useCallback } from 'react';
import { DataTable } from '../components/table/data-table';
import { DataTableApi, DataTableColumn } from '../types';
import { SelectionState } from '../features/custom-selection.feature';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
}

const MOCK_USERS: User[] = Array.from({ length: 500 }, (_, i) => ({
    id: String(i + 1),
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: i % 3 === 0 ? 'Admin' : i % 3 === 1 ? 'Editor' : 'Viewer',
    status: i % 4 === 0 ? 'inactive' : 'active',
}));

export const ImprovedServerSelectionExample = () => {
    const [data, setData] = useState<User[]>([]);
    const [total, setTotal] = useState(500);
    const [loading, setLoading] = useState(false);
    const [selectionInfo, setSelectionInfo] = useState<{
        selectAllMatching: boolean;
        excludedIds: string[];
        selectedIds: string[];
        totalSelected: number;
    } | null>(null);

    const apiRef = useRef<DataTableApi<User>>(null);

    const columns: DataTableColumn<User>[] = [
        {
            id: 'name',
            header: 'Name',
            accessorKey: 'name',
            enableGlobalFilter: true,
        },
        {
            id: 'email',
            header: 'Email',
            accessorKey: 'email',
            enableGlobalFilter: true,
        },
        {
            id: 'role',
            header: 'Role',
            accessorKey: 'role',
            enableGlobalFilter: true,
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            enableGlobalFilter: true,
        },
    ];

    const fetchData = useCallback(async (filters: any) => {
        console.log('Fetching data with filters:', filters);
        setLoading(true);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const { pagination } = filters;
        const pageIndex = pagination?.pageIndex || 0;
        const pageSize = pagination?.pageSize || 50;
        
        const startIndex = pageIndex * pageSize;
        const endIndex = startIndex + pageSize;
        const pageData = MOCK_USERS.slice(startIndex, endIndex);

        setData(pageData);
        setTotal(MOCK_USERS.length);
        setLoading(false);

        return {
            data: pageData,
            total: MOCK_USERS.length,
        };
    }, []);

    // Server export function that handles selection
    const fetchExportData = useCallback(async (filters: any, selection: any) => {
        console.log('Exporting data with filters:', filters);
        console.log('Export selection data:', selection);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        let dataToExport = [...MOCK_USERS];

        // Apply selection filtering
        if (selection?.hasSelection) {
            if (selection.selectAllMatching) {
                // Export all except excluded
                dataToExport = MOCK_USERS.filter(user => !selection.excludedIds.includes(user.id));
            } else {
                // Export only selected
                dataToExport = MOCK_USERS.filter(user => selection.selectedIds.includes(user.id));
            }
        }

        return {
            data: dataToExport,
            total: dataToExport.length,
        };
    }, []);

    const handleServerSelectionChange = useCallback((selection: SelectionState) => {
        console.log('Server selection changed:', selection);
        // Convert new selection state to old format for display compatibility
        const legacyFormat = {
            selectAllMatching: selection.type === 'exclude' && selection.ids.length === 0,
            excludedIds: selection.type === 'exclude' ? selection.ids : [],
            selectedIds: selection.type === 'include' ? selection.ids : [],
            totalSelected: selection.type === 'exclude' ? (total - selection.ids.length) : selection.ids.length,
        };
        setSelectionInfo(legacyFormat);
    }, [total]);

    const handleRowSelectionChange = useCallback((selectedRows: User[]) => {
        console.log('Row selection changed:', selectedRows.length, 'rows selected');
        console.log('Selected row IDs:', selectedRows.map(row => row.id));
    }, []);

    const handleExportProgress = (progress: any) => {
    };

    const handleExportComplete = (result: any) => {
        console.log('Export completed:', result);
    };

    const handleExportError = (error: any) => {
        console.error('Export error:', error);
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Improved Server Selection Example</h2>
            
            {/* Selection Info Display */}
            {selectionInfo && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Selection Info:</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Select All Matching: {selectionInfo.selectAllMatching ? 'Yes' : 'No'}</div>
                        <div>Total Selected: {selectionInfo.totalSelected}</div>
                        <div>Selected IDs: {selectionInfo.selectedIds.length}</div>
                        <div>Excluded IDs: {selectionInfo.excludedIds.length}</div>
                    </div>
                </div>
            )}

            {/* Manual API Triggers */}
            <div className="mb-4 space-x-2">
                <button
                    onClick={() => {
                        const payload = apiRef.current?.selection.getSelectionState();
                        console.log('Selection State:', payload);
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Get Selection Payload
                </button>
                <button
                    onClick={() => {
                        const selectionState = apiRef.current?.selection.getSelectionState();
                        console.log('Selection State:', selectionState);
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                    Get Selection State
                </button>
                <button
                    onClick={() => {
                        const selectedCount = apiRef.current?.selection.getSelectedCount();
                        console.log('Selected Count:', selectedCount);
                    }}
                    className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                >
                    Get Selected Count
                </button>
            </div>

            <DataTable
                ref={apiRef}
                columns={columns}
                data={data}
                totalRow={total}
                loading={loading}
                dataMode="server"
                selectMode="all"
                enableGlobalFilter
                enableRowSelection={true}
                enableMultiRowSelection={true}
                onFetchData={fetchData}
                onRowSelectionChange={handleRowSelectionChange}
                onSelectionChange={handleServerSelectionChange}
                onServerExport={fetchExportData}
                exportFilename="selected-users"
                onExportProgress={handleExportProgress}
                onExportComplete={handleExportComplete}
                onExportError={handleExportError}
                enableExport={true}
                enableBulkActions={true}
                bulkActions={(selectedRows) => (
                    <div className="flex space-x-2">
                        <button
                            onClick={() => console.log('Bulk action on', selectedRows.length, 'rows')}
                            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                        >
                            Delete Selected ({selectionInfo?.totalSelected || 0})
                        </button>
                        <button
                            onClick={() => console.log('Bulk edit on', selectedRows.length, 'rows')}
                            className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                        >
                            Edit Selected ({selectionInfo?.totalSelected || 0})
                        </button>
                    </div>
                )}
            />
        </div>
    );
}; 