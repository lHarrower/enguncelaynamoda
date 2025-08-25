// Global ambient declarations & legacy compatibility shims

// PermissionStatus legacy literals
declare type PermissionStatus = 'granted' | 'denied' | 'undetermined' | (string & NonNullable<unknown>);

// TypeError constructor accepting optional message (some tests call with message)
interface TypeErrorConstructor {
  new (message?: string): TypeError;
  (message?: string): TypeError;
  readonly prototype: TypeError;
}
declare let TypeError: TypeErrorConstructor;

// Minimal fluent Supabase chain shape for tests (when jest mocks return partials)
interface SupabaseFluentQuery {
  select: (...args: unknown[]) => SupabaseFluentQuery;
  insert: (...args: unknown[]) => SupabaseFluentQuery;
  update: (...args: unknown[]) => SupabaseFluentQuery;
  delete: (...args: unknown[]) => SupabaseFluentQuery;
  upsert?: (...args: unknown[]) => SupabaseFluentQuery;
  eq: (...args: unknown[]) => SupabaseFluentQuery;
  neq: (...args: unknown[]) => SupabaseFluentQuery;
  gt?: (...args: unknown[]) => SupabaseFluentQuery;
  gte?: (...args: unknown[]) => SupabaseFluentQuery;
  lt?: (...args: unknown[]) => SupabaseFluentQuery;
  lte?: (...args: unknown[]) => SupabaseFluentQuery;
  in?: (...args: unknown[]) => SupabaseFluentQuery;
  contains?: (...args: unknown[]) => SupabaseFluentQuery;
  maybeSingle?: (...args: unknown[]) => Promise<unknown> | SupabaseFluentQuery;
  single?: (...args: unknown[]) => Promise<unknown> | SupabaseFluentQuery;
  order?: (...args: unknown[]) => SupabaseFluentQuery;
  limit?: (...args: unknown[]) => SupabaseFluentQuery;
  range?: (...args: unknown[]) => SupabaseFluentQuery;
  returns?: (...args: unknown[]) => SupabaseFluentQuery;
}

declare global {
  // Allow any jest mock shaped object to satisfy the chain expectation in TS

  namespace jest {
    interface Matchers<R> {
      // placeholder to avoid empty block
    }
  }
}

export {};
