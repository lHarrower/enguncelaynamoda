export interface WeeklyColorStory {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  colorName: string;
  description: string;
  image: string;
  mood: string;
  styling: string[];
}

export interface DailyStylePick {
  id: string;
  title: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  description: string;
  tags: string[];
}

export interface EditorialStory {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  readTime: string;
  image: string;
  excerpt: string;
  category: 'trend' | 'styling' | 'interview' | 'guide';
}

export const weeklyColorStories: WeeklyColorStory[] = [
  {
    id: '1',
    title: 'Lavender Dreams',
    subtitle: 'This Week\'s Color Story',
    color: '#B794FF',
    colorName: 'Soft Lavender',
    description: 'Embrace the ethereal beauty of lavender - a color that whispers confidence and speaks to the soul.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop',
    mood: 'Dreamy & Confident',
    styling: ['Pair with cream neutrals', 'Add gold jewelry', 'Mix with soft textures'],
  },
  {
    id: '2',
    title: 'Golden Hour',
    subtitle: 'Next Week\'s Inspiration',
    color: '#FCD34D',
    colorName: 'Warm Gold',
    description: 'Capture the magic of golden hour with warm, luminous tones that radiate inner light.',
    image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=600&fit=crop',
    mood: 'Radiant & Warm',
    styling: ['Layer with earth tones', 'Complement with bronze', 'Perfect for evening wear'],
  },
];

export const dailyStylePicks: DailyStylePick[] = [
  {
    id: '1',
    title: 'Silk Camisole',
    brand: 'Everlane',
    price: 68,
    originalPrice: 85,
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=400&fit=crop',
    category: 'Tops',
    description: 'Effortless elegance in pure silk',
    tags: ['versatile', 'silk', 'minimalist'],
  },
  {
    id: '2',
    title: 'Linen Wide-Leg Trousers',
    brand: 'COS',
    price: 89,
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=400&fit=crop',
    category: 'Bottoms',
    description: 'Relaxed sophistication for modern living',
    tags: ['linen', 'wide-leg', 'comfortable'],
  },
  {
    id: '3',
    title: 'Cashmere Cardigan',
    brand: 'Arket',
    price: 149,
    originalPrice: 199,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop',
    category: 'Knitwear',
    description: 'Luxurious comfort in timeless design',
    tags: ['cashmere', 'cardigan', 'luxury'],
  },
];

export const editorialStories: EditorialStory[] = [
  {
    id: '1',
    title: 'The Art of Slow Fashion',
    subtitle: 'Building a Mindful Wardrobe',
    author: 'Sarah Chen',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop',
    excerpt: 'Discover how to curate a wardrobe that reflects your values and stands the test of time.',
    category: 'guide',
  },
  {
    id: '2',
    title: 'Parisian Minimalism',
    subtitle: 'Effortless Elegance Decoded',
    author: 'Marie Dubois',
    readTime: '3 min read',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=300&fit=crop',
    excerpt: 'The secrets behind that coveted French girl style that never goes out of fashion.',
    category: 'styling',
  },
  {
    id: '3',
    title: 'Sustainable Luxury',
    subtitle: 'The Future of Fashion',
    author: 'Emma Thompson',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&h=300&fit=crop',
    excerpt: 'How luxury brands are reimagining their approach to sustainability without compromising on quality.',
    category: 'trend',
  },
];