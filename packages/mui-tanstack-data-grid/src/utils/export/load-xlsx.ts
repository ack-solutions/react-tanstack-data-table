/**
 * Loads the OPTIONAL `xlsx` (SheetJS) peer dependency for Excel export.
 *
 * Why optional: SheetJS abandoned its npm package at 0.18.5, which carries two
 * high-severity *parsing* advisories (GHSA-4r6h-8v6p-xvw6 prototype pollution,
 * GHSA-5pgg-2g8v-p4x9 ReDoS) with **no fixed version on the registry** — they moved
 * distribution to cdn.sheetjs.com. Shipping it as a hard dependency would give every
 * consumer a permanently red `npm audit`, even ones that never export a spreadsheet.
 *
 * Why that's safe here: this grid only ever *writes* workbooks — `book_new`,
 * `json_to_sheet`, `book_append_sheet`, `write` — and never calls `XLSX.read` /
 * `readFile`. Both advisories live in the parsing path, so they're unreachable. So
 * `xlsx` is declared as an optional peer: most consumers (and all CSV-only ones) don't
 * install it and get a clean audit; Excel-export consumers add `xlsx` themselves.
 *
 * DO NOT move `xlsx` back into `dependencies` — that re-introduces the audit noise for
 * everyone. It stays a `devDependency` (so this package builds/tests) + an optional peer.
 */

/** The subset of SheetJS's *write* API this grid uses (kept local so nothing pulls the `xlsx` types into the public .d.ts). */
export interface XlsxWriteApi {
    utils: {
        book_new(): any;
        json_to_sheet(data: any[]): any;
        book_append_sheet(workbook: any, worksheet: any, sheetName: string): void;
    };
    write(workbook: any, options: { bookType: 'xlsx'; type: 'array' }): any;
}

export const XLSX_MISSING_MESSAGE =
    'Excel export requires the optional peer dependency "xlsx". Install it (`npm install xlsx`) or export to CSV instead.';

/**
 * Dynamically import `xlsx`, translating an absent module into a clear, actionable
 * error (so a consumer who clicked "Export to Excel" without the peer sees a message,
 * not a raw module-resolution rejection). Only invoked on the Excel export path.
 */
export async function loadXlsx(): Promise<XlsxWriteApi> {
    try {
        return (await import('xlsx')) as unknown as XlsxWriteApi;
    } catch {
        throw new Error(XLSX_MISSING_MESSAGE);
    }
}
