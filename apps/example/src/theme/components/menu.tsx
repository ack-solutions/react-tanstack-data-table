import { autocompleteClasses } from '@mui/material/Autocomplete';
import { checkboxClasses } from '@mui/material/Checkbox';
import { dividerClasses } from '@mui/material/Divider';
import { menuItemClasses } from '@mui/material/MenuItem';
import type { Theme, Components } from '@mui/material/styles';


const MuiMenuItem: Components<Theme>['MuiMenuItem'] = {
    styleOverrides: {
        root: ({ theme }) => ({
            ...theme.typography.body2,
            padding: theme.spacing(0.75, 1),
            borderRadius: (Number(theme.shape.borderRadius) || 1) * 0.75,
            '&:not(:last-of-type)': { marginBottom: 4 },
            [`&.${menuItemClasses.selected}`]: {
                fontWeight: theme.typography.fontWeightSemiBold,
                backgroundColor: theme.palette.action.selected,
                '&:hover': { backgroundColor: theme.palette.action.hover },
            },
            [`& .${checkboxClasses.root}`]: {
                padding: theme.spacing(0.5),
                marginLeft: theme.spacing(-0.5),
                marginRight: theme.spacing(0.5),
            },
            [`&.${autocompleteClasses.option}[aria-selected="true"]`]: {
                backgroundColor: theme.palette.action.selected,
                '&:hover': { backgroundColor: theme.palette.action.hover },
            },
            [`&+.${dividerClasses.root}`]: { margin: theme.spacing(0.5, 0) },

        }),
    },
};

export const menu = { MuiMenuItem };
