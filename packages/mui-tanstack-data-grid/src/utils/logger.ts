/**
 * Lightweight, configurable console wrapper (global or per-instance). Ported
 * from v1 unchanged; option/level types now live in `../types/logging.types`.
 */
import type { LogLevel, ConsoleLike, DataTableLoggingOptions } from '../types/logging.types';

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

const defaultConsole: ConsoleLike =
    typeof console !== 'undefined'
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
    if (!config.enabled) return false;
    return LOG_LEVEL_ORDER[level] <= LOG_LEVEL_ORDER[config.level];
};

const formatPrefix = (level: LogMethodLevel, config: ResolvedLoggerConfig) => {
    const segments: string[] = [];
    if (config.prefix) segments.push(config.prefix);
    if (config.scope) segments.push(config.scope);
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
    if (typeof input === 'boolean') return { enabled: input };
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
    child: (scope: string, overrides?: LoggerInput) => LoggerInstance;
    isLevelEnabled: (level: LogMethodLevel) => boolean;
    config: ResolvedLoggerConfig;
}

const createLoggerMethods = (
    config: ResolvedLoggerConfig,
): Omit<LoggerInstance, 'child' | 'isLevelEnabled' | 'config'> => {
    const logWithLevel = (level: LogMethodLevel) => {
        const consoleMethod = getConsoleMethod(level, config.logger);
        return (...args: unknown[]) => {
            if (!isLevelEnabled(level, config)) return;
            consoleMethod(formatPrefix(level, config), ...args);
        };
    };
    return {
        debug: logWithLevel('debug'),
        info: logWithLevel('info'),
        warn: logWithLevel('warn'),
        error: logWithLevel('error'),
    };
};

export const createLogger = (
    scope?: string,
    input?: LoggerInput,
    parentConfig?: ResolvedLoggerConfig,
): LoggerInstance => {
    const resolvedConfig = resolveConfig(scope, input, parentConfig);
    const methods = createLoggerMethods(resolvedConfig);
    const child = (childScope: string, overrides?: LoggerInput) => {
        const combinedScope = childScope
            ? resolvedConfig.scope
                ? `${resolvedConfig.scope}.${childScope}`
                : childScope
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

export const configureDataTableLogging = (options: DataTableLoggingOptions) => {
    globalConfig = resolveConfig(options.scope, options, globalConfig);
};

export const getDataTableLoggingConfig = (): ResolvedLoggerConfig => ({ ...globalConfig });
