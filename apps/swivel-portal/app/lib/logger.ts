import * as Sentry from '@sentry/react';
import type { SeverityLevel } from '@sentry/react';

type Loggable = string | Error;
type LogMetadata = Record<string, unknown> | undefined;
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const toBoolean = (value: unknown): boolean =>
  value === true || value === 'true';

const consoleMethodMap: Record<LogLevel, 'debug' | 'info' | 'warn' | 'error'> =
  {
    debug: 'debug',
    info: 'info',
    warn: 'warn',
    error: 'error',
  };

const severityMap: Record<LogLevel, SeverityLevel> = {
  debug: 'debug',
  info: 'info',
  warn: 'warning',
  error: 'error',
};

const mode = import.meta.env.MODE;
const isTestMode = mode === 'test';
const isDevMode = toBoolean(import.meta.env.DEV);
const hasSentryDsn = Boolean(import.meta.env.VITE_SENTRY_DSN);
const shouldLogToSentry = !isDevMode && !isTestMode && hasSentryDsn;
const shouldLogToConsole = isDevMode || isTestMode || !shouldLogToSentry;

const sanitizeValue = (value: unknown): unknown => {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }

  return value;
};

const prepareContext = (context: LogMetadata): Record<string, unknown> => {
  const prepared = context
    ? Object.entries(context).reduce<Record<string, unknown>>(
        (acc, [key, value]) => {
          acc[key] = sanitizeValue(value);
          return acc;
        },
        {}
      )
    : {};

  if (!('timestamp' in prepared)) {
    prepared.timestamp = new Date().toISOString();
  }

  if (!('environment' in prepared)) {
    prepared.environment = mode;
  }

  return prepared;
};

const emitConsole = (
  level: LogLevel,
  message: string,
  context: Record<string, unknown>,
  error?: Error
) => {
  if (!shouldLogToConsole) return;

  const method = consoleMethodMap[level];
  const payload = error
    ? {
        ...context,
        error: {
          name: error.name,
          message: error.message,
        },
      }
    : context;

  console[method](message, payload);
};

const emitSentry = (
  level: LogLevel,
  message: string,
  context: Record<string, unknown>,
  error?: Error
) => {
  if (!shouldLogToSentry) return;
  if (level === 'debug') return;

  const severity = severityMap[level];

  Sentry.withScope((scope) => {
    if (context && Object.keys(context).length > 0) {
      scope.setContext('context', context);
    }

    scope.setLevel(severity);

    if (error) {
      scope.setExtra('message', message);
      Sentry.captureException(error);
    } else {
      Sentry.captureMessage(message, severity);
    }
  });
};

const log = (level: LogLevel, input: Loggable, context?: LogMetadata) => {
  const error = input instanceof Error ? input : undefined;
  const message = input instanceof Error ? input.message : input;
  const payload = prepareContext(context);

  emitConsole(level, message, payload, error);
  emitSentry(level, message, payload, error);
};

export const Logger = {
  debug: (message: Loggable, context?: LogMetadata) =>
    log('debug', message, context),
  info: (message: Loggable, context?: LogMetadata) =>
    log('info', message, context),
  warn: (message: Loggable, context?: LogMetadata) =>
    log('warn', message, context),
  error: (message: Loggable, context?: LogMetadata) =>
    log('error', message, context),
};
