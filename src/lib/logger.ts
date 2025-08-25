import { errorInDev, logInDev, warnInDev } from '@/utils/consoleSuppress';
// Centralized structured logger with redaction capabilities
// Scrubs sensitive information from logs for security

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogMetadata {
  [key: string]: unknown;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  metadata?: LogMetadata;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  component?: string;
}

// Sensitive patterns to redact from logs
const SENSITIVE_PATTERNS = [
  /access_token["']?\s*[:=]\s*["']?([^"'\s,}]+)/gi,
  /bearer\s+([a-zA-Z0-9._-]+)/gi,
  /jwt["']?\s*[:=]\s*["']?([^"'\s,}]+)/gi,
  /password["']?\s*[:=]\s*["']?([^"'\s,}]+)/gi,
  /email["']?\s*[:=]\s*["']?([^"'\s,}]+@[^"'\s,}]+)/gi,
  /api_key["']?\s*[:=]\s*["']?([^"'\s,}]+)/gi,
  /secret["']?\s*[:=]\s*["']?([^"'\s,}]+)/gi,
];

/**
 * Redacts sensitive information from log metadata
 */
export function redact(data: LogMetadata): LogMetadata {
  const redacted = { ...data };

  for (const [key, value] of Object.entries(redacted)) {
    if (typeof value === 'string') {
      let cleanValue = value;
      for (const pattern of SENSITIVE_PATTERNS) {
        cleanValue = cleanValue.replace(pattern, (match, captured) =>
          match.replace(captured, '[REDACTED]'),
        );
      }
      redacted[key] = cleanValue;
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redact(value as LogMetadata);
    }
  }

  return redacted;
}

/**
 * Creates a structured log entry
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  metadata?: LogMetadata,
  context?: { userId?: string; sessionId?: string; component?: string },
): LogEntry {
  return {
    level,
    message,
    metadata: metadata ? redact(metadata) : undefined,
    timestamp: new Date().toISOString(),
    userId: context?.userId,
    sessionId: context?.sessionId,
    component: context?.component,
  };
}

// Metadata normalizer to accept arbitrary inputs safely
function normalizeMetadata(input: unknown): LogMetadata | undefined {
  if (input == null) {
    return undefined;
  }
  if (typeof input === 'string') {
    return { message: input };
  }
  if (input instanceof Error) {
    const err = input as Error & Record<string, unknown>;
    const extra = Object.fromEntries(Object.entries(err).filter(([_, v]) => v !== undefined));
    return {
      name: err.name,
      message: err.message,
      stack: err.stack,
      ...extra,
    };
  }
  if (typeof input === 'object') {
    return input as LogMetadata;
  }
  return { value: String(input) };
}

/**
 * Sends logs to external monitoring service (Sentry integration)
 */
async function sendToMonitoring(entry: LogEntry): Promise<void> {
  const logData = {
    ...entry,
    environment: process.env.NODE_ENV || 'development',
    app: 'aynamoda',
  };

  // Send to Sentry for production monitoring
  if (!__DEV__) {
    try {
      const { Sentry } = await import('../config/sentry');

      if (entry.level === 'error') {
        Sentry.captureException(new Error(entry.message));
      } else if (entry.level === 'warn') {
        Sentry.captureMessage(entry.message);
      } else if (entry.level === 'info') {
        Sentry.addBreadcrumb({
          message: entry.message,
          category: entry.component || 'app',
          level: 'info',
          data: entry.metadata,
        });
      }
    } catch (error) {
      // Fallback to console if Sentry fails
      warnInDev('Sentry logging failed:', error);
    }
  }

  // Always log to console in development or as fallback
  if (entry.level === 'error') {
    errorInDev(JSON.stringify(logData));
  } else if (entry.level === 'warn') {
    warnInDev(JSON.stringify(logData));
  } else if (entry.level === 'info') {
    logInDev(JSON.stringify(logData));
  } else if (entry.level === 'debug' && process.env.NODE_ENV === 'development') {
    logInDev(JSON.stringify(logData));
  }
}

/**
 * Structured logger with different log levels and monitoring integration
 */
export const logger = {
  debug: (
    message: string,
    metadata?: unknown,
    context?: { userId?: string; sessionId?: string; component?: string },
  ) => {
    const entry = createLogEntry('debug', message, normalizeMetadata(metadata), context);
    sendToMonitoring(entry);
  },

  info: (
    message: string,
    metadata?: unknown,
    context?: { userId?: string; sessionId?: string; component?: string },
  ) => {
    const entry = createLogEntry('info', message, normalizeMetadata(metadata), context);
    sendToMonitoring(entry);
  },

  warn: (
    message: string,
    metadata?: unknown,
    context?: { userId?: string; sessionId?: string; component?: string },
  ) => {
    const entry = createLogEntry('warn', message, normalizeMetadata(metadata), context);
    sendToMonitoring(entry);
  },

  error: (
    message: string,
    metadata?: unknown,
    context?: { userId?: string; sessionId?: string; component?: string },
  ) => {
    const entry = createLogEntry('error', message, normalizeMetadata(metadata), context);
    sendToMonitoring(entry);
  },

  // Utility method for performance logging
  performance: (
    operation: string,
    duration: number,
    metadata?: unknown,
    context?: { userId?: string; sessionId?: string; component?: string },
  ) => {
    const base = normalizeMetadata(metadata) || {};
    const entry = createLogEntry(
      'info',
      `Performance: ${operation}`,
      {
        ...base,
        duration_ms: duration,
        operation,
      },
      context,
    );
    sendToMonitoring(entry);
  },
};
