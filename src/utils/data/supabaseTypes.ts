import { QueryResponse, Row, TableName } from '@/types/database';

export function isQueryResponse<T>(val: unknown): val is QueryResponse<T> {
  return !!val && typeof val === 'object' && val !== null && 'data' in val && 'error' in val;
}

export interface NormalisedResult<T> {
  rows: T[];
  error?: string;
}

export function normaliseRows<T>(val: unknown): NormalisedResult<T> {
  if (isQueryResponse<T>(val)) {
    return { rows: Array.isArray(val.data) ? val.data : [], error: val.error?.message };
  }
  if (Array.isArray(val)) {
    return { rows: val as T[] };
  }
  if (val && typeof val === 'object') {
    return { rows: [val as T] };
  } // single object fallback
  return { rows: [] };
}

export function assertTable<T extends TableName>(rows: unknown[], _table: T): Row<T>[] {
  return rows as Row<T>[]; // minimal runtime validation
}
