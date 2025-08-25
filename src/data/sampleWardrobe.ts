interface ClothingItem {
  id: string;
  imageUri: string;
  processedImageUri: string;
  category: string;
  subcategory?: string;
  colors: string[];
  brand?: string;
  size?: string;
  notes?: string;
  purchaseDate?: Date; // Renamed from dateAdded to match WardrobeItem
  tags: string[]; // Added to match WardrobeItem
  usageStats: {
    itemId: string;
    totalWears: number;
    lastWorn: Date | null;
    averageRating: number;
    complimentsReceived: number;
    costPerWear: number;
  }; // Added to match WardrobeItem
  lastWorn?: Date; // Added to match WardrobeItem
  createdAt: Date; // Added to match WardrobeItem
  updatedAt: Date; // Added to match WardrobeItem
}

/**
 * Sample wardrobe data with high-quality images from Unsplash
 * Each item has been carefully selected to match realistic wardrobe pieces
 * with corresponding high-resolution, royalty-free images
 */
export const sampleWardrobeItems: ClothingItem[] = [
  {
    id: 'sample-1',
    imageUri:
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    processedImageUri:
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'Outerwear',
    subcategory: 'Denim Jacket',
    colors: ['Blue', 'Navy'],
    brand: "Levi's",
    size: 'M',
    notes: 'Classic vintage-style denim jacket, perfect for casual outfits',
    purchaseDate: new Date('2024-01-15'),
    tags: ['casual', 'vintage', 'denim'],
    usageStats: {
      itemId: 'sample-1',
      totalWears: 5,
      lastWorn: new Date('2024-01-20'),
      averageRating: 4.5,
      complimentsReceived: 2,
      costPerWear: 15.0,
    },
    lastWorn: new Date('2024-01-20'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 'sample-2',
    imageUri:
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    processedImageUri:
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'Tops',
    subcategory: 'Blouse',
    colors: ['White', 'Cream'],
    brand: 'Zara',
    size: 'S',
    notes: 'Elegant white blouse with subtle texture, great for office or dinner',
    purchaseDate: new Date('2024-01-20'),
    tags: ['elegant', 'office', 'formal'],
    usageStats: {
      itemId: 'sample-2',
      totalWears: 8,
      lastWorn: new Date('2024-01-25'),
      averageRating: 4.8,
      complimentsReceived: 5,
      costPerWear: 8.75,
    },
    lastWorn: new Date('2024-01-25'),
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-25'),
  },
  {
    id: 'sample-3',
    imageUri:
      'https://images.unsplash.com/photo-1566479179817-c0b6b6d6b4b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    processedImageUri:
      'https://images.unsplash.com/photo-1566479179817-c0b6b6d6b4b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'Dresses',
    subcategory: 'Midi Dress',
    colors: ['Black', 'Gray'],
    brand: 'H&M',
    size: 'M',
    notes: 'Versatile black midi dress, perfect for both casual and formal occasions',
    purchaseDate: new Date('2024-01-25'),
    tags: ['versatile', 'midi', 'formal', 'casual'],
    usageStats: {
      itemId: 'sample-3',
      totalWears: 12,
      lastWorn: new Date('2024-02-01'),
      averageRating: 4.9,
      complimentsReceived: 8,
      costPerWear: 6.25,
    },
    lastWorn: new Date('2024-02-01'),
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: 'sample-4',
    imageUri:
      'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    processedImageUri:
      'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'Bottoms',
    subcategory: 'Jeans',
    colors: ['Blue', 'Indigo'],
    brand: 'Calvin Klein',
    size: '29',
    notes: 'High-waisted skinny jeans with excellent stretch and fit',
    purchaseDate: new Date('2024-02-01'),
    tags: ['high-waisted', 'skinny', 'stretch'],
    usageStats: {
      itemId: 'sample-4',
      totalWears: 15,
      lastWorn: new Date('2024-02-05'),
      averageRating: 4.7,
      complimentsReceived: 3,
      costPerWear: 5.33,
    },
    lastWorn: new Date('2024-02-05'),
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-05'),
  },
  {
    id: 'sample-5',
    imageUri:
      'https://images.unsplash.com/photo-1571945153237-4929e783af4a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    processedImageUri:
      'https://images.unsplash.com/photo-1571945153237-4929e783af4a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'Outerwear',
    subcategory: 'Blazer',
    colors: ['Black', 'Charcoal'],
    brand: 'Mango',
    size: 'M',
    notes: 'Professional black blazer with structured shoulders, perfect for business meetings',
    purchaseDate: new Date('2024-02-05'),
    tags: ['professional', 'structured', 'business'],
    usageStats: {
      itemId: 'sample-5',
      totalWears: 6,
      lastWorn: new Date('2024-02-10'),
      averageRating: 4.6,
      complimentsReceived: 4,
      costPerWear: 16.67,
    },
    lastWorn: new Date('2024-02-10'),
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-10'),
  },
  {
    id: 'sample-6',
    imageUri:
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    processedImageUri:
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'Tops',
    subcategory: 'Sweater',
    colors: ['Pink', 'Rose'],
    brand: 'Uniqlo',
    size: 'L',
    notes: 'Cozy pink knit sweater, perfect for chilly days and casual weekends',
    purchaseDate: new Date('2024-02-10'),
    tags: ['cozy', 'knit', 'casual', 'weekend'],
    usageStats: {
      itemId: 'sample-6',
      totalWears: 10,
      lastWorn: new Date('2024-02-15'),
      averageRating: 4.4,
      complimentsReceived: 6,
      costPerWear: 4.5,
    },
    lastWorn: new Date('2024-02-15'),
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-15'),
  },
  {
    id: 'sample-7',
    imageUri:
      'https://images.unsplash.com/photo-1583743089695-4b816a340f82?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    processedImageUri:
      'https://images.unsplash.com/photo-1583743089695-4b816a340f82?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'Bottoms',
    subcategory: 'Trousers',
    colors: ['Beige', 'Tan'],
    brand: 'Massimo Dutti',
    size: '30',
    notes: 'Elegant beige wide-leg trousers, perfect for sophisticated casual looks',
    purchaseDate: new Date('2024-02-15'),
    tags: ['elegant', 'wide-leg', 'sophisticated', 'casual'],
    usageStats: {
      itemId: 'sample-7',
      totalWears: 4,
      lastWorn: new Date('2024-02-20'),
      averageRating: 4.3,
      complimentsReceived: 2,
      costPerWear: 22.5,
    },
    lastWorn: new Date('2024-02-20'),
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-20'),
  },
];

/**
 * Helper function to get items by category
 */
export const getItemsByCategory = (category: string): ClothingItem[] => {
  return sampleWardrobeItems.filter(
    (item) => item.category.toLowerCase() === category.toLowerCase(),
  );
};

/**
 * Helper function to get items by color
 */
export const getItemsByColor = (color: string): ClothingItem[] => {
  return sampleWardrobeItems.filter((item) =>
    item.colors.some((itemColor) => itemColor.toLowerCase() === color.toLowerCase()),
  );
};

/**
 * Helper function to get items by brand
 */
export const getItemsByBrand = (brand: string): ClothingItem[] => {
  return sampleWardrobeItems.filter((item) => item.brand?.toLowerCase() === brand.toLowerCase());
};

/**
 * Helper function to get recently added items
 */
export const getRecentItems = (limit: number = 5): ClothingItem[] => {
  return sampleWardrobeItems
    .sort((a, b) => (b.purchaseDate?.getTime() || 0) - (a.purchaseDate?.getTime() || 0))
    .slice(0, limit);
};

/**
 * Helper function to get random items for recommendations
 */
export const getRandomItems = (count: number = 3): ClothingItem[] => {
  const shuffled = [...sampleWardrobeItems].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export default sampleWardrobeItems;
