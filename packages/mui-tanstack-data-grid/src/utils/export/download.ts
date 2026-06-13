/**
 * Browser download helpers. The key rule for large exports: a `{ fileUrl }` is
 * downloaded via native `<a download>` navigation (the browser's download manager
 * streams it outside JS — O(1) memory), NOT via `fetch().blob()` which would buffer
 * the entire file in RAM and defeat server-side streaming.
 */

/** Basic origin/scheme guard so a `fileUrl` can't smuggle in `javascript:`/`data:` etc. */
export function isSafeDownloadUrl(url: string): boolean {
    try {
        const u = new URL(url, typeof window !== 'undefined' ? window.location.href : 'http://localhost');
        return u.protocol === 'http:' || u.protocol === 'https:' || u.protocol === 'blob:';
    } catch {
        return false;
    }
}

/** Save an in-memory blob/string to the user's Downloads via an object URL. */
export function downloadBlob(content: string | Blob, filename: string, mimeType: string): void {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    try {
        triggerAnchorDownload(url, filename);
    } finally {
        URL.revokeObjectURL(url);
    }
}

/**
 * Download a server-generated file from a URL.
 * Default path: native `<a href download>` navigation — streams to disk, no JS buffering.
 * Set `rename: true` only when you must force the saved filename across origins (this
 * falls back to a buffered `fetch().blob()` and is unsuitable for very large files).
 */
export async function downloadFromUrl(
    url: string,
    filename: string,
    options: { mimeType?: string; rename?: boolean; signal?: AbortSignal } = {},
): Promise<void> {
    if (!isSafeDownloadUrl(url)) throw new Error('Refusing to download from an unsafe URL');
    const { rename = false, mimeType, signal } = options;

    if (!rename) {
        // Stream to disk via the browser's download manager (O(1) memory).
        triggerAnchorDownload(url, filename);
        return;
    }

    // Rename across origins requires reading the bytes (buffers in memory).
    try {
        const response = await fetch(url, { signal });
        if (!response.ok) throw new Error(`Failed to download export file (${response.status})`);
        const blob = await response.blob();
        downloadBlob(blob, filename, mimeType || blob.type || 'application/octet-stream');
    } catch (error) {
        if (error instanceof Error && (error.name === 'AbortError' || (error as any).code === 'CANCELLED')) throw error;
        // CORS or network blocked the fetch — fall back to native navigation.
        triggerAnchorDownload(url, filename);
    }
}

function triggerAnchorDownload(href: string, filename: string): void {
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    link.rel = 'noopener';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
