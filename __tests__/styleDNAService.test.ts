import { styleDNAService } from '@/services/styleDNAService';
import { supabase } from '@/config/supabaseClient';

// Mock the supabase client
jest.mock('@/config/supabaseClient');
const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('StyleDNAService basic generation', () => {
  // Mock fetch & supabase simple behaviors
  beforeAll(() => {
    // Mock environment variable
    process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME = 'test-cloud';
    // @ts-ignore
    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes('cloudinary.com')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              asset_id: 'test-asset-id',
              public_id: 'test-public-id',
              width: 800,
              height: 600,
              format: 'jpg',
              resource_type: 'image',
              created_at: '2024-01-01T00:00:00Z',
              bytes: 123456,
              type: 'upload',
              colors: ['blue', 'white', 'black'],
              tags: ['casual', 'modern', 'comfortable'],
              url: 'https://res.cloudinary.com/test/image/upload/test.jpg',
              secure_url: 'https://res.cloudinary.com/test/image/upload/test.jpg',
            }),
        });
      }

      // Mock for photo URI fetch
      return Promise.resolve({
        ok: true,
        blob: () => Promise.resolve(new Blob(['fake image data'], { type: 'image/jpeg' })),
      });
    });
  });

  it('generates a Style DNA profile with expected structure', async () => {
    const photos = [1, 2, 3].map((i) => ({
      id: `p${i}`,
      uri: `file://p${i}.jpg`,
      timestamp: Date.now(),
    }));

    // Setup mocks for storage operations
    const mockStorage = {
      from: jest.fn().mockReturnValue({
        upload: jest
          .fn()
          .mockResolvedValue({ data: { path: 'style-dna/user1/p1.jpg' }, error: null }),
        getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'http://example/img.jpg' } }),
      }),
    };

    // Setup mocks for database operations
    const mockFrom = jest.fn().mockReturnValue({
      upsert: jest.fn().mockResolvedValue({
        data: { id: 'style-dna-1', user_id: 'user1' },
        error: null,
      }),
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    });

    // Apply mocks to the supabase client
    mockSupabase.storage = mockStorage as any;
    mockSupabase.from = mockFrom as any;
    const result = await styleDNAService.generateStyleDNA('user1', photos as any);

    expect(result.userId).toBe('user1');
    // The service should extract colors from the mock response
    expect(result.visualAnalysis.dominantColors).toEqual(['blue', 'white', 'black']);
    expect(result.visualAnalysis.dominantColors.length).toBeGreaterThan(0);
    expect(result.stylePersonality.primary).toBeTruthy();
    expect(result.colorPalette.primary.length + result.colorPalette.neutral.length).toBeGreaterThan(
      0,
    );
  });
});
