import BrowserOnly from '@docusaurus/BrowserOnly';
import type { ReactNode } from 'react';

import { MuiProvider } from './MuiProvider';

/**
 * Renders a live demo CLIENT-ONLY (the grid uses browser APIs, so it must not run
 * during Docusaurus SSR). Usage in MDX:  <LiveDemo>{() => <SortingDemo/>}</LiveDemo>
 */
export default function LiveDemo({ children }: { children: () => ReactNode }) {
    return (
        <BrowserOnly fallback={<div style={{ padding: 24, textAlign: 'center', color: 'var(--ifm-color-emphasis-600)' }}>Loading demo…</div>}>
            {() => <MuiProvider>{children()}</MuiProvider>}
        </BrowserOnly>
    );
}
