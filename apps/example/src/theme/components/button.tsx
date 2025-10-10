import { svgIconClasses } from '@mui/material';
import type { Theme, Components } from '@mui/material/styles';


const MuiButton: Components<Theme>['MuiButton'] = {
    styleOverrides: {
        root: {
            // [`& .${buttonClasses.icon} .icon`]: {
            //     fontSize: 'inherit',
            //     height: 'auto',
            //     width: 'auto',
            //     display: 'block',
            // },
        },
        sizeSmall: {
            [`& .${svgIconClasses.root}`]: {
                height: 12,
                width: 12,
            },
        },
        sizeLarge: {
            [`& .${svgIconClasses.root}`]: {
                height: 18,
                width: 18,
            },
        },

    },
};

export const button = {
    MuiButton,
};
