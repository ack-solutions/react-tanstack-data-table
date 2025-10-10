import { type Theme, type Components, alpha } from '@mui/material';
import { tableCellClasses } from '@mui/material/TableCell';
import { tableRowClasses } from '@mui/material/TableRow';


const MuiTableContainer: Components<Theme>['MuiTableContainer'] = {
    styleOverrides: {
        root: ({ theme }) => ({
            position: 'relative',
            scrollbarWidth: 'thin',
            scrollbarColor: `${alpha(theme.palette.text.disabled, 0.4)} ${alpha(
                theme.palette.text.disabled,
                0.08,
            )}`,
        }),
    },
};


const MuiTable: Components<Theme>['MuiTable'] = {
    styleOverrides: {
        root: ({ theme }) => ({
            '--palette-TableCell-border': theme.palette.divider,
        }),
    },
};


const MuiTableRow: Components<Theme>['MuiTableRow'] = {
    styleOverrides: {
        root: ({ theme }) => ({
            [`&.${tableRowClasses.selected}`]: {
                backgroundColor: alpha(theme.palette.primary.dark, 0.04),
                '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.dark, 0.08),
                },
            },
            '&:last-of-type': {
                [`& .${tableCellClasses.root}`]: { borderColor: 'transparent' },
            },
        }),
    },
};


const MuiTableCell: Components<Theme>['MuiTableCell'] = {

    styleOverrides: {
        root: { borderBottomStyle: 'dashed' },
        head: ({ theme }) => ({
            fontSize: 14,
            color: theme.palette.text.secondary,
            fontWeight: theme.typography.fontWeightSemiBold,
            backgroundColor: theme.palette.background.neutral,
        }),
        stickyHeader: ({ theme }) => ({
            backgroundColor: theme.palette.background.paper,
            backgroundImage: `linear-gradient(to bottom, ${theme.palette.background.neutral} 0%, ${theme.palette.background.neutral} 100%)`,
        }),
        paddingCheckbox: ({ theme }) => ({ paddingLeft: theme.spacing(1) }),
    },
};


const MuiTablePagination: Components<Theme>['MuiTablePagination'] = {

    defaultProps: {
        backIconButtonProps: { size: 'small' },
        nextIconButtonProps: { size: 'small' },
    },

    styleOverrides: {
        root: ({ theme }) => ({
            width: '100%',
            [theme.breakpoints.down('sm')]: {
                '& .MuiTablePagination-input': {
                    marginRight: 8,
                },
            },
        }),
        toolbar: { height: 64 },
        actions: ({ theme }) => ({
            marginRight: 8,
            [theme.breakpoints.down('md')]: {
                marginLeft: 16,
            },
        }),
        select: ({ theme }) => ({
            paddingLeft: 8,
            '&:focus': { borderRadius: theme.shape.borderRadius },
        }),
        selectIcon: {
            right: 4,
            width: 16,
            height: 16,
            top: 'calc(50% - 8px)',
        },
    },
};

export const table = {
    MuiTable,
    MuiTableRow,
    MuiTableCell,
    MuiTableContainer,
    MuiTablePagination,
};
