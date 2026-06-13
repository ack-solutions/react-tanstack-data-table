/**
 * File sinks. A sink accepts text chunks and writes them out, so the file is built
 * incrementally without holding the whole thing in one string.
 *
 * - `stream` — File System Access API (`showSaveFilePicker` + writable stream): bytes
 *   go straight to disk with backpressure, near-constant memory. **CSV/text only**,
 *   **Chromium-only**, secure-context, and the picker MUST open during the user gesture
 *   (so create the sink BEFORE any `await`). No support in Firefox/Safari.
 * - `blob` — collect cheap Blob *parts*, assemble once, download via object URL. Works
 *   in every browser; memory is bounded by total file size (fine to hundreds of MB).
 *
 * Binary XLSX is always built whole (it cannot stream line-by-line) — use the blob sink.
 */
import { downloadBlob } from './download';
import { CSV_MIME } from './serialize';

export interface ExportSinkHandle {
    readonly kind: 'stream' | 'blob';
    writeText(text: string): Promise<void>;
    close(): Promise<void>;
    abort(): Promise<void>;
}

/** True when the browser supports streaming a chosen file to disk (Chromium, https). */
export function supportsStreamingSink(): boolean {
    return (
        typeof window !== 'undefined' &&
        typeof (window as any).showSaveFilePicker === 'function' &&
        (typeof window.isSecureContext === 'undefined' || window.isSecureContext)
    );
}

class StreamSink implements ExportSinkHandle {
    readonly kind = 'stream' as const;
    private writable: any;
    private encoder = new TextEncoder();
    constructor(writable: any) {
        this.writable = writable;
    }
    async writeText(text: string): Promise<void> {
        await this.writable.write(this.encoder.encode(text));
    }
    async close(): Promise<void> {
        await this.writable.close();
    }
    async abort(): Promise<void> {
        try {
            await this.writable.abort?.();
        } catch {
            /* ignore */
        }
    }
}

class BlobSink implements ExportSinkHandle {
    readonly kind = 'blob' as const;
    private parts: BlobPart[] = [];
    constructor(private filename: string, private mimeType: string) {}
    async writeText(text: string): Promise<void> {
        this.parts.push(text);
    }
    async close(): Promise<void> {
        const blob = new Blob(this.parts, { type: this.mimeType });
        this.parts = [];
        downloadBlob(blob, this.filename, this.mimeType);
    }
    async abort(): Promise<void> {
        this.parts = [];
    }
}

/**
 * Create a text sink for CSV output. `prefer: 'stream'|'auto'` tries the File System
 * Access path first (must be called inside the user gesture, before any `await`);
 * anything else (or unsupported browsers) falls back to the in-memory blob path.
 * Returns `null` from the stream path if the user cancels the save dialog.
 */
export async function createTextSink(
    filename: string,
    options: { prefer?: 'auto' | 'stream' | 'blob'; mimeType?: string } = {},
): Promise<ExportSinkHandle | null> {
    const { prefer = 'auto', mimeType = CSV_MIME } = options;
    const wantStream = (prefer === 'stream' || prefer === 'auto') && supportsStreamingSink();

    if (wantStream) {
        try {
            const handle = await (window as any).showSaveFilePicker({
                suggestedName: filename,
                types: [{ description: 'CSV file', accept: { 'text/csv': ['.csv'] } }],
            });
            const writable = await handle.createWritable();
            return new StreamSink(writable);
        } catch (error: any) {
            // AbortError === user dismissed the picker → signal cancellation to the caller.
            if (error && error.name === 'AbortError') return null;
            // Any other failure (e.g. blocked by policy) → fall through to the blob sink.
        }
    }

    return new BlobSink(filename, mimeType);
}
