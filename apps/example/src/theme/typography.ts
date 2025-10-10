import { pxToRem } from './styles';


export function responsiveFontSizes({
    sm,
    md,
    lg,
}: {
    sm?: number;
    md?: number;
    lg?: number;
}) {
    return {
        ...(sm ?
            {
                '@media (min-width:600px)': {
                    fontSize: sm,
                },
            } :
            {}),
        ...(md ?
            {
                '@media (min-width:900px)': {
                    fontSize: md,
                },
            } :
            {}),
        ...(lg ?
            {
                '@media (min-width:1200px)': {
                    fontSize: lg,
                },
            } :
            {}),
    };
}

declare module '@mui/material' {
    interface TypographyVariants {
        fontWeightSemiBold: React.CSSProperties['fontWeight'];
    }
}

const secondaryFont = 'Barlow';

export const typography = {
    fontFamily: 'Public Sans',
    fontSecondaryFamily: secondaryFont,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightSemiBold: 600,
    fontWeightBold: 700,
    h1: {
        fontWeight: 800,
        lineHeight: 80 / 64,
        fontSize: pxToRem(40),
        // fontFamily: secondaryFont,
        ...responsiveFontSizes({
            sm: 36,
            md: 42,
            lg: 48,
        }),
    },
    h2: {
        fontWeight: 800,
        lineHeight: 64 / 48,
        fontSize: pxToRem(32),
        // fontFamily: secondaryFont,
        ...responsiveFontSizes({
            sm: 32,
            md: 36,
            lg: 40,
        }),
    },
    h3: {
        fontWeight: 700,
        lineHeight: 1.5,
        fontSize: pxToRem(24),
        // fontFamily: secondaryFont,
        ...responsiveFontSizes({
            sm: 26,
            md: 30,
            lg: 32,
        }),
    },
    h4: {
        fontWeight: 700,
        lineHeight: 1.5,
        fontSize: pxToRem(20),
        ...responsiveFontSizes({
            sm: 20,
            md: 24,
            lg: 24,
        }),
    },
    h5: {
        fontWeight: 700,
        lineHeight: 1.5,
        fontSize: pxToRem(18),
        ...responsiveFontSizes({
            sm: 19,
            md: 20,
            lg: 20,
        }),
    },
    h6: {
        fontWeight: 600,
        lineHeight: 28 / 18,
        fontSize: pxToRem(17),
        ...responsiveFontSizes({
            sm: 18,
            md: 18,
            lg: 18,
        }),
    },
    subtitle1: {
        fontWeight: 600,
        lineHeight: 1.5,
        fontSize: pxToRem(16),
    },
    subtitle2: {
        fontWeight: 600,
        lineHeight: 22 / 14,
        fontSize: pxToRem(14),
    },
    body1: {
        lineHeight: 1.5,
        fontSize: pxToRem(16),
    },
    body2: {
        lineHeight: 22 / 14,
        fontSize: pxToRem(14),
    },
    caption: {
        lineHeight: 1.5,
        fontSize: pxToRem(12),
    },
    overline: {
        fontWeight: 700,
        lineHeight: 1.5,
        fontSize: pxToRem(12),
        textTransform: 'uppercase',
    },
    button: {
        fontWeight: 700,
        lineHeight: 24 / 14,
        fontSize: pxToRem(14),
        textTransform: 'unset',
    },
} as const;
