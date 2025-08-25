// Personal Sanctuary - Sample Data
// Sample wardrobe items and saved outfits for development

import { ClothingItem, MoodTag, Outfit } from '@/data/sanctuaryModels';

export const SAMPLE_WARDROBE: ClothingItem[] = [
  {
    id: '1',
    name: 'Silk Blouse',
    category: 'tops',
    colors: ['White', 'Cream'],
    imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop',
    brand: 'Zara',
    notes: 'Perfect for work meetings',
    lastWorn: new Date('2024-01-10'),
    dateAdded: new Date('2024-01-01'),
    wearCount: 8,
    confidenceScore: 9,
  },
  {
    id: '2',
    name: 'Pleated Skirt',
    category: 'bottoms',
    colors: ['Cream', 'Beige'],
    imageUrl: 'https://images.unsplash.com/photo-1583496661160-fb5886a13d77?w=400&h=500&fit=crop',
    brand: 'COS',
    notes: 'Comfortable and elegant',
    lastWorn: new Date('2024-01-08'),
    dateAdded: new Date('2024-01-02'),
    wearCount: 5,
    confidenceScore: 8,
  },
  {
    id: '3',
    name: 'Summer Dress',
    category: 'dresses',
    colors: ['Lavender', 'Purple'],
    imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=500&fit=crop',
    brand: 'Mango',
    notes: 'Makes me feel feminine',
    lastWorn: new Date('2024-01-15'),
    dateAdded: new Date('2024-01-03'),
    wearCount: 3,
    confidenceScore: 9,
  },
  {
    id: '4',
    name: 'Pearl Earrings',
    category: 'accessories',
    colors: ['White', 'Silver'],
    imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=500&fit=crop',
    brand: 'Pandora',
    notes: 'Timeless elegance',
    lastWorn: new Date('2024-01-12'),
    dateAdded: new Date('2024-01-04'),
    wearCount: 12,
    confidenceScore: 10,
  },
  {
    id: '5',
    name: 'Black Blazer',
    category: 'outerwear',
    colors: ['Black'],
    imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop',
    brand: 'H&M',
    notes: 'Power dressing essential',
    lastWorn: new Date('2024-01-05'),
    dateAdded: new Date('2024-01-05'),
    wearCount: 15,
    confidenceScore: 9,
  },
  {
    id: '6',
    name: 'White Sneakers',
    category: 'shoes',
    colors: ['White'],
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=500&fit=crop',
    brand: 'Adidas',
    notes: 'Everyday comfort',
    lastWorn: new Date('2024-01-14'),
    dateAdded: new Date('2024-01-06'),
    wearCount: 20,
    confidenceScore: 7,
  },
  {
    id: '7',
    name: 'Denim Jacket',
    category: 'outerwear',
    colors: ['Blue', 'Navy'],
    imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=500&fit=crop',
    brand: "Levi's",
    notes: 'Casual weekend vibes',
    lastWorn: new Date('2023-12-20'),
    dateAdded: new Date('2024-01-07'),
    wearCount: 4,
    confidenceScore: 8,
  },
  {
    id: '8',
    name: 'Gold Necklace',
    category: 'accessories',
    colors: ['Gold'],
    imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=500&fit=crop',
    brand: 'Mejuri',
    notes: 'Adds warmth to any outfit',
    lastWorn: new Date('2024-01-13'),
    dateAdded: new Date('2024-01-08'),
    wearCount: 6,
    confidenceScore: 8,
  },
];

// Helper to safely gather items while honoring strict noUncheckedIndexedAccess
const pickItems = (...indices: number[]): ClothingItem[] =>
  indices.map((i) => SAMPLE_WARDROBE[i]).filter((i): i is ClothingItem => Boolean(i));

export const SAMPLE_SAVED_OUTFITS: Outfit[] = [
  {
    id: 'saved-outfit-luminous-office-001',
    name: 'Luminous Office Look',
    items: pickItems(0, 1, 3, 4), // Blouse, Skirt, Earrings, Blazer
    moodTag: 'Luminous & Confident',
    whisper: 'Step into your power with grace.',
    createdAt: new Date('2024-01-10'),
    lastWorn: new Date('2024-01-10'),
    isFavorite: true,
    confidenceScore: 9,
  },
  {
    id: 'saved-outfit-creative-weekend-002',
    name: 'Creative Weekend Ensemble',
    items: pickItems(2, 6, 5, 7), // Dress, Jacket, Sneakers, Necklace
    moodTag: 'Creative & Inspired',
    whisper: 'Your creativity knows no bounds.',
    createdAt: new Date('2024-01-12'),
    isFavorite: true,
    confidenceScore: 8,
  },
  {
    id: 'saved-outfit-serene-everyday-003',
    name: 'Serene Everyday Look',
    items: pickItems(0, 5, 7), // Blouse, Sneakers, Necklace
    moodTag: 'Serene & Grounded',
    whisper: 'Find beauty in simplicity today.',
    createdAt: new Date('2024-01-14'),
    isFavorite: false,
    confidenceScore: 8,
  },
  {
    id: 'saved-outfit-elegant-evening-004',
    name: 'Elegant Evening Style',
    items: pickItems(2, 3), // Dress, Earrings
    moodTag: 'Elegant & Refined',
    whisper: 'Grace is your natural state.',
    createdAt: new Date('2024-01-16'),
    isFavorite: true,
    confidenceScore: 9,
  },
  {
    id: 'saved-outfit-playful-casual-005',
    name: 'Playful Casual Mix',
    items: pickItems(6, 5, 7), // Jacket, Sneakers, Necklace
    moodTag: 'Joyful & Playful',
    whisper: 'Your joy is contagious and beautiful.',
    createdAt: new Date('2024-01-18'),
    isFavorite: false,
    confidenceScore: 7,
  },
];

export const MOOD_COLORS: Record<MoodTag, string> = {
  'Serene & Grounded': '#E8F5E8',
  'Luminous & Confident': '#FFF9E6',
  'Creative & Inspired': '#F3E8FF',
  'Joyful & Playful': '#FFE8F0',
  'Elegant & Refined': '#F8F9FA',
  'Bold & Adventurous': '#FFE8E8',
};

export const MOOD_DESCRIPTIONS: Record<MoodTag, string> = {
  'Serene & Grounded': 'Calm confidence that speaks volumes',
  'Luminous & Confident': 'Radiant energy that lights up every room',
  'Creative & Inspired': 'Artistic vision that knows no bounds',
  'Joyful & Playful': 'Infectious joy that celebrates life',
  'Elegant & Refined': 'Timeless sophistication that never fades',
  'Bold & Adventurous': 'Fearless spirit that breaks boundaries',
};
