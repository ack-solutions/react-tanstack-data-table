import { alpha } from '@mui/material';

import {
    GREY,
    INFO,
    ERROR,
    COMMON,
    PRIMARY,
    SUCCESS,
    WARNING,
    SECONDARY,
} from './palette';


export interface CustomShadows {
    z1?: string;
    z4?: string;
    z8?: string;
    z12?: string;
    z16?: string;
    z20?: string;
    z24?: string;
    primary?: string;
    secondary?: string;
    info?: string;
    success?: string;
    warning?: string;
    error?: string;
    card?: string;
    dialog?: string;
    dropdown?: string;
}

declare module '@mui/material' {
    interface Theme {
        customShadows: CustomShadows;
    }

    interface ThemeOptions {
        customShadows?: CustomShadows;
    }

    interface ThemeVars {
        customShadows: CustomShadows;
    }
}

export function createShadowColor(color: string) {
    return `0 8px 16px 0 ${alpha(color, 0.24)}`;
}

export function customShadows(colorTheme: 'light' | 'dark') {
    const color = colorTheme === 'light' ? GREY['500'] : COMMON.common.black;

    return {
        z1: `0 1px 2px 0 ${alpha(color, 0.16)}`,
        z4: `0 4px 8px 0 ${alpha(color, 0.16)}`,
        z8: `0 8px 16px 0 ${alpha(color, 0.16)}`,
        z12: `0 12px 24px -4px ${alpha(color, 0.16)}`,
        z16: `0 16px 32px -4px ${alpha(color, 0.16)}`,
        z20: `0 20px 40px -4px ${alpha(color, 0.16)}`,
        z24: `0 24px 48px 0 ${alpha(color, 0.16)}`,
        dialog: `-40px 40px 80px -8px ${alpha(COMMON.common.black, 0.24)}`,
        card: `0 0 2px 0 ${alpha(color, 0.2)}, 0 12px 24px -4px ${alpha(
            color,
            0.12,
        )}`,
        dropdown: `0 0 2px 0 ${alpha(
            color,
            0.24,
        )}, -20px 20px 40px -4px ${alpha(color, 0.24)}`,
        primary: createShadowColor(PRIMARY.main),
        secondary: createShadowColor(SECONDARY.main),
        info: createShadowColor(INFO.main),
        success: createShadowColor(SUCCESS.main),
        warning: createShadowColor(WARNING.main),
        error: createShadowColor(ERROR.main),
    };
}
