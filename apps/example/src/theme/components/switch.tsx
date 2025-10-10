import { type Theme, type Components, alpha } from '@mui/material/styles';
import { switchClasses } from '@mui/material/Switch';

import { stylesMode } from '../styles';


const MuiSwitch: Components<Theme>['MuiSwitch'] = {

    styleOverrides: {
        root: { alignItems: 'center' },
        switchBase: ({ ownerState, theme }) => ({
            top: 'unset',
            transform: 'translateX(6px)',
            [`&.${switchClasses.checked}`]: {
                [`& .${switchClasses.thumb}`]: {
                    ...(ownerState.color === 'default' && {
                        [stylesMode.dark]: { color: theme.palette.grey[800] },
                    }),
                },
                [`&+.${switchClasses.track}`]: {
                    opacity: 1,
                    ...(ownerState.color === 'default' && {
                        backgroundColor: theme.palette.text.primary,
                    }),
                },
            },
            [`&.${switchClasses.disabled}`]: {
                [`& .${switchClasses.thumb}`]: {
                    opacity: 1,
                    [stylesMode.dark]: { opacity: 0.48 },
                },
                [`&+.${switchClasses.track}`]: { opacity: 0.48 },
            },
        }),
        track: ({ theme }) => ({
            opacity: 1,
            borderRadius: 10,
            backgroundColor: alpha(theme.palette.grey[500], 0.48),
        }),
        thumb: ({ theme }) => ({ color: theme.palette.common.white }),
        sizeMedium: {
            [`& .${switchClasses.track}`]: { height: 20 },
            [`& .${switchClasses.thumb}`]: {
                width: 14,
                height: 14,
            },
        },
        sizeSmall: {
            [`& .${switchClasses.track}`]: { height: 16 },
            [`& .${switchClasses.thumb}`]: {
                width: 10,
                height: 10,
            },
        },
    },
};

export const switches = { MuiSwitch };
