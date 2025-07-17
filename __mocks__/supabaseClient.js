// Mock for Supabase client
const supabase = {
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn(() => Promise.resolve({ data: null, error: null })),
  })),
  rpc: jest.fn(() => Promise.resolve({ data: null, error: null })),
  auth: {
    getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    signIn: jest.fn(() => Promise.resolve({ data: null, error: null })),
    signOut: jest.fn(() => Promise.resolve({ error: null })),
  },
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(() => Promise.resolve({ data: null, error: null })),
      download: jest.fn(() => Promise.resolve({ data: null, error: null })),
      getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'mock-url' } })),
    })),
  },
};

module.exports = { supabase };