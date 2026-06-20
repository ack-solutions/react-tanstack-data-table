import { createContext, useContext, type ReactNode, type ReactElement } from 'react';

import type { DataTableLocaleText } from '../types/locale.types';
import { DEFAULT_LOCALE_TEXT } from './default-locale';

const LocaleTextContext = createContext<DataTableLocaleText>(DEFAULT_LOCALE_TEXT);

export function LocaleTextProvider({ value, children }: { value: DataTableLocaleText; children: ReactNode }): ReactElement {
    return <LocaleTextContext.Provider value={value}>{children}</LocaleTextContext.Provider>;
}

/** Read the merged locale text inside any grid sub-component. */
export function useLocaleText(): DataTableLocaleText {
    return useContext(LocaleTextContext);
}
