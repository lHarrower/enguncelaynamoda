// Gardırop Tipleri - Gardırop yönetimi için enum'lar ve sabitler
// Bu dosya test ve kullanım kolaylığı için tiplerin enum versiyonlarını sağlar

import { ItemCategory } from './aynaMirror';

// Daha kolay test için ItemCategory'nin enum versiyonu
export enum WardrobeCategory {
  TOPS = 'tops',
  BOTTOMS = 'bottoms',
  SHOES = 'shoes',
  ACCESSORIES = 'accessories',
  OUTERWEAR = 'outerwear',
  DRESSES = 'dresses',
  ACTIVEWEAR = 'activewear',
}

// Yaygın gardırop renkleri enum'u
export enum WardrobeColor {
  BLACK = 'black',
  WHITE = 'white',
  BLUE = 'blue',
  RED = 'red',
  GREEN = 'green',
  YELLOW = 'yellow',
  PURPLE = 'purple',
  PINK = 'pink',
  ORANGE = 'orange',
  BROWN = 'brown',
  GRAY = 'gray',
  GREY = 'grey',
  NAVY = 'navy',
  BEIGE = 'beige',
  CREAM = 'cream',
}

// Uyumluluk için tip takma adları
export type WardrobeCategoryType = ItemCategory;
export type WardrobeColorType = string;

// Yardımcı fonksiyonlar
export const getWardrobeCategoryValues = (): string[] => {
  return Object.values(WardrobeCategory);
};

export const getWardrobeColorValues = (): string[] => {
  return Object.values(WardrobeColor);
};

// Doğrulama fonksiyonları
export const isValidWardrobeCategory = (category: string): category is ItemCategory => {
  return Object.values(WardrobeCategory).includes(category as WardrobeCategory);
};

export const isValidWardrobeColor = (color: string): boolean => {
  return Object.values(WardrobeColor).includes(color as WardrobeColor);
};
