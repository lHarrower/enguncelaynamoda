// Performance tests for WardrobeService
import { WardrobeService } from '../../services/WardrobeService';
import { createMockWardrobeItem } from '../utils/testUtils';
import { WardrobeCategory, WardrobeColor } from '../../types/wardrobe';
import { mocks } from '../mocks';

// Mock dependencies
jest.mock('../../config/supabaseClient', () => mocks.supabaseClient);
jest.mock('@react-native-async-storage/async-storage', () => mocks.asyncStorage);

describe('WardrobeService Performance', () => {
  let wardrobeService: WardrobeService;
  const mockSupabase = mocks.supabaseClient;

  beforeEach(() => {
    jest.clearAllMocks();
    wardrobeService = new WardrobeService();
    
    // Reset cache
    (wardrobeService as any).cache.clear();
  });

  describe('large dataset handling', () => {
    it('should handle loading 1000+ wardrobe items efficiently', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, index) => 
        createMockWardrobeItem({
          id: `item-${index}`,
          name: `Item ${index}`,
          category: Object.values(WardrobeCategory)[index % Object.values(WardrobeCategory).length],
          colors: [Object.values(WardrobeColor)[index % Object.values(WardrobeColor).length]],
        })
      );

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: largeDataset,
              error: null,
            }),
          }),
        }),
      });

      const startTime = performance.now();
      const result = await wardrobeService.getAllItems('user-id');
      const endTime = performance.now();

      expect(result).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should efficiently search through large datasets', async () => {
      const largeDataset = Array.from({ length: 5000 }, (_, index) => 
        createMockWardrobeItem({
          id: `item-${index}`,
          name: `${index % 2 === 0 ? 'Summer' : 'Winter'} Item ${index}`,
          category: Object.values(WardrobeCategory)[index % Object.values(WardrobeCategory).length],
        })
      );

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            or: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: largeDataset.filter(item => item.name.includes('Summer')),
                error: null,
              }),
            }),
          }),
        }),
      });

      const startTime = performance.now();
      const result = await wardrobeService.searchItems('user-id', 'Summer');
      const endTime = performance.now();

      expect(result.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(500); // Should complete within 500ms
    });

    it('should handle bulk operations efficiently', async () => {
      const bulkItems = Array.from({ length: 100 }, (_, index) => 
        createMockWardrobeItem({
          id: `bulk-item-${index}`,
          name: `Bulk Item ${index}`,
        })
      );

      mockSupabase.from.mockReturnValue({
        upsert: jest.fn().mockResolvedValue({
          data: bulkItems,
          error: null,
        }),
      });

      const startTime = performance.now();
      await wardrobeService.bulkUpdateItems('user-id', bulkItems);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });

  describe('caching performance', () => {
    it('should significantly improve performance with caching', async () => {
      const testData = Array.from({ length: 100 }, (_, index) => 
        createMockWardrobeItem({ id: `cached-item-${index}` })
      );

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: testData,
              error: null,
            }),
          }),
        }),
      });

      // First call (cache miss)
      const startTime1 = performance.now();
      await wardrobeService.getAllItems('user-id');
      const endTime1 = performance.now();
      const firstCallTime = endTime1 - startTime1;

      // Second call (cache hit)
      const startTime2 = performance.now();
      await wardrobeService.getAllItems('user-id');
      const endTime2 = performance.now();
      const secondCallTime = endTime2 - startTime2;

      // Cache hit should be significantly faster
      expect(secondCallTime).toBeLessThan(firstCallTime * 0.1);
      expect(secondCallTime).toBeLessThan(10); // Should be under 10ms
    });

    it('should handle cache invalidation efficiently', async () => {
      const testData = [createMockWardrobeItem()];

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: testData,
              error: null,
            }),
          }),
        }),
        insert: jest.fn().mockResolvedValue({
          data: [createMockWardrobeItem({ id: 'new-item' })],
          error: null,
        }),
      });

      // Load initial data
      await wardrobeService.getAllItems('user-id');

      // Add new item (should invalidate cache)
      const startTime = performance.now();
      await wardrobeService.addItem('user-id', createMockWardrobeItem({ id: 'new-item' }));
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should manage memory usage with large cache', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Load multiple large datasets
      for (let i = 0; i < 10; i++) {
        const dataset = Array.from({ length: 1000 }, (_, index) => 
          createMockWardrobeItem({ id: `dataset-${i}-item-${index}` })
        );

        mockSupabase.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: dataset,
                error: null,
              }),
            }),
          }),
        });

        await wardrobeService.getAllItems(`user-${i}`);
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe('concurrent operations', () => {
    it('should handle multiple concurrent reads efficiently', async () => {
      const testData = Array.from({ length: 100 }, (_, index) => 
        createMockWardrobeItem({ id: `concurrent-item-${index}` })
      );

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: testData,
              error: null,
            }),
          }),
        }),
      });

      const startTime = performance.now();
      
      // Execute 10 concurrent reads
      const promises = Array.from({ length: 10 }, () => 
        wardrobeService.getAllItems('user-id')
      );
      
      const results = await Promise.all(promises);
      const endTime = performance.now();

      expect(results).toHaveLength(10);
      expect(results.every(result => result.length === 100)).toBe(true);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });

    it('should handle mixed read/write operations', async () => {
      const readData = [createMockWardrobeItem({ id: 'read-item' })];
      const writeData = createMockWardrobeItem({ id: 'write-item' });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: readData,
              error: null,
            }),
          }),
        }),
        insert: jest.fn().mockResolvedValue({
          data: [writeData],
          error: null,
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [writeData],
            error: null,
          }),
        }),
      });

      const startTime = performance.now();
      
      // Execute mixed operations concurrently
      const promises = [
        wardrobeService.getAllItems('user-id'),
        wardrobeService.addItem('user-id', writeData),
        wardrobeService.getAllItems('user-id'),
        wardrobeService.updateItem('user-id', 'write-item', { name: 'Updated Item' }),
        wardrobeService.getAllItems('user-id'),
      ];
      
      await Promise.all(promises);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(3000); // Should complete within 3 seconds
    });

    it('should prevent race conditions in cache updates', async () => {
      const testData = [createMockWardrobeItem({ id: 'race-item' })];

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: testData,
              error: null,
            }),
          }),
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [{ ...testData[0], name: 'Updated' }],
            error: null,
          }),
        }),
      });

      // Execute concurrent cache-affecting operations
      const promises = [
        wardrobeService.getAllItems('user-id'),
        wardrobeService.updateItem('user-id', 'race-item', { name: 'Update 1' }),
        wardrobeService.updateItem('user-id', 'race-item', { name: 'Update 2' }),
        wardrobeService.getAllItems('user-id'),
      ];

      // Should not throw or cause inconsistent state
      await expect(Promise.all(promises)).resolves.toBeDefined();
    });
  });

  describe('memory and resource management', () => {
    it('should clean up resources properly', async () => {
      const testData = Array.from({ length: 1000 }, (_, index) => 
        createMockWardrobeItem({ id: `cleanup-item-${index}` })
      );

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: testData,
              error: null,
            }),
          }),
        }),
      });

      const initialMemory = process.memoryUsage().heapUsed;

      // Perform operations
      await wardrobeService.getAllItems('user-id');
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryDifference = Math.abs(finalMemory - initialMemory);

      // Memory usage should be reasonable
      expect(memoryDifference).toBeLessThan(20 * 1024 * 1024); // Less than 20MB
    });

    it('should handle rapid successive operations without memory leaks', async () => {
      const testData = [createMockWardrobeItem()];

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: testData,
              error: null,
            }),
          }),
        }),
      });

      const initialMemory = process.memoryUsage().heapUsed;

      // Perform 1000 rapid operations
      for (let i = 0; i < 1000; i++) {
        await wardrobeService.getAllItems('user-id');
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be minimal
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB
    });
  });

  describe('error handling performance', () => {
    it('should handle errors efficiently without performance degradation', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockRejectedValue(new Error('Database error')),
          }),
        }),
      });

      const startTime = performance.now();
      
      // Execute multiple failing operations
      const promises = Array.from({ length: 10 }, () => 
        wardrobeService.getAllItems('user-id').catch(() => null)
      );
      
      await Promise.all(promises);
      const endTime = performance.now();

      // Error handling should not significantly impact performance
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should recover quickly from temporary failures', async () => {
      let callCount = 0;
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockImplementation(() => {
              callCount++;
              if (callCount <= 3) {
                return Promise.reject(new Error('Temporary failure'));
              }
              return Promise.resolve({
                data: [createMockWardrobeItem()],
                error: null,
              });
            }),
          }),
        }),
      });

      const startTime = performance.now();
      
      // Should eventually succeed after failures
      const result = await wardrobeService.getAllItems('user-id').catch(() => 
        wardrobeService.getAllItems('user-id').catch(() => 
          wardrobeService.getAllItems('user-id').catch(() => 
            wardrobeService.getAllItems('user-id')
          )
        )
      );
      
      const endTime = performance.now();

      expect(result).toHaveLength(1);
      expect(endTime - startTime).toBeLessThan(2000);
    });
  });

  describe('scalability tests', () => {
    it('should scale linearly with data size', async () => {
      const dataSizes = [100, 500, 1000, 2000];
      const times: number[] = [];

      for (const size of dataSizes) {
        const dataset = Array.from({ length: size }, (_, index) => 
          createMockWardrobeItem({ id: `scale-item-${index}` })
        );

        mockSupabase.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: dataset,
                error: null,
              }),
            }),
          }),
        });

        const startTime = performance.now();
        await wardrobeService.getAllItems(`user-${size}`);
        const endTime = performance.now();
        
        times.push(endTime - startTime);
      }

      // Performance should scale reasonably (not exponentially)
      const ratio1 = times[1] / times[0]; // 500/100
      const ratio2 = times[2] / times[1]; // 1000/500
      const ratio3 = times[3] / times[2]; // 2000/1000

      // Ratios should be reasonable (less than 10x)
      expect(ratio1).toBeLessThan(10);
      expect(ratio2).toBeLessThan(10);
      expect(ratio3).toBeLessThan(10);
    });

    it('should handle increasing user load', async () => {
      const userCounts = [10, 50, 100];
      const times: number[] = [];

      for (const userCount of userCounts) {
        const testData = [createMockWardrobeItem()];

        mockSupabase.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: testData,
                error: null,
              }),
            }),
          }),
        });

        const startTime = performance.now();
        
        // Simulate multiple users
        const promises = Array.from({ length: userCount }, (_, index) => 
          wardrobeService.getAllItems(`user-${index}`)
        );
        
        await Promise.all(promises);
        const endTime = performance.now();
        
        times.push(endTime - startTime);
      }

      // Should handle increased load reasonably
      expect(times[2]).toBeLessThan(times[0] * 20); // 100 users shouldn't be 20x slower than 10
    });
  });
});