import type { CSSObject } from '@mui/material';

import { remToPx, mediaQueries } from './utils';


/**
 * Usage:
 * ...hideScrollX,
 * ...hideScrollY,
 */
export const hideScrollX: CSSObject = {
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
    overflowX: 'auto',
    '&::-webkit-scrollbar': { display: 'none' },
};

export const hideScrollY: CSSObject = {
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
    overflowY: 'auto',
    '&::-webkit-scrollbar': { display: 'none' },
};

/**
 * Usage:
 * ...textGradient(`to right, ${theme.vars.palette.text.primary}, ${alpha(theme.vars.palette.text.primary, 0.2)}`
 */
export function textGradient(color: string): CSSObject {
    return {
        background: `linear-gradient(${color})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        textFillColor: 'transparent',
        color: 'transparent',
    };
}

/**
 * Usage:
 * ...borderGradient({ color: `to right, ${theme.vars.palette.text.primary}, ${alpha(theme.vars.palette.text.primary, 0.2)}`, padding: '4px' }),
 */
export type BorderGradientProps = {
    color?: string;
    padding?: string;
};

export function borderGradient(props?: BorderGradientProps): CSSObject {
    return {
        inset: 0,
        width: '100%',
        content: '""',
        height: '100%',
        margin: 'auto',
        position: 'absolute',
        borderRadius: 'inherit',
        padding: props?.padding ?? '2px',
        //
        mask: 'linear-gradient(#FFF 0 0) content-box, linear-gradient(#FFF 0 0)',
        WebkitMask:
            'linear-gradient(#FFF 0 0) content-box, linear-gradient(#FFF 0 0)',
        maskComposite: 'exclude',
        WebkitMaskComposite: 'xor',
        ...(props?.color && {
            background: `linear-gradient(${props.color})`,
        }),
    };
}

/**
 * Usage:
 * ...bgGradient({ color: `to right, ${theme.vars.palette.grey[900]} 25%, ${varAlpha(theme.vars.palette.primary.darkerChannel, 0.88)}`, imgUrl: '/assets/background/overlay.png' }),
 */
export type BgGradientProps = {
    color: string;
    imgUrl?: string;
};

export function bgGradient({ color, imgUrl }: BgGradientProps): CSSObject {
    if (imgUrl) {
        return {
            background: `linear-gradient(${color}), url(${imgUrl})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center center',
        };
    }
    return { background: `linear-gradient(${color})` };
}

/**
 * Usage:
 * ...bgBlur({ color: `varAlpha(theme.vars.palette.background.paperChannel, 0.8)`, imgUrl: '/assets/background/overlay.png', blur: 6 }),
 */
export type BgBlurProps = {
    color: string;
    blur?: number;
    imgUrl?: string;
};

export function bgBlur({ color, blur = 6, imgUrl }: BgBlurProps): CSSObject {
    if (imgUrl) {
        return {
            position: 'relative',
            backgroundImage: `url(${imgUrl})`,
            '&::before': {
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 9,
                content: '""',
                width: '100%',
                height: '100%',
                backdropFilter: `blur(${blur}px)`,
                WebkitBackdropFilter: `blur(${blur}px)`,
                backgroundColor: color,
            },
        };
    }
    return {
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        backgroundColor: color,
    };
}

/**
 * Usage:
 * ...maxLine({ line: 2, persistent: theme.typography.caption }),
 */
export type MediaFontSize = {
    [key: string]: {
        fontSize: React.CSSProperties['fontSize'];
    };
};

export type MaxLineProps = {
    line: number;
    persistent?: Partial<React.CSSProperties>;
};

function getFontSize(fontSize: React.CSSProperties['fontSize']) {
    return typeof fontSize === 'string' ? remToPx(fontSize) : fontSize;
}

function getLineHeight(
    lineHeight: React.CSSProperties['lineHeight'],
    fontSize?: number,
) {
    if (typeof lineHeight === 'string') {
        return fontSize ? remToPx(lineHeight) / fontSize : 1;
    }
    return lineHeight;
}

export function maxLine({ line, persistent }: MaxLineProps): CSSObject {
    const baseStyles: CSSObject = {
        overflow: 'hidden',
        display: '-webkit-box',
        textOverflow: 'ellipsis',
        WebkitLineClamp: line,
        WebkitBoxOrient: 'vertical',
    };

    if (persistent) {
        const fontSizeBase = getFontSize(persistent.fontSize);
        const fontSizeSm = getFontSize(
            (persistent as MediaFontSize)[mediaQueries.upSm]?.fontSize,
        );
        const fontSizeMd = getFontSize(
            (persistent as MediaFontSize)[mediaQueries.upMd]?.fontSize,
        );
        const fontSizeLg = getFontSize(
            (persistent as MediaFontSize)[mediaQueries.upLg]?.fontSize,
        );

        const lineHeight = getLineHeight(persistent.lineHeight, fontSizeBase);

        return {
            ...baseStyles,
            ...(lineHeight && {
                ...(fontSizeBase && {
                    height: fontSizeBase * lineHeight * line,
                }),
                ...(fontSizeSm && {
                    [mediaQueries.upSm]: {
                        height: fontSizeSm * lineHeight * line,
                    },
                }),
                ...(fontSizeMd && {
                    [mediaQueries.upMd]: {
                        height: fontSizeMd * lineHeight * line,
                    },
                }),
                ...(fontSizeLg && {
                    [mediaQueries.upLg]: {
                        height: fontSizeLg * lineHeight * line,
                    },
                }),
            }),
        };
    }

    return baseStyles;
}
