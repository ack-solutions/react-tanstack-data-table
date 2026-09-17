/**
 * Slot wiring helpers. Every structural part follows one canonical order:
 *
 *   const Part = slots?.key ?? GridPart;              // swap (resolved at component body)
 *   const s = resolveSlotProps(slotProps, 'key');     // once, never inside render loops
 *   <Part {...s.rest} {...requiredBehaviorProps}      // behavior props AFTER rest → can't be clobbered
 *         className={joinClassNames(internal, s.className)}
 *         style={{ ...internalStyle, ...s.style }}    // slot wins per-property
 *         sx={mergeSx(internalSx, s.sx)} />           // slot wins
 *
 * Leaf controls (pagination, toolbar buttons) invert — slotProps spread LAST — because
 * deliberate prop overrides are the point there (MUI convention).
 */
import type { SxProps, Theme } from '@mui/material/styles';
import type { CSSProperties } from 'react';

import type { DataTableSlotProps } from '../../types/slots.types';

export interface ResolvedSlotProps {
    sx?: SxProps<Theme>;
    className?: string;
    style?: CSSProperties;
    rest: Record<string, any>;
}

// Frozen shared empty result → per-cell/per-row spreads cost ~nothing when unset.
const EMPTY: ResolvedSlotProps = Object.freeze({ rest: Object.freeze({}) as Record<string, any> });

/**
 * Split a slotProps entry into merge-managed channels (sx/className/style) + a raw rest bag.
 * `key`/`ref` are dropped from `rest`: the same slotProps object is spread across every
 * row/cell, so a shared `key` would collide (React duplicate-key) and a shared `ref` would
 * bind to only the last node. Swap the whole part via `slots.<key>` to own its key/ref.
 */
export function resolveSlotProps(slotProps: DataTableSlotProps | undefined, key: keyof DataTableSlotProps): ResolvedSlotProps {
    const p = slotProps?.[key] as Record<string, any> | undefined;
    if (!p) return EMPTY;
    const { sx, className, style, key: _key, ref: _ref, ...rest } = p;
    return { sx, className, style, rest };
}

const DOM_ATTRS = new Set(['id', 'role', 'title', 'tabIndex', 'dir', 'lang', 'hidden', 'translate']);

/**
 * Keep only props that are safe on a plain DOM element: `data-*` / `aria-*`, a few global
 * attributes, and `on*` handlers. For containers whose slotProps are often fed config-style
 * keys (e.g. a legacy `refreshButtonProps: {…}` or `showRefresh: true` under `toolbar`),
 * which React would otherwise warn about and write to the DOM.
 */
export function pickDomProps(rest: Record<string, any>): Record<string, any> {
    const out: Record<string, any> = {};
    for (const k of Object.keys(rest)) {
        const v = rest[k];
        if (
            k.startsWith('data-') ||
            k.startsWith('aria-') ||
            DOM_ATTRS.has(k) ||
            (/^on[A-Z]/.test(k) && typeof v === 'function')
        ) {
            out[k] = v;
        }
    }
    return out;
}

/**
 * Flattening sx merge — MUI does NOT flatten nested sx arrays, so normalize every
 * entry (undefined dropped, arrays spread). Later entries win. Returns undefined
 * when nothing remains, so an `sx` prop can be omitted entirely.
 */
export function mergeSx(...entries: Array<SxProps<Theme> | undefined | null>): SxProps<Theme> | undefined {
    const flat = entries.flatMap((e) => (e == null ? [] : Array.isArray(e) ? e : [e]));
    return flat.length ? (flat as SxProps<Theme>) : undefined;
}

/** Join class hooks, dropping falsy; returns undefined when empty (never a bare class=""). */
export function joinClassNames(...names: Array<string | undefined | null | false>): string | undefined {
    const joined = names.filter(Boolean).join(' ');
    return joined || undefined;
}
