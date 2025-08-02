/**
 * Experience Stories Data
 * 
 * Sample data for cinematic story experiences featuring
 * Turkish content and premium styling narratives.
 */

import { ExperienceStory } from '@/components/home/ExperienceStoryBlock';

export const EXPERIENCE_STORIES: ExperienceStory[] = [
  {
    id: 'lilac-style-story',
    title: 'Leylak Stili',
    subtitle: 'Günün her anında zarafet',
    theme: 'Stil Hikayesi',
    backgroundImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop',
    accentColor: '#8B5FBF',
    gradientColors: ['#F8F4FF', '#E6D7FF', '#B19CD9'],
    items: [
      {
        id: 'morning-coffee',
        title: 'Sabah Ritüeli',
        subtitle: 'Güne başlarken',
        description: 'Leylak tonlarında rahat bir bluz ile güne merhaba deyin. Kahvenizin ilk yudumunda bile şık görünün.',
        imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=1000&fit=crop',
        moment: 'Sabah Kahvesi İçin',
        color: '#B19CD9',
        tags: ['Rahat', 'Şık', 'Günlük'],
      },
      {
        id: 'work-elegance',
        title: 'İş Zarafeti',
        subtitle: 'Profesyonel güç',
        description: 'Leylak blazer ile toplantılarınızda fark yaratın. Güç ve zarafeti bir arada sunan mükemmel kombinasyon.',
        imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=1000&fit=crop',
        moment: 'İş Toplantısı İçin',
        color: '#8B5FBF',
        tags: ['Profesyonel', 'Güçlü', 'Zarif'],
      },
      {
        id: 'afternoon-stroll',
        title: 'Öğleden Sonra',
        subtitle: 'Şehirde yürüyüş',
        description: 'Leylak elbise ile şehrin sokaklarında özgürce dolaşın. Her adımınızda kendinizi özel hissedin.',
        imageUrl: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=1000&fit=crop',
        moment: 'Şehir Gezisi İçin',
        color: '#9B7EBD',
        tags: ['Özgür', 'Rahat', 'Feminen'],
      },
      {
        id: 'evening-glow',
        title: 'Akşam Işığı',
        subtitle: 'Gün batımında',
        description: 'Akşamın büyülü ışığında leylak tonları daha da güzelleşir. Kendinizi bir sanat eserine dönüştürün.',
        imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=1000&fit=crop',
        moment: 'Akşam Işığında',
        color: '#7A5BA8',
        tags: ['Büyülü', 'Romantik', 'Özel'],
      },
    ],
  },
  {
    id: 'sage-serenity-story',
    title: 'Adaçayı Huzuru',
    subtitle: 'Doğayla uyum içinde',
    theme: 'Doğa Hikayesi',
    backgroundImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
    accentColor: '#6B7F5A',
    gradientColors: ['#F5F8F2', '#D4E4C8', '#9CAF88'],
    items: [
      {
        id: 'nature-walk',
        title: 'Doğa Yürüyüşü',
        subtitle: 'Ormanın sessizliğinde',
        description: 'Adaçayı yeşili ile doğanın bir parçası olun. Her nefeste huzuru hissedin.',
        imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=1000&fit=crop',
        moment: 'Doğa İçin',
        color: '#9CAF88',
        tags: ['Doğal', 'Huzurlu', 'Organik'],
      },
      {
        id: 'garden-party',
        title: 'Bahçe Partisi',
        subtitle: 'Açık havada şıklık',
        description: 'Yeşil tonlarında elbise ile bahçe partilerinin yıldızı olun.',
        imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=1000&fit=crop',
        moment: 'Bahçe Partisi İçin',
        color: '#7A9B6E',
        tags: ['Taze', 'Canlı', 'Sosyal'],
      },
      {
        id: 'mindful-moment',
        title: 'Bilinçli An',
        subtitle: 'İç huzur',
        description: 'Adaçayının sakinleştirici etkisi ile meditasyon anlarınızı güzelleştirin.',
        imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=1000&fit=crop',
        moment: 'Meditasyon İçin',
        color: '#6B7F5A',
        tags: ['Sakin', 'Bilinçli', 'Zen'],
      },
    ],
  },
  {
    id: 'terracotta-warmth-story',
    title: 'Terrakota Sıcaklığı',
    subtitle: 'Toprakın enerjisi',
    theme: 'Enerji Hikayesi',
    backgroundImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=600&fit=crop',
    accentColor: '#A0522D',
    gradientColors: ['#FFF8E7', '#F4E4BC', '#CD853F'],
    items: [
      {
        id: 'autumn-warmth',
        title: 'Sonbahar Sıcaklığı',
        subtitle: 'Mevsimin renkleri',
        description: 'Terrakota tonları ile sonbaharın sıcaklığını yaşayın. Toprakla bağınızı güçlendirin.',
        imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=1000&fit=crop',
        moment: 'Sonbahar İçin',
        color: '#CD853F',
        tags: ['Sıcak', 'Toprak', 'Doğal'],
      },
      {
        id: 'cozy-evening',
        title: 'Sıcak Akşam',
        subtitle: 'Ev rahatlığı',
        description: 'Kahverengi tonlarında rahat kıyafetler ile evinizde kendinizi özel hissedin.',
        imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=1000&fit=crop',
        moment: 'Evde Rahatlık İçin',
        color: '#B8860B',
        tags: ['Rahat', 'Sıcak', 'Ev'],
      },
    ],
  },
];

// Helper functions
export const getStoryById = (id: string): ExperienceStory | undefined => {
  return EXPERIENCE_STORIES.find(story => story.id === id);
};

export const getFeaturedStory = (): ExperienceStory => {
  return EXPERIENCE_STORIES[0];
};

export const getAllStories = (): ExperienceStory[] => {
  return EXPERIENCE_STORIES;
};