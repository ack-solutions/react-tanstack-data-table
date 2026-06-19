/**
 * Resolves the grid's height / scroll model into root + scroller inline styles.
 *
 * Three standard modes (matching MUI X DataGrid / AG Grid):
 *
 *  - **Auto height** (default) — no height bound: the grid grows to its content
 *    and there is no inner scroll.
 *  - **Capped** (`maxHeight`) — the scroll viewport caps at `maxHeight`; beyond
 *    it the body scrolls.
 *  - **Fixed / fill** (`height`) — the grid is exactly `height` (use `'100%'` to
 *    fill a flex or positioned parent); the body flexes to fill and scrolls.
 *
 * In every bounded mode the header stays pinned to the top and the footer
 * (pagination) to the bottom while the body scrolls between them. That pinning
 * is structural — the footer lives outside the scroll viewport and the root is a
 * flex column whose scroller is the only growing/shrinking child — so it needs no
 * per-element sticky handling here.
 */
import type { CSSProperties } from 'react';

export interface ScrollLayoutInput {
    stickyHeader?: boolean;
    stickyFooter?: boolean;
    enableVirtualization?: boolean;
    /** Fixed grid height; `'100%'` fills a flex/positioned parent. */
    height?: string | number;
    /** Optional floor so a near-empty grid does not collapse. */
    minHeight?: string | number;
    /** Cap the scroll viewport; beyond it the body scrolls. */
    maxHeight?: string | number;
}

export interface ScrollLayout {
    /** True when the grid is height-bounded and the body becomes a scroll viewport. */
    scrollable: boolean;
    /** Inline style for `GridRoot` (`height` / `minHeight`), or `undefined`. */
    rootStyle?: CSSProperties;
    /** Inline style for `GridScroller` (`maxHeight`), or `undefined`. */
    scrollerStyle?: CSSProperties;
}

/** Back-compat cap applied when sticky/virtualization is requested without an explicit bound. */
export const DEFAULT_MAX_HEIGHT = 480;

const isSet = (v: string | number | undefined | null): v is string | number =>
    v !== undefined && v !== null && v !== '';

export function resolveScrollLayout(input: ScrollLayoutInput): ScrollLayout {
    const { stickyHeader, stickyFooter, enableVirtualization, height, minHeight, maxHeight } = input;
    const hasHeight = isSet(height);
    const hasMax = isSet(maxHeight);
    const hasMin = isSet(minHeight);

    // Any of these turn the body into a scroll viewport (header pinned to the top,
    // footer pinned to the bottom). `minHeight` alone is only a floor — it does not
    // create a scroll viewport — so it is deliberately excluded here.
    const scrollable = !!(stickyHeader || stickyFooter || enableVirtualization || hasHeight || hasMax);

    const rootStyle: CSSProperties = {};
    if (hasHeight) rootStyle.height = height;
    if (hasMin) rootStyle.minHeight = minHeight;

    const scrollerStyle: CSSProperties = {};
    // With a fixed `height` the scroller fills the remaining space via flex; a
    // `maxHeight` would fight that, so it is ignored. Otherwise cap the scroller.
    if (!hasHeight) {
        if (hasMax) scrollerStyle.maxHeight = maxHeight;
        else if (scrollable) scrollerStyle.maxHeight = DEFAULT_MAX_HEIGHT;
    }

    return {
        scrollable,
        rootStyle: Object.keys(rootStyle).length ? rootStyle : undefined,
        scrollerStyle: Object.keys(scrollerStyle).length ? scrollerStyle : undefined,
    };
}
