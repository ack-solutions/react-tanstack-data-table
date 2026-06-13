/**
 * Row sourcing for export. `pageAllRows` walks a paginated fetcher — with a
 * configurable inter-page delay (default 0, the old hard-coded 100 ms is gone),
 * optional bounded concurrency (delivered IN ORDER so file rows stay sorted), and
 * cooperative yields so the UI keeps painting. `iterateBatches` consumes a streaming
 * source from `onExportStream`.
 */
import { throwIfAborted, waitWithAbort, yieldToEventLoop } from './cancel';

export interface PageResult {
    data: any[];
    total?: number;
}

export type FetchPage = (pageIndex: number, pageSize: number, signal?: AbortSignal) => Promise<PageResult>;

export interface PageAllOptions {
    chunkSize?: number;
    /** Delay between pages/waves in ms. Default 0. Raise it to be gentle on rate-limited APIs. */
    interPageDelayMs?: number;
    /** Pages fetched concurrently when the total is known. Default 1 (sequential). */
    concurrency?: number;
    /** Hard cap on pages, as a runaway guard. */
    maxPages?: number;
    signal?: AbortSignal;
    /** Called once per batch, in row order. */
    onBatch: (rows: any[], info: { fetched: number; total?: number }) => Promise<void> | void;
}

const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_MAX_PAGES = 10000;

/**
 * Page through `fetchPage` until exhausted, delivering every batch in order to `onBatch`.
 * Returns the total number of rows delivered.
 */
export async function pageAllRows(fetchPage: FetchPage, options: PageAllOptions): Promise<{ fetched: number; total?: number }> {
    const {
        chunkSize = DEFAULT_CHUNK_SIZE,
        interPageDelayMs = 0,
        concurrency = 1,
        maxPages = DEFAULT_MAX_PAGES,
        signal,
        onBatch,
    } = options;

    throwIfAborted(signal);
    // Probe the first page to learn the total and the result shape.
    const first = await fetchPage(0, chunkSize, signal);
    const total = typeof first.total === 'number' && first.total >= 0 ? first.total : undefined;
    let fetched = 0;

    const deliver = async (rows: any[]) => {
        if (!rows.length) return;
        fetched += rows.length;
        await onBatch(rows, { fetched, total });
        await yieldToEventLoop(signal);
    };

    await deliver(first.data);

    if (first.data.length === 0) return { fetched, total };
    if (total !== undefined && fetched >= total) return { fetched, total };

    // Known total + concurrency > 1 → fetch remaining pages in ordered waves.
    if (total !== undefined && concurrency > 1) {
        const totalPages = Math.min(maxPages, Math.ceil(total / chunkSize));
        let page = 1;
        while (page < totalPages) {
            throwIfAborted(signal);
            const wave: number[] = [];
            for (let i = 0; i < concurrency && page < totalPages; i++) wave.push(page++);
            const results = await Promise.all(wave.map((p) => fetchPage(p, chunkSize, signal)));
            for (const r of results) await deliver(r.data); // in wave order = row order
            if (fetched >= total) break;
            if (interPageDelayMs > 0) await waitWithAbort(interPageDelayMs, signal);
        }
        return { fetched, total };
    }

    // Sequential paging (unknown total, or concurrency = 1).
    for (let page = 1; page < maxPages; page++) {
        throwIfAborted(signal);
        const result = await fetchPage(page, chunkSize, signal);
        await deliver(result.data);
        if (result.data.length < chunkSize) break;
        if (total !== undefined && fetched >= total) break;
        if (interPageDelayMs > 0) await waitWithAbort(interPageDelayMs, signal);
    }
    return { fetched, total };
}

/** Consume a streaming source (`AsyncIterable<rows[]>`), delivering each batch to `onBatch`. */
export async function iterateBatches(
    source: AsyncIterable<any[]>,
    options: { signal?: AbortSignal; onBatch: (rows: any[], info: { fetched: number }) => Promise<void> | void },
): Promise<{ fetched: number }> {
    const { signal, onBatch } = options;
    let fetched = 0;
    for await (const rows of source) {
        throwIfAborted(signal);
        if (!rows || !rows.length) continue;
        fetched += rows.length;
        await onBatch(rows, { fetched });
        await yieldToEventLoop(signal);
    }
    return { fetched };
}
