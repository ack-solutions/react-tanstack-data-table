import {
    IconButton,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Stack,
    Tooltip,
    Button,
} from '@mui/material';
import { useMemo } from 'react';
import { Visibility as VisibilityIcon, Edit as EditIcon, Delete as DeleteIcon, RotateLeft as RotateLeftIcon, DeleteForever as DeleteForeverIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';

import { TableAction } from './table-action-menu';
import { MenuDropdown } from '@ackplus/react-tanstack-data-table';


type TableBulkActionMenuProps = {
    onDelete?: (row?: any[]) => void;
    onDeleteForever?: (row?: any[]) => void;
    onRestore?: (row?: any[]) => void;
    onEdit?: (row?: any[]) => void;
    onView?: (row?: any[]) => void;
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

export function TableBulkActionMenu({

    children,
    permissionsKeys,
    onView,
    onEdit,
    onDelete,
    onDeleteForever,
    onRestore,
    actions,
}: TableBulkActionMenuProps) {

    const canDelete = permissionsKeys?.delete ? true : true;
    const canDeleteForever = permissionsKeys?.deleteForever ? true : true;
    const canRestore = permissionsKeys?.restore ? true : true;
    const canEdit = permissionsKeys?.edit ? true : true;
    const canView = permissionsKeys?.view ? true : true;

    const crudActions: TableAction[] = useMemo(() => {
        return [
            ...(actions || []),
            ...(canView && onView ?
                [
                    {
                        icon: <VisibilityIcon />,
                        title: 'View',
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
                        title: 'Permanent delete',
                        onClick: onDeleteForever,
                    },
                ] :
                []),
        ].filter(Boolean);
    }, [
        actions,
        canDelete,
        canDeleteForever,
        canEdit,
        canRestore,
        canView,
        onDelete,
        onDeleteForever,
        onEdit,
        onRestore,
        onView,
    ]);

    if (crudActions.length <= 2) {
        return (
            <Stack
                spacing={0.5}
                direction="row"
                alignItems="center"
            >
                {crudActions.map((action) => (
                    <Tooltip
                        key={action?.title}
                        title={action?.title}
                    >
                        <Button
                            onClick={(event) => {
                                event.stopPropagation();
                                if (action.onClick) {
                                    action.onClick(event);
                                }
                            }}
                            sx={{
                                whiteSpace: 'nowrap',
                            }}
                            startIcon={action?.icon}
                        >
                            {action?.title}
                        </Button>
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
