import type { Theme, Components } from '@mui/material/styles';


const MuiCard: Components<Theme>['MuiCard'] = {
    styleOverrides: {
        root: ({ theme }) => ({
            position: 'relative',
            boxShadow: theme.customShadows.card,
            borderRadius: (Number(theme.shape.borderRadius) || 1) * 2,
            zIndex: 0,
        }),
    },
};

const MuiCardHeader: Components<Theme>['MuiCardHeader'] = {
    defaultProps: {
        titleTypographyProps: { variant: 'h6' },
        subheaderTypographyProps: {
            variant: 'body2',
            marginTop: '4px',
        },
    },
    styleOverrides: {
        root: ({ theme }) => ({
            padding: theme.spacing(3, 3, 1),
            [theme.breakpoints.down('md')]: {
                padding: theme.spacing(2, 2, 0.5),
            },
        }),
    },
};

const MuiCardContent: Components<Theme>['MuiCardContent'] = {
    styleOverrides: {
        root: ({ theme }) => ({
            padding: theme.spacing(3),
            [theme.breakpoints.down('md')]: {
                padding: theme.spacing(2),
            },
        }),
    },
};

const MuiCardActions: Components<Theme>['MuiCardActions'] = {
    styleOverrides: {
        root: ({ theme }) => ({
            padding: theme.spacing(3),
            [theme.breakpoints.down('md')]: {
                padding: theme.spacing(2),
            },
        }),
    },
};


export const card = {
    MuiCard,
    MuiCardHeader,
    MuiCardContent,
    MuiCardActions,
};
