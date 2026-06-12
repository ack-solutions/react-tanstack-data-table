import { ThemeProvider, createTheme } from '@mui/material/styles';
import type { ReactNode } from 'react';

const theme = createTheme();

/** Wraps a demo in an MUI theme + a bordered surface that fits the Docusaurus page. */
export function MuiProvider({ children }: { children: ReactNode }) {
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
