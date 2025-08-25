import { generateOutfitCombinations } from '@/services/intelligenceService';
import { WardrobeItem } from '@/types/aynaMirror';

function makeSeededStrategy(seed: number) {
  return () => seed; // Basit sahte strateji
}

test('strategy deterministic', () => {
  const seed = 42;
  const strat = makeSeededStrategy(seed);
  const items: WardrobeItem[] = [
    {
      id: '1',
      userId: 'test-user',
      imageUri: 'test1.jpg',
      category: 'tops',
      colors: ['blue'],
      tags: ['casual'],
      usageStats: {
        itemId: '1',
        totalWears: 0,
        lastWorn: new Date(),
        averageRating: 0,
        complimentsReceived: 0,
        costPerWear: 0,
      },
      styleCompatibility: {},
      confidenceHistory: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      userId: 'test-user',
      imageUri: 'test2.jpg',
      category: 'bottoms',
      colors: ['black'],
      tags: ['formal'],
      usageStats: {
        itemId: '2',
        totalWears: 0,
        lastWorn: new Date(),
        averageRating: 0,
        complimentsReceived: 0,
        costPerWear: 0,
      },
      styleCompatibility: {},
      confidenceHistory: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      userId: 'test-user',
      imageUri: 'test3.jpg',
      category: 'shoes',
      colors: ['brown'],
      tags: ['casual'],
      usageStats: {
        itemId: '3',
        totalWears: 0,
        lastWorn: new Date(),
        averageRating: 0,
        complimentsReceived: 0,
        costPerWear: 0,
      },
      styleCompatibility: {},
      confidenceHistory: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  const r1 = generateOutfitCombinations(items);
  const r2 = generateOutfitCombinations(items);
  expect(new Set(r1.map((i: any) => i.id))).toEqual(new Set(r2.map((i: any) => i.id)));
});
