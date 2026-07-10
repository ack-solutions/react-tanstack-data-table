/**
 * Feather-style line icons (24×24, 1.75 stroke, round caps) — the grid's default
 * toolbar + sort icons, matching the data-grid design reference.
 *
 * Rendered through MUI `SvgIcon`, so they honour `fontSize`, `color`, and `sx`
 * exactly like an `@mui/icons-material` icon — and every one is still overridable
 * through `slots` (e.g. `slots={{ searchIcon: MyIcon }}`). Using inline SVG here
 * (instead of `@mui/icons-material`) keeps the default bundle lean and matches the
 * thin line aesthetic of the reference design.
 */
import { SvgIcon, type SvgIconProps } from '@mui/material';
import type { ReactElement } from 'react';

/** Explicit, nameable type so the emitted `.d.ts` doesn't reference pnpm-internal paths (TS2742). */
type FeatherIcon = (props: SvgIconProps) => ReactElement;

function Feather({ d, sx, ...rest }: SvgIconProps & { d: string }) {
    return (
        <SvgIcon
            viewBox="0 0 24 24"
            {...rest}
            sx={{ fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', ...sx }}
        >
            {d.split(' M').map((seg, i) => (
                <path key={i} d={i === 0 ? seg : `M${seg}`} />
            ))}
        </SvgIcon>
    );
}

export const SearchFeatherIcon: FeatherIcon = (p) => <Feather d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.35-4.35" {...p} />;
export const ClearFeatherIcon: FeatherIcon = (p) => <Feather d="M18 6L6 18 M6 6l12 12" {...p} />;
export const FilterFeatherIcon: FeatherIcon = (p) => <Feather d="M3 6h18 M6 12h12 M10 18h4" {...p} />;
export const ColumnsFeatherIcon: FeatherIcon = (p) => <Feather d="M4 4h16v16H4z M9.33 4v16 M14.67 4v16" {...p} />;
export const DensityFeatherIcon: FeatherIcon = (p) => <Feather d="M3 5h18 M3 12h18 M3 19h18" {...p} />;
export const ViewsFeatherIcon: FeatherIcon = (p) => <Feather d="M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5" {...p} />;
export const GridViewFeatherIcon: FeatherIcon = (p) => <Feather d="M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z" {...p} />;
export const ListViewFeatherIcon: FeatherIcon = (p) => <Feather d="M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01" {...p} />;
export const ExportFeatherIcon: FeatherIcon = (p) => <Feather d="M8 17l4 4 4-4 M12 12v9 M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29" {...p} />;
export const RefreshFeatherIcon: FeatherIcon = (p) => <Feather d="M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0 0 20.49 15" {...p} />;
export const ResetFeatherIcon: FeatherIcon = (p) => <Feather d="M23 4v6h-6 M20.49 15a9 9 0 1 1-2.12-9.36L23 10" {...p} />;
export const SortAscFeatherIcon: FeatherIcon = (p) => <Feather d="M12 19V5 M5 12l7-7 7 7" {...p} />;
export const SortDescFeatherIcon: FeatherIcon = (p) => <Feather d="M12 5v14 M19 12l-7 7-7-7" {...p} />;
export const EyeFeatherIcon: FeatherIcon = (p) => <Feather d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" {...p} />;
export const EyeOffFeatherIcon: FeatherIcon = (p) => <Feather d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24 M1 1l22 22" {...p} />;
