/**
 * Export subsystem — public surface.
 *
 * `runExport` is the single orchestrator (dispatches by mode); the rest are the
 * composable pieces (request builder, serializers, sinks, download, fetch) used
 * internally and available for advanced consumers.
 */
export { runExport } from './modes';
export type { RunExportOptions, RunExportCallbacks } from './modes';

export { buildExportRequest } from './request';
export type { BuildExportRequestOptions, BuiltExportRequest } from './request';

export {
    recordsToCSV,
    csvHeaderLine,
    csvRowLine,
    buildXlsxBlob,
    MAX_XLSX_ROWS,
    CSV_MIME,
    XLSX_MIME,
} from './serialize';

export { downloadBlob, downloadFromUrl, isSafeDownloadUrl } from './download';
export { createTextSink, supportsStreamingSink } from './sink';
export type { ExportSinkHandle } from './sink';

export { pageAllRows, iterateBatches } from './fetch';
export type { FetchPage, PageResult, PageAllOptions } from './fetch';

export {
    sanitizeCSVCellValue,
    resolveExportHeader,
    normalizeExportValue,
    applyExportValueTransform,
    applyExportFormatTransform,
    formatRowRecord,
} from './format';
export type { ResolvedExportColumn } from './format';

export { isCancelledError, EXPORT_CANCELLED_CODE } from './cancel';
