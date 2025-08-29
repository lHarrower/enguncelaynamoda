// Unified, type-safe Supabase result handling utilities
import { PostgrestError, PostgrestSingleResponse } from '@supabase/supabase-js';

import { errorInDev, logInDev } from './consoleSuppress';

export interface SupabaseOk<T> {
  ok: true;
  data: T;
  error: null;
}
export interface SupabaseErr {
  ok: false;
  data: null;
  error: PostgrestError | { message: string };
}
export type SupabaseResult<T> = SupabaseOk<T> | SupabaseErr;

// Narrow helper
export const isSupabaseOk = <T>(r: SupabaseResult<T>): r is SupabaseOk<T> => r.ok;

// Convert raw supabase response (single or array) to unified result
export function toResult<T>(resp: PostgrestSingleResponse<T>): SupabaseResult<T> {
  if (resp.error) {
    return { ok: false, data: null, error: resp.error };
  }
  if (resp.data === null || resp.data === undefined) {
    return { ok: false, data: null, error: { message: 'Empty data' } };
  }
  return { ok: true, data: resp.data, error: null };
}

// Wrap an async supabase call producing PostgrestSingleResponse<T>
export async function wrap<T>(
  fn: () => Promise<PostgrestSingleResponse<T>>,
): Promise<SupabaseResult<T>> {
  try {
    const resp = await fn();
    return toResult(resp);
  } catch (error) {
    errorInDev('Supabase call failed (wrap)', error instanceof Error ? error : String(error));
    return { ok: false, data: null, error: { message: 'Exception executing supabase call' } };
  }
}

// Optional logging decorator
export async function wrapWithLog<T>(
  label: string,
  fn: () => Promise<PostgrestSingleResponse<T>>,
): Promise<SupabaseResult<T>> {
  const res = await wrap(fn);
  if (!res.ok) {
    errorInDev(`[supabase:${label}] failed`, res.error);
  } else {
    logInDev(`[supabase:${label}] success`);
  }
  return res;
}
