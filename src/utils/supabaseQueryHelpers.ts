// Centralized typed Supabase query helpers to reduce repeated any-based chaining
import { supabase } from '@/config/supabaseClient';

// Generic simple select by user_id with optional select columns, ordering and limit
export interface SimpleSelectOptions {
  columns?: string; // default '*'
  orderBy?: string; // default created_at
  ascending?: boolean; // default false
  limit?: number;
}

export interface SimpleSelectResult<T> {
  data: T[];
  error: { message?: string } | null;
}

export async function selectAllByUser<T extends { user_id?: string; created_at?: string }>(
  table: string,
  userId: string,
  opts: SimpleSelectOptions = {},
): Promise<SimpleSelectResult<T>> {
  const { columns = '*', orderBy = 'created_at', ascending = false, limit } = opts;
  try {
    // Use proper Supabase typing
    let query = supabase
      .from(table)
      .select(columns)
      .eq('user_id', userId)
      .order(orderBy, { ascending });

    if (typeof limit === 'number') {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    return {
      data: (Array.isArray(data) ? data : []) as unknown as T[],
      error: error ? { message: error.message } : null,
    };
  } catch (e) {
    return { data: [], error: { message: e instanceof Error ? e.message : 'unknown error' } };
  }
}

// --- New helper: fetch single row with optional guard ---
export type Result<T> = { ok: true; data: T } | { ok: false; error: Error };

interface MinimalFluent<T = unknown> {
  select(cols: string): this;
  eq(column: string, value: unknown): this;
  order(column: string, opts: { ascending: boolean }): this;
  limit(n: number): this;
  single: <TRes = T>() => Promise<{ data: TRes | null; error: Error | null }>;
}

export async function fetchSingle<T>(
  table: string,
  build?: <Q extends MinimalFluent<T>>(q: Q) => Q,
  guard?: (row: unknown) => row is T,
): Promise<Result<T | null>> {
  try {
    let query = supabase.from(table).select('*').limit(1) as unknown as MinimalFluent<T>;
    if (build) {
      // build may refine chain, keep result typed as MinimalFluent
      query = build(query) as unknown as MinimalFluent<T>;
    }
    const { data, error } = await query.single<T | null>();
    if (error) {
      throw error;
    }
    if (!data) {
      return { ok: true, data: null };
    }
    if (guard && !guard(data)) {
      return { ok: false, error: new Error('Guard failed for ' + table) };
    }
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e : new Error(String(e)) };
  }
}

// Simple guard factory for required string id
export const hasStringId = <T extends { id?: unknown }>(row: T): row is T & { id: string } =>
  !!row && typeof row.id === 'string' && row.id.length > 0;

// Retry wrapper for database operations
export async function callWrapped<T>(
  operation?: () => Promise<T>,
  maxRetries: number = 1,
): Promise<T | void> {
  let retryCount = 0;

  while (retryCount <= maxRetries) {
    try {
      if (operation) {
        return await operation();
      }
      return;
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error as { code: string }).code === '40001' &&
        retryCount < maxRetries
      ) {
        retryCount++;
        // Log retry attempt if logger is available
        if (
          typeof global !== 'undefined' &&
          'logger' in global &&
          global.logger &&
          typeof global.logger === 'object' &&
          'info' in global.logger
        ) {
          (global.logger as { info: (data: unknown) => void }).info({ retry_count: retryCount });
        }
        continue;
      }
      throw error;
    }
  }
}
