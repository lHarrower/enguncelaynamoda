// Utility helpers for safe JSON parsing to avoid pervasive `any`.
// Provides typed parsing with optional runtime guards.

export type Guard<T> = (value: unknown) => value is T;

export function safeParse<T>(raw: string | null | undefined, fallback: T, guard?: Guard<T>): T {
  if (raw == null) {
    return fallback;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (guard && !guard(parsed)) {
      return fallback;
    }
    return (parsed as T) ?? fallback;
  } catch {
    return fallback;
  }
}

export const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

export const isArrayOf =
  <T>(guard: Guard<T>): Guard<T[]> =>
  (v: unknown): v is T[] =>
    Array.isArray(v) && v.every(guard);
