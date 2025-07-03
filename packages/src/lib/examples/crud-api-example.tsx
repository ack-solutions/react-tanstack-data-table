import {
    Button,
    Stack,
    Typography,
    Box,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
} from '@mui/material';
import { ColumnDef } from '@tanstack/react-table';
import { useRef, useCallback, useState } from 'react';

import { DataTable } from '../components/table/data-table';
import { DataTableApi } from '../types';


interface User {
    id: number;
    name: string;
    email: string;
    status: 'active' | 'inactive' | 'pending';
    role: 'admin' | 'user' | 'manager';
    created: string;
    lastLogin?: string;
}

// Simulate API data
const initialData: User[] = [
    {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        status: 'active',
        role: 'admin',
        created: '2024-01-01',
        lastLogin: '2024-01-15',
    },
    {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        status: 'inactive',
        role: 'user',
        created: '2024-01-02',
        lastLogin: '2024-01-10',
    },
    {
        id: 3,
        name: 'Bob Johnson',
        email: 'bob@example.com',
        status: 'active',
        role: 'manager',
        created: '2024-01-03',
        lastLogin: '2024-01-14',
    },
    {
        id: 4,
        name: 'Alice Brown',
        email: 'alice@example.com',
        status: 'pending',
        role: 'user',
        created: '2024-01-04',
    },
    {
        id: 5,
        name: 'Charlie Wilson',
        email: 'charlie@example.com',
        status: 'active',
        role: 'user',
        created: '2024-01-05',
        lastLogin: '2024-01-12',
    },
];

const columns: ColumnDef<User>[] = [
    {
        id: 'name',
        accessorKey: 'name',
        header: 'Name',
        size: 150,
    },
    {
        id: 'email',
        accessorKey: 'email',
        header: 'Email',
        size: 200,
    },
    {
        id: 'status',
        accessorKey: 'status',
        header: 'Status',
        size: 100,
        cell: ({ getValue }) => {
            const status = getValue() as string;
            const colors = {
                active: '#4caf50',
                inactive: '#f44336',
                pending: '#ff9800',
            };
            return (
                <span
                    style={{
                        color: colors[status as keyof typeof colors],
                        fontWeight: 'bold',
                        textTransform: 'capitalize',
                    }}
                >
                    {status}
                </span>
            );
        },
    },
    {
        id: 'role',
        accessorKey: 'role',
        header: 'Role',
        size: 100,
    },
    {
        id: 'created',
        accessorKey: 'created',
        header: 'Created',
        size: 120,
    },
    {
        id: 'lastLogin',
        accessorKey: 'lastLogin',
        header: 'Last Login',
        size: 120,
        cell: ({ getValue }) => getValue() || 'Never',
    },
];

export function CrudApiExample() {
    const dataTableRef = useRef<DataTableApi<User>>(null);
    const [data, setData] = useState<User[]>(initialData);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editUser, setEditUser] = useState<Partial<User>>({});

    // Handle data changes from the table
    const handleDataChange = useCallback((newData: User[]) => {
        setData(newData);
        console.log('Data changed:', newData);
        // Here you would typically sync with your API
        // await updateUsersAPI(newData);
    }, []);

    // CRUD Operations Examples

    // Get Data Operations
    const handleGetAllData = useCallback(() => {
        const allData = dataTableRef.current?.data.getAllData();
        console.log('All data:', allData);
        alert(`Total users: ${allData?.length}. Check console for details.`);
    }, []);

    const handleGetUserById = useCallback(() => {
        const userId = prompt('Enter user ID:');
        if (userId) {
            const user = dataTableRef.current?.data.getRowData(userId);
            console.log('User found:', user);
            alert(user ? `Found: ${user.name} (${user.email})` : 'User not found');
        }
    }, []);

    const handleGetUserByIndex = useCallback(() => {
        const index = prompt('Enter row index (0-based):');
        if (index !== null) {
            const user = dataTableRef.current?.data.getRowByIndex(parseInt(index));
            console.log('User at index:', user);
            alert(user ? `User at index ${index}: ${user.name}` : 'No user at that index');
        }
    }, []);

    const handleFindActiveUsers = useCallback(() => {
        const activeUsers = dataTableRef.current?.data.findRows(user => user.status === 'active');
        console.log('Active users:', activeUsers);
        alert(`Found ${activeUsers?.length} active users. Check console for details.`);
    }, []);

    // Update Operations
    const handleUpdateUserStatus = useCallback(() => {
        const userId = prompt('Enter user ID to update status:');
        if (userId) {
            const user = dataTableRef.current?.data.getRowData(userId);
            if (user) {
                const newStatus = prompt('Enter new status (active/inactive/pending):') as User['status'];
                if (newStatus && [
                    'active',
                    'inactive',
                    'pending',
                ].includes(newStatus)) {
                    dataTableRef.current?.data.updateField(userId, 'status', newStatus);

                    // If activating user, update last login
                    if (newStatus === 'active') {
                        dataTableRef.current?.data.updateField(userId, 'lastLogin', new Date().toISOString().split('T')[0]);
                    }
                }
            } else {
                alert('User not found');
            }
        }
    }, []);

    const handleUpdateUserByIndex = useCallback(() => {
        const index = prompt('Enter row index to update:');
        if (index !== null) {
            const user = dataTableRef.current?.data.getRowByIndex(parseInt(index));
            if (user) {
                setEditUser(user);
                setDialogOpen(true);
            } else {
                alert('No user at that index');
            }
        }
    }, []);

    const handleBulkUpdateStatus = useCallback(() => {
        const selectionState = dataTableRef.current?.selection.getSelectionState();
        if (selectionState?.ids.length) {
            const newStatus = prompt('Enter new status for selected users (active/inactive/pending):') as User['status'];
            if (newStatus && [
                'active',
                'inactive',
                'pending',
            ].includes(newStatus)) {
                // Get the selected user IDs and update them
                const updates = selectionState.ids.map(id => ({
                    rowId: id,
                    data: { status: newStatus },
                }));
                dataTableRef.current?.data.updateMultipleRows(updates);
            }
        } else {
            alert('Please select users first');
        }
    }, []);

    // Insert Operations
    const handleAddNewUser = useCallback(() => {
        const name = prompt('Enter user name:');
        const email = prompt('Enter user email:');
        if (name && email) {
            const newUser: User = {
                id: Math.max(...data.map(u => u.id)) + 1,
                name,
                email,
                status: 'pending',
                role: 'user',
                created: new Date().toISOString().split('T')[0],
            };

            // Insert at the beginning
            dataTableRef.current?.data.insertRow(newUser, 0);
        }
    }, [data]);

    const handleInsertMultipleUsers = useCallback(() => {
        const count = prompt('How many test users to add?');
        if (count) {
            const numUsers = parseInt(count);
            const newUsers: User[] = [];
            const maxId = Math.max(...data.map(u => u.id));

            for (let i = 1; i <= numUsers; i++) {
                newUsers.push({
                    id: maxId + i,
                    name: `Test User ${i}`,
                    email: `test${i}@example.com`,
                    status: 'pending',
                    role: 'user',
                    created: new Date().toISOString().split('T')[0],
                });
            }

            dataTableRef.current?.data.insertMultipleRows(newUsers);
        }
    }, [data]);

    // Delete Operations
    const handleDeleteUser = useCallback(() => {
        const userId = prompt('Enter user ID to delete:');
        if (userId) {
            const user = dataTableRef.current?.data.getRowData(userId);
            if (user) {
                const confirmed = window.confirm(`Delete user "${user.name}"?`);
                if (confirmed) {
                    dataTableRef.current?.data.deleteRow(userId);
                }
            } else {
                alert('User not found');
            }
        }
    }, []);

    const handleDeleteSelected = useCallback(() => {
        const selectionState = dataTableRef.current?.selection.getSelectionState();
        if (selectionState?.ids.length) {
            const confirmed = window.confirm(`Delete ${selectionState.ids.length} selected users?`);
            if (confirmed) {
                dataTableRef.current?.data.deleteSelectedRows();
            }
        } else {
            alert('Please select users first');
        }
    }, []);

    const handleDeleteInactiveUsers = useCallback(() => {
        const inactiveUsers = data.filter(user => user.status === 'inactive');
        if (inactiveUsers.length > 0) {
            const confirmed = window.confirm(`Delete ${inactiveUsers.length} inactive users?`);
            if (confirmed) {
                const inactiveIds = inactiveUsers.map(user => String(user.id));
                dataTableRef.current?.data.deleteMultipleRows(inactiveIds);
            }
        } else {
            alert('No inactive users to delete');
        }
    }, [data]);

    // Dialog handlers
    const handleDialogSave = useCallback(() => {
        if (editUser.id !== undefined) {
            const index = data.findIndex(user => user.id === editUser.id);
            if (index !== -1) {
                dataTableRef.current?.data.updateRowByIndex(index, editUser);
            }
        }
        setDialogOpen(false);
        setEditUser({});
    }, [editUser, data]);

    // Simulate API operations
    const handleSimulateApiRefresh = useCallback(async () => {
        // Simulate API call
        console.log('Simulating API refresh...');

        // Add some random data changes
        const updatedData = data.map(user => ({
            ...user,
            lastLogin: user.status === 'active' ? new Date().toISOString().split('T')[0] : user.lastLogin,
        }));

        // Update data through ref API
        dataTableRef.current?.data.replaceAllData(updatedData);

        alert('Data refreshed from "API"');
    }, [data]);

    return (
        <Box sx={{ p: 3 }}>
            <Typography
                variant="h4"
                gutterBottom
            >
                DataTable CRUD API Example
            </Typography>

            <Typography
                variant="body1"
                sx={{ mb: 3 }}
            >
                This example demonstrates comprehensive CRUD operations using the DataTable ref API.
                Perfect for real-world scenarios with API integration.
            </Typography>

            {/* Control Buttons */}
            <Stack
                spacing={2}
                sx={{ mb: 3 }}
            >
                <Typography variant="h6">Data Retrieval</Typography>
                <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                >
                    <Button
                        variant="outlined"
                        onClick={handleGetAllData}
                    >
                        Get All Data
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleGetUserById}
                    >
                        Get User by ID
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleGetUserByIndex}
                    >
                        Get User by Index
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleFindActiveUsers}
                    >
                        Find Active Users
                    </Button>
                </Stack>

                <Typography variant="h6">Data Updates</Typography>
                <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                >
                    <Button
                        variant="outlined"
                        onClick={handleUpdateUserStatus}
                    >
                        Update User Status
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleUpdateUserByIndex}
                    >
                        Edit User by Index
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleBulkUpdateStatus}
                    >
                        Bulk Update Selected
                    </Button>
                </Stack>

                <Typography variant="h6">Data Insertion</Typography>
                <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                >
                    <Button
                        variant="outlined"
                        onClick={handleAddNewUser}
                    >
                        Add New User
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleInsertMultipleUsers}
                    >
                        Insert Multiple Users
                    </Button>
                </Stack>

                <Typography variant="h6">Data Deletion</Typography>
                <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                >
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={handleDeleteUser}
                    >
                        Delete User by ID
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={handleDeleteSelected}
                    >
                        Delete Selected
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={handleDeleteInactiveUsers}
                    >
                        Delete Inactive Users
                    </Button>
                </Stack>

                <Typography variant="h6">API Simulation</Typography>
                <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                >
                    <Button
                        variant="contained"
                        onClick={handleSimulateApiRefresh}
                    >
                        Simulate API Refresh
                    </Button>
                </Stack>
            </Stack>

            {/* Stats */}
            <Box
                sx={{
                    mb: 2,
                    p: 2,
                    bgcolor: 'grey.100',
                    borderRadius: 1,
                }}
            >
                <Typography variant="body2">
                    Total Users:
                    {' '}
                    {data.length}
                    {' '}
                    |
                    Active:
                    {' '}
                    {data.filter(u => u.status === 'active').length}
                    {' '}
                    |
                    Inactive:
                    {' '}
                    {data.filter(u => u.status === 'inactive').length}
                    {' '}
                    |
                    Pending:
                    {' '}
                    {data.filter(u => u.status === 'pending').length}
                </Typography>
            </Box>

            {/* DataTable with CRUD capabilities */}
            <DataTable
                ref={dataTableRef}
                columns={columns}
                data={data}
                onDataChange={handleDataChange}
                enableRowSelection
                enableColumnResizing
                draggable
                enableColumnPinning
                enableSorting
                enableGlobalFilter
                enableColumnFilter
                enablePagination
            />

            {/* Edit User Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Edit User</DialogTitle>
                <DialogContent>
                    <Stack
                        spacing={2}
                        sx={{ mt: 1 }}
                    >
                        <TextField
                            label="Name"
                            value={editUser.name || ''}
                            onChange={(e) => setEditUser(prev => ({
                                ...prev,
                                name: e.target.value,
                            }))}
                            fullWidth
                        />
                        <TextField
                            label="Email"
                            value={editUser.email || ''}
                            onChange={(e) => setEditUser(prev => ({
                                ...prev,
                                email: e.target.value,
                            }))}
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={editUser.status || ''}
                                onChange={(e) => setEditUser(prev => ({
                                    ...prev,
                                    status: e.target.value as User['status'],
                                }))}
                            >
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="inactive">Inactive</MenuItem>
                                <MenuItem value="pending">Pending</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select
                                value={editUser.role || ''}
                                onChange={(e) => setEditUser(prev => ({
                                    ...prev,
                                    role: e.target.value as User['role'],
                                }))}
                            >
                                <MenuItem value="admin">Admin</MenuItem>
                                <MenuItem value="manager">Manager</MenuItem>
                                <MenuItem value="user">User</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleDialogSave}
                        variant="contained"
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
