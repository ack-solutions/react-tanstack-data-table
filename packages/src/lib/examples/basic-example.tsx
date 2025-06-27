/* eslint-disable react/no-multi-comp */
import {
    Print as PrintIcon,
    Share as ShareIcon,
} from '@mui/icons-material';
import {
    Button,
    Chip,
    MenuItem,
    ListItemIcon,
    ListItemText,
    FormControl,
    InputLabel,
    Select,
} from '@mui/material';
import React, { useState } from 'react';

import { DataTable } from '../components';


// Cell renderers (moved outside to avoid recreation on each render)
function StatusCell({ getValue }: { getValue: () => any }) {
    return (
        <Chip
            label={getValue() as string}
            color={getValue() === 'active' ? 'success' : 'default'}
            size="small"
        />
    );
}

const DateCell = ({ getValue }: { getValue: () => any }) => (
    new Date(getValue() as string).toLocaleDateString()
);

function BooleanCell({ getValue }: { getValue: () => any }) {
    return (
        <Chip
            label={getValue() ? 'Yes' : 'No'}
            color={getValue() ? 'success' : 'default'}
            size="small"
        />
    );
}

// Custom filter component example for priority
function PriorityFilterComponent({ value, onChange }: { value: any; onChange: (value: any) => void }) {
    return (
        <FormControl
            size="small"
            sx={{ minWidth: 120 }}
        >
            <InputLabel>Priority</InputLabel>
            <Select
                value={value}
                label="Priority"
                onChange={(e) => onChange(e.target.value)}
            >
                <MenuItem value={1}>High (1)</MenuItem>
                <MenuItem value={2}>Medium (2)</MenuItem>
                <MenuItem value={3}>Low (3)</MenuItem>
            </Select>
        </FormControl>
    );
}

// Example data type
interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    status: 'active' | 'inactive';
    createdAt: string;
    isActive: boolean;
    priority: number;
}

// Example data
const sampleData: any[] = [
    {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: {
            id: 1,
            name: 'Admin',
        },
        status: 'active',
        createdAt: '2024-01-15',
        isActive: true,
        priority: 1,
    },
    {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: {
            id: 2,
            name: 'User',
        },
        status: 'active',
        createdAt: '2024-01-20',
        isActive: true,
        priority: 2,
    },
    {
        id: 3,
        name: 'Bob Wilson',
        email: 'bob@example.com',
        role: {
            id: 3,
            name: 'Moderator',
        },
        status: 'inactive',
        createdAt: '2024-02-01',
        isActive: false,
        priority: 3,
    },
    {
        id: 4,
        name: 'John Doe',
        email: 'john@example.com',
        role: {
            id: 1,
            name: 'Admin',
        },
        status: 'active',
        createdAt: '2024-01-15',
        isActive: true,
        priority: 1,
    },
    {
        id: 5,
        name: 'John Doe',
        email: 'john@example.com',
        role: {
            id: 1,
            name: 'Admin',
        },
        status: 'active',
        createdAt: '2024-01-15',
        isActive: true,
        priority: 1,
    },
    {
        id: 6,
        name: 'John Doe',
        email: 'john@example.com',
        role: {
            id: 1,
            name: 'Admin',
        },
        status: 'active',
        createdAt: '2024-01-15',
        isActive: true,
        priority: 1,
    },
    {
        id: 7,
        name: 'John Doe',
        email: 'john@example.com',
        role: {
            id: 1,
            name: 'Admin',
        },
        status: 'active',
        createdAt: '2024-01-15',
        isActive: true,
        priority: 1,
    },
];

export function DataTableExample() {
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    /*
    Enhanced Column Filtering Features:

    1. Type-based Input Components:
       - text: Regular text input
       - number: Number input with validation
       - date: Date picker
       - boolean: Yes/No dropdown
       - select: Dropdown with predefined options

    2. Column Meta Configuration:
       meta: {
         type: 'text' | 'number' | 'date' | 'boolean' | 'select',
         filterable: true/false,
         options: [{ value: 'key', label: 'Display' }], // For select types
         filterComponent: CustomComponent, // Custom filter component
         enableColumnOrdering: false // Disable drag & drop for this column
       }

    3. Custom Filter Components:
       - Receive props: { value, onChange, filter, column }
       - Can implement API search, autocomplete, etc.

    4. Filter Logic:
       - Switch between AND/OR logic for multiple filters

    5. Column Drag & Drop Control:
       - Set enableColumnOrdering: false in column meta to disable dragging
       - Columns without this setting (or set to true) can be dragged
       - Drag handle (⋮⋮) only shows for draggable columns
       - Visual indicators and smart UI
    */

    // Define columns with proper typing and filtering metadata
    const columns: any[] = [
        {
            id: 'name',
            accessorKey: 'name',
            header: 'Name',
            enableSorting: true,
            enableHiding: false,
            meta: {
                type: 'text',
                filterable: true,
            },
        },
        {
            id: 'email',
            accessorKey: 'email',
            header: 'Email',
            enableSorting: true,
            meta: {
                type: 'text',
                filterable: true,
                enableColumnOrdering: false, // Disable dragging for this column
            },
        },
        {
            id: 'role',
            accessorKey: 'role.name',
            header: 'Role',
            enableSorting: true,
            minSize: 400,
            meta: {
                type: 'select',
                filterable: true,
                options: [
                    {
                        value: 'Admin',
                        label: 'Administrator',
                    },
                    {
                        value: 'User',
                        label: 'Regular User',
                    },
                    {
                        value: 'Moderator',
                        label: 'Moderator',
                    },
                ],
            },
        },
        {
            id: 'status',
            accessorKey: 'status',
            header: 'Status',
            cell: StatusCell,
            enableSorting: true,
            minSize: 400,
            meta: {
                type: 'select',
                filterable: true,
                options: [
                    {
                        value: 'active',
                        label: 'Active',
                    },
                    {
                        value: 'inactive',
                        label: 'Inactive',
                    },
                ],
                enableColumnOrdering: false, // Disable dragging for this column
            },
        },
        {
            id: 'role_id',
            accessorKey: 'role.id',
            header: 'Is Active',
            cell: BooleanCell,
            enableSorting: false, // Disable sorting for this column to show difference
            minSize: 200,
            meta: {
                type: 'boolean',
                filterable: true,
            },
        },
        {
            id: 'isActive',
            accessorKey: 'isActive',
            header: 'Is Active',
            cell: BooleanCell,
            minSize: 200,
            enableSorting: false, // Disable sorting for this column to show difference
            meta: {
                type: 'boolean',
                filterable: true,
            },
        },
        {
            id: 'priority',
            accessorKey: 'priority',
            header: 'Priority',
            enableSorting: true,
            minSize: 200,
            meta: {
                type: 'number',
                filterable: true,
                filterComponent: PriorityFilterComponent,
            },
        },
        {
            id: 'createdAt',
            accessorKey: 'createdAt',
            header: 'Created At',
            cell: DateCell,
            enableSorting: true,
            minSize: 400,
            meta: {
                type: 'date',
                filterable: true,
            },
        },
    ];

    const handleSelectionChange = (selected: User[]) => {
        setSelectedUsers(selected);
    };

    const handleExport = (rows: User[]) => {
        console.log('Exporting:', rows.length > 0 ? rows : sampleData);
        // Implement your export logic here (CSV, Excel, etc.)
    };

    const handleColumnFiltersChange = (filterState: any) => {
        console.log('Column filters changed:', filterState);
        // You can implement custom filtering logic here
        // filterState.filters contains the active filters
        // filterState.logic contains 'AND' or 'OR'
    };

    const handleSortingChange = (sorting: any) => {
        console.log('Sorting changed:', sorting);
        // You can implement server-side sorting here
        // sorting is an array of { id: string, desc: boolean }
        // For server-side: send sorting to your API
        // For client-side: TanStack handles it automatically
    };

    const handleColumnOrderChange = (columnOrder: string[]) => {
        console.log('Column order changed:', columnOrder);
        // You can implement custom column ordering logic here
        // columnOrder is an array of column ids in the new order
    };

    const handleColumnPinningChange = (pinning: any) => {
        console.log('Column pinning changed:', pinning);
        // You can implement custom column pinning logic here
        // pinning contains { left: string[], right: string[] }
    };

    // Extra actions for the more menu
    const extraActions = (
        <>
            <MenuItem onClick={() => window.print()}>
                <ListItemIcon>
                    <PrintIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Print Table</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => alert('Share functionality')}>
                <ListItemIcon>
                    <ShareIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Share</ListItemText>
            </MenuItem>
        </>
    );

    return (
        <div style={{ padding: '20px' }}>
            <h1>DataTable Example - Sticky Header & Footer</h1>
            <p
                style={{
                    marginBottom: '20px',
                    color: '#666',
                }}
            >
                This table has a fixed height with sticky header and footer.
                The table body scrolls independently while header and pagination remain visible.
            </p>

            {selectedUsers.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                    <h3>
                        Selected Users:
                        {selectedUsers.length}
                    </h3>
                    {selectedUsers.map(user => (
                        <div key={user.id}>
                            {user.name}
                            {' '}
                            -
                            {' '}
                            {user.email}
                        </div>
                    ))}
                </div>
            )}

            <DataTable
                data={sampleData}
                columns={columns}
                totalRow={sampleData.length}
                loading={loading}
                skeletonRows={8}
                enableRowSelection
                enableMultiRowSelection
                onRowSelectionChange={handleSelectionChange}
                enableColumnResizing
                columnResizeMode="onChange"
                enablePagination
                enableGlobalFilter
                enableColumnFilters
                enableSorting
                onSortingChange={handleSortingChange}
                enableHover
                enableStripes
                enableColumnVisibility
                enableExport
                enableReset
                selectMode="page"
                onColumnFiltersChange={handleColumnFiltersChange}
                enableStickyHeaderOrFooter
                draggable
                enableColumnPinning
                onColumnPinningChange={handleColumnPinningChange}
                onColumnDragEnd={handleColumnOrderChange}
                maxHeight="300px"
                extraFilter={(
                    <>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => setLoading(!loading)}
                            color={loading ? 'secondary' : 'primary'}
                        >
                            {loading ? 'Stop Loading' : 'Show Loading'}
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                        >
                            Custom Filter
                        </Button>
                    </>
                )}
                slotProps={{
                    pagination: {
                        rowsPerPageOptions: [5, 20, 50, 100],
                    },
                }}
            />
        </div>
    );
}

// Example with expandable rows
export function DataTableExpandableExample() {
    const expandableColumns: any[] = [
        {
            accessorKey: 'name',
            header: 'Name',
        },
        {
            accessorKey: 'email',
            header: 'Email',
        },
        {
            accessorKey: 'role',
            header: 'Role',
        },
    ];

    const renderSubComponent = (row: any) => (
        <div
            style={{
                padding: '16px',
                backgroundColor: '#f5f5f5',
            }}
        >
            <h4>User Details</h4>
            <p>
                <strong>ID:</strong>
                {' '}
                {row.original.id}
            </p>
            <p>
                <strong>Status:</strong>
                {' '}
                {row.original.status}
            </p>
            <p>
                <strong>Created:</strong>
                {' '}
                {row.original.createdAt}
            </p>
        </div>
    );

    return (
        <div style={{ padding: '20px' }}>
            <h1>DataTable with Expandable Rows</h1>

            <DataTable
                data={sampleData}
                enableRowSelection
                columns={expandableColumns}
                totalRow={sampleData.length}
                enableExpanding
                renderSubComponent={renderSubComponent}
                getRowCanExpand={() => true}
                enableColumnResizing
                enableGlobalFilter
            />
        </div>
    );
}
