// Wardrobe Types - Enums and constants for wardrobe management
// This file provides enum versions of types for easier testing and usage

import { ItemCategory } from './aynaMirror';

// Enum version of ItemCategory for easier testing
export enum WardrobeCategory {
  TOPS = 'tops',
  BOTTOMS = 'bottoms', 
  SHOES = 'shoes',
  ACCESSORIES = 'accessories',
  OUTERWEAR = 'outerwear',
  DRESSES = 'dresses',
  ACTIVEWEAR = 'activewear'
}

// Common wardrobe colors enum
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
  CREAM = 'cream'
}

// Type aliases for compatibility
export type WardrobeCategoryType = ItemCategory;
export type WardrobeColorType = string;

// Helper functions
export const getWardrobeCategoryValues = (): string[] => {
  return Object.values(WardrobeCategory);
};

export const getWardrobeColorValues = (): string[] => {
  return Object.values(WardrobeColor);
};

// Validation functions
export const isValidWardrobeCategory = (category: string): category is ItemCategory => {
  return Object.values(WardrobeCategory).includes(category as WardrobeCategory);
};

export const isValidWardrobeColor = (color: string): boolean => {
  return Object.values(WardrobeColor).includes(color as WardrobeColor);
};