/* Centralized structured logger with redaction (emails, JWTs, bearer tokens & auth fields) */
type Level = 'debug' | 'info' | 'warn' | 'error';
const REDACT_KEYS = ['access_token','refresh_token','apikey','anonkey','authorization','token','jwt'];
const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const jwtRegex = /(eyJ[0-9a-zA-Z-_]+\.[0-9a-zA-Z-_]+\.[0-9a-zA-Z-_]+)/g;
const bearerRegex = /Bearer\s+[A-Za-z0-9._-]+/gi;

function scrubScalar(v: string) {
  return v
    .replace(emailRegex, '[REDACTED]')
    .replace(jwtRegex, '[REDACTED]')
    .replace(bearerRegex, 'Bearer [REDACTED]');
}

function redact(value: any): any {
  if (typeof value === 'string') return scrubScalar(value);
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k,v]) =>
        REDACT_KEYS.includes(k.toLowerCase()) ? [k,'[REDACTED]'] : [k, redact(v)]
      )
    );
  }
  return value;
}

function emit(level: Level, msg: string, meta?: any) {
  const entry = { ts: new Date().toISOString(), level, msg, ...(meta ? { meta: redact(meta) } : {}) };
  // eslint-disable-next-line no-console
  console[level === 'debug' ? 'log' : level](JSON.stringify(entry));
}

export const logger = {
  debug: (m: string, o?: any) => emit('debug', m, o),
  info:  (m: string, o?: any) => emit('info', m, o),
  warn:  (m: string, o?: any) => emit('warn', m, o),
  error: (m: string, o?: any) => emit('error', m, o),
  redact,
};

export default logger;
