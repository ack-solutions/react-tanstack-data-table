import { Chip } from '@mui/material';
import type { ColumnDef } from '@tanstack/react-table';

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    status: 'active' | 'invited';
}

export const users: User[] = [
    { id: 1, name: 'Liam Smith', email: 'liam@example.com', role: 'Admin', status: 'active' },
    { id: 2, name: 'Olivia Chen', email: 'olivia@example.com', role: 'Editor', status: 'active' },
    { id: 3, name: 'Noah Patel', email: 'noah@example.com', role: 'Viewer', status: 'invited' },
    { id: 4, name: 'Emma Rossi', email: 'emma@example.com', role: 'Editor', status: 'active' },
    { id: 5, name: 'Aarav Khan', email: 'aarav@example.com', role: 'Admin', status: 'invited' },
    { id: 6, name: 'Mia Garcia', email: 'mia@example.com', role: 'Viewer', status: 'active' },
    { id: 7, name: 'Lucas Muller', email: 'lucas@example.com', role: 'Editor', status: 'active' },
    { id: 8, name: 'Zoe Brown', email: 'zoe@example.com', role: 'Viewer', status: 'invited' },
];

export const columns: ColumnDef<User, any>[] = [
    { id: 'name', header: 'Name', accessorKey: 'name', size: 170 },
    { id: 'email', header: 'Email', accessorKey: 'email', size: 220 },
    { id: 'role', header: 'Role', accessorKey: 'role', size: 130 },
    {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
        size: 130,
        type: 'select',
        options: [
            { label: 'Active', value: 'active' },
            { label: 'Invited', value: 'invited' },
        ],
        cell: (ctx) => {
            const v = ctx.getValue() as User['status'];
            return <Chip size="small" label={v} color={v === 'active' ? 'success' : 'default'} variant={v === 'active' ? 'filled' : 'outlined'} />;
        },
    } as ColumnDef<User, any>,
    { id: 'actions', header: 'Actions', size: 100, enableSorting: false, enableResizing: false, cell: () => <Chip size="small" label="View" variant="outlined" clickable /> },
];

const ROLES = ['Admin', 'Editor', 'Viewer'];
export function makeUsers(count: number): User[] {
    return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        name: `${users[i % users.length].name.split(' ')[0]} ${String.fromCharCode(65 + (i % 26))}.`,
        email: `user${i + 1}@example.com`,
        role: ROLES[i % ROLES.length],
        status: i % 3 === 0 ? 'invited' : 'active',
    }));
}
