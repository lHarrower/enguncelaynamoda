// Centralized lightweight Supabase Postgrest query chain mock to satisfy TypeScript surface in tests
// Not a feature addition; purely for type/test stabilization.
type FluentFn<R> = jest.Mock & {
  mockReturnValue: (value: unknown) => FluentFn<R>;
  mockResolvedValue: (value: unknown) => FluentFn<R>;
};

interface PostgrestSingleResult<T = unknown> {
  data: T | null;
  error: unknown; // allow null implicitly (tests ignore)
}

// Minimal fluent chain surface we rely on inside tests/services
export interface PostgrestFluent<T = unknown> {
  select: FluentFn<PostgrestFluent<T>>;
  insert: FluentFn<PostgrestFluent<T>>;
  update: FluentFn<PostgrestFluent<T>>;
  delete: FluentFn<PostgrestFluent<T>>;
  upsert: FluentFn<PostgrestFluent<T>>;
  eq: FluentFn<PostgrestFluent<T>>;
  neq: FluentFn<PostgrestFluent<T>>;
  gt: FluentFn<PostgrestFluent<T>>;
  gte: FluentFn<PostgrestFluent<T>>;
  lt: FluentFn<PostgrestFluent<T>>;
  lte: FluentFn<PostgrestFluent<T>>;
  ilike: FluentFn<PostgrestFluent<T>>;
  like: FluentFn<PostgrestFluent<T>>;
  in: FluentFn<PostgrestFluent<T>>;
  contains: FluentFn<PostgrestFluent<T>>;
  order: FluentFn<PostgrestFluent<T>>;
  limit: FluentFn<PostgrestFluent<T>>;
  single: FluentFn<PostgrestSingleResult<T>>;
  maybeSingle: FluentFn<PostgrestSingleResult<T>>;
  // Allow test overrides injection while keeping chain typing
  [k: string]: unknown;
}

export function createPostgrestBuilder<T = unknown>(
  overrides: Partial<PostgrestFluent<T>> = {},
): PostgrestFluent<T> {
  const createMockFn = () => {
    const fn = jest.fn().mockReturnValue(undefined);
    fn.mockReturnValue = jest.fn().mockReturnValue(fn);
    fn.mockResolvedValue = jest.fn().mockReturnValue(fn);
    return fn;
  };

  const builder: Record<string, unknown> = {
    select: createMockFn(),
    insert: createMockFn(),
    update: createMockFn(),
    delete: createMockFn(),
    upsert: createMockFn(),
    eq: createMockFn(),
    neq: createMockFn(),
    gt: createMockFn(),
    gte: createMockFn(),
    lt: createMockFn(),
    lte: createMockFn(),
    ilike: createMockFn(),
    like: createMockFn(),
    in: createMockFn(),
    contains: createMockFn(),
    order: createMockFn(),
    limit: createMockFn(),
    single: jest.fn().mockReturnValue({ data: null, error: null }),
    maybeSingle: jest.fn().mockReturnValue({ data: null, error: null }),
    ...overrides,
  };

  Object.keys(builder).forEach((k) => {
    const val = builder[k];
    if (typeof val === 'function') {
      const original = val as (...a: unknown[]) => unknown;
      builder[k] = (...args: unknown[]) => {
        const r = original(...args);
        return r === undefined ? (builder as PostgrestFluent<T>) : r;
      };
    }
  });
  return builder as PostgrestFluent<T>;
}

export interface SupabaseClientMock {
  from: (table: string) => PostgrestFluent;
  auth: { getUser: () => Promise<{ data: { user: { id: string } } | null; error: null }> };
  storage: Record<string, never>;
  rpc: jest.Mock;
  _builders: Record<string, PostgrestFluent>;
}

export function createSupabaseClientMock(): SupabaseClientMock {
  const tableBuilders: Record<string, PostgrestFluent> = {};
  return {
    from: jest.fn((table: string) => {
      if (!tableBuilders[table]) {
        tableBuilders[table] = createPostgrestBuilder();
      }
      return tableBuilders[table];
    }),
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null }),
    },
    storage: {},
    rpc: jest.fn(),
    _builders: tableBuilders,
  };
}
