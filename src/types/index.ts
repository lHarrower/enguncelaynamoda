// AYNA Mirror Tipleri - Toplu Dışa Aktarım
// Tüm AYNA Mirror ile ilgili tipler için merkezi dışa aktarım

export * from '@/types/aynaMirror';
export * from '@/types/user';
export * from '@/types/wardrobe';

// Test uyumluluğu için seçili ekran dışa aktarımları
export { AddItemScreen } from '@/screens/AddItemScreen';
export {
  buildOutfitFeedback,
  buildOutfitRecommendation,
  buildWardrobeItem,
  testBuilders,
} from '@/test/builders';

// Not: Tipler zaten '@/types/aynaMirror' üzerinden toplu olarak dışa aktarılıyor.
