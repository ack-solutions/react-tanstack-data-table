import type { Theme, Components } from '@mui/material/styles';


const MuiIconButton: Components<Theme>['MuiIconButton'] = {
    styleOverrides: {
        root: {
            boxShadow: 'none',
        },
    },
};

export const iconButton = {
    MuiIconButton,
};
