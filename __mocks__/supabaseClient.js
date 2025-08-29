// Mock for Supabase client
const mockAuth = {
  getUser: jest.fn(() =>
    Promise.resolve({
      data: { user: { id: 'test-user-id', email: 'user@aynamoda.com' } },
      error: null,
    }),
  ),
  getSession: jest.fn(() =>
    Promise.resolve({ data: { session: { user: { id: 'test-user-id' } } }, error: null }),
  ),
  signInWithPassword: jest.fn(() =>
    Promise.resolve({ data: { user: { id: 'test-user-id' } }, error: null }),
  ),
  signUp: jest.fn(() => Promise.resolve({ data: { user: { id: 'test-user-id' } }, error: null })),
  signOut: jest.fn(() => Promise.resolve({ error: null })),
  onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
  resetPasswordForEmail: jest.fn(() => Promise.resolve({ error: null })),
  updateUser: jest.fn(() =>
    Promise.resolve({ data: { user: { id: 'test-user-id' } }, error: null }),
  ),
};

// Helper to create a chainable builder whose methods are jest mocks returning self
function createQueryBuilder() {
  const builder = {};

  // Create chainable methods that return the builder
  const chainableMethods = [
    'select',
    'insert',
    'update',
    'delete',
    'upsert',
    'eq',
    'neq',
    'gt',
    'gte',
    'lt',
    'lte',
    'like',
    'ilike',
    'in',
    'contains',
    'or',
    'order',
    'limit',
    'range',
    'not',
  ];

  chainableMethods.forEach((method) => {
    builder[method] = jest.fn(() => builder);
  });

  // Terminal methods that return promises
  builder.single = jest.fn(() =>
    Promise.resolve({
      data: { id: 'test-id', user_id: 'test-user-id', usage_count: 1 },
      error: null,
    }),
  );

  builder.maybeSingle = jest.fn(() =>
    Promise.resolve({
      data: { id: 'test-id', user_id: 'test-user-id', usage_count: 0 },
      error: null,
    }),
  );

  // Add other terminal methods
  builder.then = jest.fn((resolve) => {
    const result = {
      data: [{ id: 'test-id', user_id: 'test-user-id', usage_count: 0 }],
      error: null,
    };
    return Promise.resolve(result).then(resolve);
  });

  return builder;
}

const supabase = {
  from: jest.fn(() => createQueryBuilder()),
  rpc: jest.fn(() => Promise.resolve({ data: [], error: null })),
  auth: mockAuth,
  functions: {
    invoke: jest.fn(() => Promise.resolve({ data: { result: 'test-result' }, error: null })),
  },
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(() => Promise.resolve({ data: { path: 'test-path' }, error: null })),
      download: jest.fn(() => Promise.resolve({ data: new Blob(), error: null })),
      remove: jest.fn(() => Promise.resolve({ data: null, error: null })),
      list: jest.fn(() => Promise.resolve({ data: [], error: null })),
      getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'https://test-url.com/image.jpg' } })),
    })),
  },
};

// Export both named and default exports, and provide a helper for tests
module.exports = { supabase, mockAuth };
module.exports.default = supabase;
module.exports.mockSupabase = supabase;
