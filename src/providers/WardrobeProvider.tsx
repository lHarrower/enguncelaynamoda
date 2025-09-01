// Wardrobe Provider - Wrapper for backward compatibility
// Note: This provider now uses the global Zustand store for state management
import React, { ReactNode, useEffect } from 'react';

import { WardrobeItem } from '@/types/aynaMirror';
import { warnInDev } from '@/utils/consoleSuppress';
import { 
  useWardrobeItems,
  useWardrobeFavorites,
  useWardrobeLoading,
  useWardrobeError,
  useWardrobeSearchQuery,
  useWardrobeSelectedCategory,
  useWardrobeSortBy,
  useWardrobeActions,
  useFilteredWardrobeItems,
  useFavoriteWardrobeItems
} from '@/store/globalStore';

import { safeParse } from '@/utils/safeJSON';
import { secureStorage } from '@/utils/secureStorage';

// Legacy interface for backward compatibility
interface WardrobeState {
  items: WardrobeItem[];
  favorites: string[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: string | null;
  sortBy: 'name' | 'date' | 'category';
}

// Legacy context type for backward compatibility
interface WardrobeContextType {
  state: WardrobeState;
  dispatch: React.Dispatch<any>; // Not used anymore, kept for compatibility
  addItem: (item: WardrobeItem) => void;
  updateItem: (item: WardrobeItem) => void;
  deleteItem: (id: string) => void;
  toggleFavorite: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setSortBy: (sortBy: 'name' | 'date' | 'category') => void;
  getFilteredItems: () => WardrobeItem[];
  getFavoriteItems: () => WardrobeItem[];
}

// Legacy context - kept for backward compatibility but uses global store
const WardrobeContext = React.createContext<WardrobeContextType | undefined>(undefined);

// Legacy hook that wraps the global store for backward compatibility
function useWardrobeState(): WardrobeContextType {
  const items = useWardrobeItems();
  const favorites = useWardrobeFavorites();
  const loading = useWardrobeLoading();
  const error = useWardrobeError();
  const searchQuery = useWardrobeSearchQuery();
  const selectedCategory = useWardrobeSelectedCategory();
  const sortBy = useWardrobeSortBy();
  
  const actions = useWardrobeActions();
  const filteredItems = useFilteredWardrobeItems();
  const favoriteItems = useFavoriteWardrobeItems();
  
  // Create legacy state object
  const state: WardrobeState = {
    items,
    favorites,
    loading,
    error,
    searchQuery,
    selectedCategory,
    sortBy,
  };
  
  return {
    state,
    dispatch: () => {}, // Legacy dispatch - not used anymore
    addItem: actions.addWardrobeItem,
    updateItem: actions.updateWardrobeItem,
    deleteItem: actions.removeWardrobeItem,
    toggleFavorite: actions.toggleWardrobeFavorite,
    setSearchQuery: actions.setWardrobeSearchQuery,
    setSelectedCategory: actions.setWardrobeSelectedCategory,
    setSortBy: actions.setWardrobeSortBy,
    getFilteredItems: () => filteredItems,
    getFavoriteItems: () => favoriteItems,
  };
}

interface WardrobeProviderProps {
  children: ReactNode;
  initialItems?: WardrobeItem[]; // Kept for backward compatibility but not used
}

export function WardrobeProvider({ children, initialItems = [] }: WardrobeProviderProps) {
  const wardrobeState = useWardrobeState();
  const actions = useWardrobeActions();

  // Initialize wardrobe items if provided (backward compatibility)
  useEffect(() => {
    if (initialItems.length > 0) {
      actions.setWardrobeItems(initialItems);
    }
  }, [initialItems, actions]);

  // Load favorites from storage on mount (migration from old storage)
  useEffect(() => {
    const loadLegacyFavorites = async () => {
      try {
        await secureStorage.initialize();
        const stored = await secureStorage.getItem('wardrobe_favorites');
        if (stored) {
          const parsed = safeParse<unknown>(stored, []);
          const favs = Array.isArray(parsed)
            ? parsed.filter((v): v is string => typeof v === 'string')
            : [];
          
          // Migrate to global store if we have legacy favorites
          const currentFavorites = wardrobeState.state.favorites;
          if (currentFavorites.length === 0 && favs.length > 0) {
            // Migrate each favorite individually
            favs.forEach(id => actions.toggleWardrobeFavorite(id));
            // Clean up old storage
            await secureStorage.removeItem('wardrobe_favorites');
          }
        }
      } catch (error) {
        warnInDev('Failed to load legacy favorites:', error);
      }
    };
    loadLegacyFavorites();
  }, [actions, wardrobeState.state.favorites]);

  return <WardrobeContext.Provider value={wardrobeState}>{children}</WardrobeContext.Provider>;
}

// Legacy hook for backward compatibility
export function useWardrobe(): WardrobeContextType {
  const context = React.useContext(WardrobeContext);
  if (context === undefined) {
    throw new Error('useWardrobe must be used within a WardrobeProvider');
  }
  return context;
}

// Export the new hooks for direct use (recommended)
export {
  useWardrobeItems,
  useWardrobeFavorites,
  useWardrobeLoading,
  useWardrobeError,
  useWardrobeSearchQuery,
  useWardrobeSelectedCategory,
  useWardrobeSortBy,
  useWardrobeActions,
  useFilteredWardrobeItems,
  useFavoriteWardrobeItems
} from '@/store/globalStore';

export default WardrobeProvider;
