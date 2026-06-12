export type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug';

export interface ConsoleLike {
    debug?: (...args: unknown[]) => void;
    info?: (...args: unknown[]) => void;
    warn?: (...args: unknown[]) => void;
    error?: (...args: unknown[]) => void;
    log?: (...args: unknown[]) => void;
}

export interface DataTableLoggingOptions {
    /** Whether logging is enabled. */
    enabled?: boolean;
    /** Minimum level emitted (default: `warn`). */
    level?: LogLevel;
    /** Prefix on every message (default: `DataTable`). */
    prefix?: string;
    /** Optional scope appended after the prefix. */
    scope?: string;
    /** Prepend an ISO timestamp. */
    includeTimestamp?: boolean;
    /** Custom logger backend (default: `console`). */
    logger?: ConsoleLike;
}
