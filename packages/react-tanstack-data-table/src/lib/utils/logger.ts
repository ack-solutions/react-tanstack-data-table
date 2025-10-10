/**
 * Logging utilities for the DataTable package.
 *
 * Provides a lightweight wrapper around `console` that can be configured globally
 * or per-instance to help troubleshoot behaviour in consuming applications.
 */

export type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug';

interface ConsoleLike {
    debug?: (...args: unknown[]) => void;
    info?: (...args: unknown[]) => void;
    warn?: (...args: unknown[]) => void;
    error?: (...args: unknown[]) => void;
    log?: (...args: unknown[]) => void;
}

export interface DataTableLoggingOptions {
    /**
     * Whether logging should be enabled.
     */
    enabled?: boolean;
    /**
     * Minimum level that will be emitted. Defaults to `warn`.
     */
    level?: LogLevel;
    /**
     * Prefix prepended to every log message. Defaults to `DataTable`.
     */
    prefix?: string;
    /**
     * Optional scope that will be appended after the prefix when present.
     */
    scope?: string;
    /**
     * Include an ISO timestamp ahead of each log line.
     */
    includeTimestamp?: boolean;
    /**
     * A custom logger implementation. Defaults to `console`.
     */
    logger?: ConsoleLike;
}

type LoggerInput = boolean | DataTableLoggingOptions;

type ResolvedLoggerConfig = Required<Omit<DataTableLoggingOptions, 'logger'>> & {
    logger: ConsoleLike;
};

type LogMethodLevel = Exclude<LogLevel, 'silent'>;

const LOG_LEVEL_ORDER: Record<LogLevel, number> = {
    silent: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
};

const defaultConsole: ConsoleLike = typeof console !== 'undefined'
    ? console
    : {
        log: () => undefined,
        debug: () => undefined,
        info: () => undefined,
        warn: () => undefined,
        error: () => undefined,
    };

let globalConfig: ResolvedLoggerConfig = {
    enabled: false,
    level: 'warn',
    prefix: 'DataTable',
    scope: '',
    includeTimestamp: false,
    logger: defaultConsole,
};

const isLevelEnabled = (level: LogMethodLevel, config: ResolvedLoggerConfig) => {
    if (!config.enabled) {
        return false;
    }
    return LOG_LEVEL_ORDER[level] <= LOG_LEVEL_ORDER[config.level];
};

const formatPrefix = (level: LogMethodLevel, config: ResolvedLoggerConfig) => {
    const segments: string[] = [];
    if (config.prefix) {
        segments.push(config.prefix);
    }
    if (config.scope) {
        segments.push(config.scope);
    }
    const prefix = segments.length > 0 ? `[${segments.join(':')}]` : '';
    return config.includeTimestamp
        ? `[${new Date().toISOString()}]${prefix ? ` ${prefix}` : ''} [${level.toUpperCase()}]`
        : `${prefix ? `${prefix} ` : ''}[${level.toUpperCase()}]`;
};

const getConsoleMethod = (level: LogMethodLevel, logger: ConsoleLike) => {
    const methodName = level === 'debug' ? 'debug' : level;
    return logger[methodName] ?? logger.log ?? defaultConsole.log ?? (() => undefined);
};

const normaliseInput = (input?: LoggerInput): DataTableLoggingOptions => {
    if (typeof input === 'boolean') {
        return { enabled: input };
    }
    return input ?? {};
};

const resolveConfig = (
    scope: string | undefined,
    input?: LoggerInput,
    parent?: ResolvedLoggerConfig,
): ResolvedLoggerConfig => {
    const overrides = normaliseInput(input);
    const base = parent ?? globalConfig;

    return {
        enabled: overrides.enabled ?? base.enabled,
        level: overrides.level ?? base.level,
        prefix: overrides.prefix ?? base.prefix,
        scope: overrides.scope ?? scope ?? base.scope ?? '',
        includeTimestamp: overrides.includeTimestamp ?? base.includeTimestamp,
        logger: overrides.logger ?? base.logger ?? defaultConsole,
    };
};

export interface LoggerInstance {
    debug: (...args: unknown[]) => void;
    info: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
    /**
     * Create a new logger that inherits configuration and extends the scope.
     */
    child: (scope: string, overrides?: LoggerInput) => LoggerInstance;
    /**
     * Check whether a level would emit given current configuration.
     */
    isLevelEnabled: (level: LogMethodLevel) => boolean;
    /**
     * Access the resolved configuration for inspection.
     */
    config: ResolvedLoggerConfig;
}

const createLoggerMethods = (config: ResolvedLoggerConfig): Omit<LoggerInstance, 'child' | 'isLevelEnabled' | 'config'> => {
    const logWithLevel = (level: LogMethodLevel) => {
        const consoleMethod = getConsoleMethod(level, config.logger);
        return (...args: unknown[]) => {
            if (!isLevelEnabled(level, config)) {
                return;
            }
            const prefix = formatPrefix(level, config);
            consoleMethod(prefix, ...args);
        };
    };

    return {
        debug: logWithLevel('debug'),
        info: logWithLevel('info'),
        warn: logWithLevel('warn'),
        error: logWithLevel('error'),
    };
};

/**
 * Create a new logger instance. Configuration cascades from the global config unless overridden.
 */
export const createLogger = (scope?: string, input?: LoggerInput, parentConfig?: ResolvedLoggerConfig): LoggerInstance => {
    const resolvedConfig = resolveConfig(scope, input, parentConfig);
    const methods = createLoggerMethods(resolvedConfig);

    const child = (childScope: string, overrides?: LoggerInput) => {
        const combinedScope = childScope
            ? (resolvedConfig.scope ? `${resolvedConfig.scope}.${childScope}` : childScope)
            : resolvedConfig.scope;
        return createLogger(combinedScope, overrides, resolvedConfig);
    };

    return {
        ...methods,
        child,
        isLevelEnabled: (level: LogMethodLevel) => isLevelEnabled(level, resolvedConfig),
        config: resolvedConfig,
    };
};

/**
 * Configure the global logger defaults for every DataTable instance.
 */
export const configureDataTableLogging = (options: DataTableLoggingOptions) => {
    globalConfig = resolveConfig(options.scope, options, globalConfig);
};

/**
 * Read the current global logging configuration.
 */
export const getDataTableLoggingConfig = (): ResolvedLoggerConfig => ({ ...globalConfig });

