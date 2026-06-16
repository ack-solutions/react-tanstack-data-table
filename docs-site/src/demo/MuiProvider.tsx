import { useColorMode } from '@docusaurus/theme-common';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useMemo, type ReactNode } from 'react';

/**
 * Wraps a demo in an MUI theme + a bordered surface that fits the Docusaurus page.
 * The MUI `palette.mode` follows Docusaurus's light/dark toggle, so the grid (which
 * derives all its colours from the theme) switches with the docs.
 */
export function MuiProvider({ children }: { children: ReactNode }) {
    const { colorMode } = useColorMode();
    const theme = useMemo(() => createTheme({ palette: { mode: colorMode } }), [colorMode]);

    return (
        <ThemeProvider theme={theme}>
            <div
                style={{
                    border: '1px solid var(--ifm-color-emphasis-200)',
                    borderRadius: 8,
                    overflow: 'hidden',
                    background: 'var(--ifm-background-surface-color)',
                    marginBottom: 'var(--ifm-leading)',
                }}
            >
                {children}
            </div>
        </ThemeProvider>
    );
}
