// Mock for Supabase client
const mockAuth = {
  getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'test-user-id', email: 'test@example.com' } }, error: null })),
  getSession: jest.fn(() => Promise.resolve({ data: { session: { user: { id: 'test-user-id' } } }, error: null })),
  signInWithPassword: jest.fn(() => Promise.resolve({ data: { user: { id: 'test-user-id' } }, error: null })),
  signUp: jest.fn(() => Promise.resolve({ data: { user: { id: 'test-user-id' } }, error: null })),
  signOut: jest.fn(() => Promise.resolve({ error: null })),
  onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
  resetPasswordForEmail: jest.fn(() => Promise.resolve({ error: null })),
  updateUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'test-user-id' } }, error: null })),
};

// Helper to create a chainable builder whose methods are jest mocks returning self
function createQueryBuilder() {
  const builder = {};
  const self = builder; // alias
  const chain = (fn) => jest.fn(fn).mockReturnValue(self);

  Object.assign(builder, {
    select: chain(),
    insert: chain(),
    update: chain(),
    delete: chain(),
    upsert: chain(),
    eq: chain(),
    neq: chain(),
    gt: chain(),
    gte: chain(),
    lt: chain(),
    lte: chain(),
    like: chain(),
    ilike: chain(),
    in: chain(),
    contains: chain(),
    or: chain(),
    order: chain(),
    limit: chain(),
    range: chain(),
    single: jest.fn(() => Promise.resolve({ data: { id: 'test-id', user_id: 'test-user-id' }, error: null })),
    maybeSingle: jest.fn(() => Promise.resolve({ data: { id: 'test-id' }, error: null })),
  });

  return builder;
}

const supabase = {
  from: jest.fn(() => createQueryBuilder()),
  rpc: jest.fn(() => Promise.resolve({ data: [], error: null })),
  auth: mockAuth,
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