/**
 * Product Components Export Index
 *
 * Centralized exports for all product-related components
 */

// Main Product Card Component
export type { ProductCardData, ProductCardProps } from './ProductCard';
export { default as ProductCard, ProductCard as ProductCardComponent } from './ProductCard';

// Product Card Showcase Component
export {
  default as ProductCardShowcase,
  ProductCardShowcase as ProductCardShowcaseComponent,
} from './ProductCardShowcase';

// Import types for internal use
import type { ProductCardData } from './ProductCard';

// Sample Data for Testing
export const SAMPLE_PRODUCT_DATA: ProductCardData[] = [
  {
    id: '1',
    title: 'Minimalist Cashmere Coat',
    subtitle: 'Timeless Elegance',
    brand: 'AYNAMODA',
    price: '₺2,850',
    originalPrice: '₺3,200',
    imageUrl: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=600&fit=crop',
    category: 'Outerwear',
    tags: ['Cashmere', 'Minimalist'],
    colors: ['#F5F5DC', '#8B4513', '#2F4F4F'],
    isLiked: false,
    isNew: true,
    discount: 11,
    rating: 4.8,
    reviewCount: 124,
  },
  {
    id: '2',
    title: 'Silk Midi Dress',
    subtitle: 'Evening Grace',
    brand: 'AYNAMODA',
    price: '₺1,650',
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=600&fit=crop',
    category: 'Dresses',
    tags: ['Silk', 'Evening'],
    colors: ['#000000', '#8B0000'],
    isLiked: true,
    rating: 4.6,
    reviewCount: 89,
  },
  {
    id: '3',
    title: 'Structured Blazer',
    subtitle: 'Power Dressing',
    brand: 'AYNAMODA',
    price: '₺2,100',
    originalPrice: '₺2,400',
    imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop',
    category: 'Blazers',
    tags: ['Professional', 'Structured'],
    colors: ['#000000', '#FFFFFF', '#808080'],
    isLiked: false,
    discount: 13,
    rating: 4.7,
    reviewCount: 156,
  },
  {
    id: '4',
    title: 'Luxury Handbag',
    subtitle: 'Artisan Crafted',
    brand: 'ARUOM',
    price: '₺3,500',
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=600&fit=crop',
    category: 'Accessories',
    tags: ['Leather', 'Luxury'],
    colors: ['#8B4513', '#000000'],
    isLiked: true,
    isNew: true,
    rating: 4.9,
    reviewCount: 67,
  },
  {
    id: '5',
    title: 'Statement Earrings',
    subtitle: 'Bold Expression',
    brand: 'FIRED',
    price: '₺850',
    originalPrice: '₺1,000',
    imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=600&fit=crop',
    category: 'Jewelry',
    tags: ['Statement', 'Gold'],
    colors: ['#FFD700', '#FF6B6B'],
    isLiked: false,
    discount: 15,
    rating: 4.5,
    reviewCount: 43,
  },
  {
    id: '6',
    title: 'Cashmere Scarf',
    subtitle: 'Soft Luxury',
    brand: 'AYNAMODA',
    price: '₺750',
    imageUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=600&fit=crop',
    category: 'Accessories',
    tags: ['Cashmere', 'Soft'],
    colors: ['#F5F5DC', '#D2B48C', '#8B4513'],
    isLiked: true,
    rating: 4.4,
    reviewCount: 78,
  },
];

// Product Categories
export const PRODUCT_CATEGORIES = [
  'Tümü',
  'Outerwear',
  'Dresses',
  'Blazers',
  'Accessories',
  'Jewelry',
  'Shoes',
  'Bags',
  'Tops',
  'Bottoms',
];

// Product Brands
export const PRODUCT_BRANDS = ['Tümü', 'AYNAMODA', 'ARUOM', 'FIRED'];

// Sort Options
export const PRODUCT_SORT_OPTIONS = [
  { label: 'Önerilen', value: 'recommended' },
  { label: 'Fiyat: Düşük-Yüksek', value: 'price_asc' },
  { label: 'Fiyat: Yüksek-Düşük', value: 'price_desc' },
  { label: 'Yeni Ürünler', value: 'newest' },
  { label: 'En Çok Beğenilen', value: 'rating' },
  { label: 'İndirimli Ürünler', value: 'discount' },
];

// Price Ranges
export const PRICE_RANGES = [
  { label: 'Tümü', min: 0, max: Infinity },
  { label: '₺0 - ₺500', min: 0, max: 500 },
  { label: '₺500 - ₺1,000', min: 500, max: 1000 },
  { label: '₺1,000 - ₺2,000', min: 1000, max: 2000 },
  { label: '₺2,000 - ₺3,000', min: 2000, max: 3000 },
  { label: '₺3,000+', min: 3000, max: Infinity },
];

// Utility Functions
export const formatPrice = (price: string): number => {
  return parseFloat(price.replace('₺', '').replace(',', ''));
};

export const calculateDiscount = (originalPrice: string, currentPrice: string): number => {
  const original = formatPrice(originalPrice);
  const current = formatPrice(currentPrice);
  return Math.round(((original - current) / original) * 100);
};

export const filterProductsByCategory = (
  products: ProductCardData[],
  category: string,
): ProductCardData[] => {
  if (category === 'Tümü') {
    return products;
  }
  return products.filter((product) => product.category === category);
};

export const filterProductsByBrand = (
  products: ProductCardData[],
  brand: string,
): ProductCardData[] => {
  if (brand === 'Tümü') {
    return products;
  }
  return products.filter((product) => product.brand === brand);
};

export const filterProductsByPriceRange = (
  products: ProductCardData[],
  min: number,
  max: number,
): ProductCardData[] => {
  return products.filter((product) => {
    const price = formatPrice(product.price);
    return price >= min && price <= max;
  });
};

export const sortProducts = (products: ProductCardData[], sortBy: string): ProductCardData[] => {
  const sorted = [...products];

  switch (sortBy) {
    case 'price_asc':
      return sorted.sort((a, b) => formatPrice(a.price) - formatPrice(b.price));
    case 'price_desc':
      return sorted.sort((a, b) => formatPrice(b.price) - formatPrice(a.price));
    case 'newest':
      return sorted.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    case 'rating':
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case 'discount':
      return sorted.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    default:
      return sorted;
  }
};
