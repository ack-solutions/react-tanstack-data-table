import {
    IconButton,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Stack,
    Tooltip,
} from '@mui/material';
import { ReactNode, useMemo } from 'react';

import { MenuDropdown } from '@ackplus/react-tanstack-data-table';
import { Visibility as VisibilityIcon, Edit as EditIcon, Delete as DeleteIcon, RotateLeft as RotateLeftIcon, DeleteForever as DeleteForeverIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';

export interface TableAction {
    icon?: ReactNode;
    title: string;
    onClick?: (event?: any) => void;
}

export type TableActionMenuProps = {
    onDelete?: (row?: any) => void;
    onEdit?: (row?: any) => void;
    onView?: (row?: any) => void;
    onRestore?: (row?: any) => void;
    onDeleteForever?: (row?: any) => void;
    row?: any;
    actions?: TableAction[];
    children?: any;
    permissionsKeys?: {
        delete?: string;
        deleteForever?: string;
        restore?: string;
        edit?: string;
        view?: string;
    };
};

export function TableActionMenu({
    children,
    onDelete,
    onEdit,
    onView,
    onRestore,
    onDeleteForever,
    permissionsKeys,
    actions,
}: TableActionMenuProps) {

    const canDelete = permissionsKeys?.delete
        ? true
        : true;
    const canDeleteForever = permissionsKeys?.deleteForever
        ? true
        : true;
    const canRestore = permissionsKeys?.restore
        ? true
        : true;
    const canEdit = permissionsKeys?.edit
        ? true
        : true;
    const canView = permissionsKeys?.view
        ? true
        : true;
    const crudActions: TableAction[] = useMemo(() => {
        return [
            ...(actions || []),
            ...(canView && onView ?
                [
                    {
                        icon: <VisibilityIcon />,
                        title: 'Preview',
                        onClick: onView,
                    },
                ] :
                []),
            ...(canEdit && onEdit ?
                [
                    {
                        icon: <EditIcon />,
                        title: 'Edit',
                        onClick: onEdit,
                    },
                ] :
                []),
            ...(canDelete && onDelete ?
                [
                    {
                        icon: <DeleteIcon />,
                        title: 'Delete',
                        onClick: onDelete,
                    },
                ] :
                []),
            ...(canRestore && onRestore ?
                [
                    {
                        icon: <RotateLeftIcon />,
                        title: 'Restore',
                        onClick: onRestore,
                    },
                ] :
                []),
            ...(canDeleteForever && onDeleteForever ?
                [
                    {
                        icon: <DeleteForeverIcon />,
                        title: 'Delete Forever',
                        onClick: onDeleteForever,
                    },
                ] :
                []),
        ].filter((item) => item);
    }, [actions, canView, onView, canEdit, onEdit, canDelete, onDelete, canRestore, onRestore, canDeleteForever, onDeleteForever]);

    if (crudActions.length <= 2) {
        return (
            <Stack
                spacing={0.5}
                direction="row"
            >
                {crudActions.map((action,) => (
                    <Tooltip
                        key={action?.title}
                        title={action?.title}
                    >
                        <IconButton
                            onClick={(event) => {
                                event.stopPropagation();
                                if (action.onClick) {
                                    action.onClick(event);
                                }
                            }}
                        >
                            {action?.icon}
                        </IconButton>
                    </Tooltip>
                ))}
            </Stack>
        );
    }

    return (
        <MenuDropdown
            anchor={(
                <IconButton>
                    <MoreVertIcon />
                </IconButton>
            )}
        >
            {({ handleClose }) => (
                <>
                    {crudActions.map((action) => (
                        <MenuItem
                            key={action?.title}
                            onClick={(event) => {
                                event.stopPropagation();
                                if (action.onClick) {
                                    action.onClick(event);
                                }
                                handleClose();
                            }}
                        >
                            {action?.icon ? (
                                <ListItemIcon sx={{ mr: 0 }}>
                                    {action?.icon}
                                </ListItemIcon>
                            ) : null}
                            <ListItemText
                                primary={action?.title}
                                slotProps={{
                                    primary: {
                                        variant: 'body2',
                                    },
                                }}
                            />
                        </MenuItem>
                    ))}
                    {children}
                </>
            )}
        </MenuDropdown>
    );
}
