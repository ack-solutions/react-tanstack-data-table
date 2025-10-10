import type { Theme, Components } from '@mui/material/styles';


const MuiSelect: Components<Theme>['MuiSelect'] = {
    defaultProps: {
        MenuProps: {
            PaperProps: {
                sx: (theme) => ({
                    maxHeight: 250,
                    transform: 'translateY(4px)',
                    boxShadow: theme.customShadows.card,
                }),
            },
        },
    },
};

export const select = {
    MuiSelect,
};
