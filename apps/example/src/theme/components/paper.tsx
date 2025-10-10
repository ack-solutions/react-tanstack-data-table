import { type Theme, type Components, alpha } from '@mui/material/styles';


const MuiPaper: Components<Theme>['MuiPaper'] = {
    defaultProps: { elevation: 0 },
    styleOverrides: {
        root: { backgroundImage: 'none' },
        outlined: ({ theme }) => ({
            borderColor: alpha(theme.palette.grey[500], 0.16),
        }),
    },
};


export const paper = { MuiPaper };
