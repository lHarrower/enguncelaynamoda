// Wardrobe Provider - Context for wardrobe management
import React, { createContext, ReactNode, useContext, useEffect, useReducer } from 'react';

import { WardrobeItem } from '@/types/aynaMirror';
import { warnInDev } from '@/utils/consoleSuppress';

import { safeParse } from '../utils/safeJSON';
import { secureStorage } from '../utils/secureStorage';

interface WardrobeState {
  items: WardrobeItem[];
  favorites: string[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: string | null;
  sortBy: 'name' | 'date' | 'category';
}

type WardrobeAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ITEMS'; payload: WardrobeItem[] }
  | { type: 'ADD_ITEM'; payload: WardrobeItem }
  | { type: 'UPDATE_ITEM'; payload: WardrobeItem }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SELECTED_CATEGORY'; payload: string | null }
  | { type: 'SET_SORT_BY'; payload: 'name' | 'date' | 'category' }
  | { type: 'SET_FAVORITES'; payload: string[] };

interface WardrobeContextType {
  state: WardrobeState;
  dispatch: React.Dispatch<WardrobeAction>;
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

const WardrobeContext = createContext<WardrobeContextType | undefined>(undefined);

const initialState: WardrobeState = {
  items: [],
  favorites: [],
  loading: false,
  error: null,
  searchQuery: '',
  selectedCategory: null,
  sortBy: 'date',
};

function wardrobeReducer(state: WardrobeState, action: WardrobeAction): WardrobeState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_ITEMS':
      return { ...state, items: action.payload, loading: false, error: null };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map((item) => (item.id === action.payload.id ? action.payload : item)),
      };
    case 'DELETE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
        favorites: state.favorites.filter((id) => id !== action.payload),
      };
    case 'TOGGLE_FAVORITE':
      const isFavorite = state.favorites.includes(action.payload);
      return {
        ...state,
        favorites: isFavorite
          ? state.favorites.filter((id) => id !== action.payload)
          : [...state.favorites, action.payload],
      };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_SELECTED_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    case 'SET_SORT_BY':
      return { ...state, sortBy: action.payload };
    case 'SET_FAVORITES':
      return { ...state, favorites: action.payload };
    default:
      return state;
  }
}

interface WardrobeProviderProps {
  children: ReactNode;
  initialItems?: WardrobeItem[];
}

export function WardrobeProvider({ children, initialItems = [] }: WardrobeProviderProps) {
  const [state, dispatch] = useReducer(wardrobeReducer, {
    ...initialState,
    items: initialItems,
  });

  // Load favorites from storage on mount
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        await secureStorage.initialize();
        const stored = await secureStorage.getItem('wardrobe_favorites');
        if (stored) {
          const parsed = safeParse<unknown>(stored, []);
          const favs = Array.isArray(parsed)
            ? parsed.filter((v): v is string => typeof v === 'string')
            : [];
          dispatch({ type: 'SET_FAVORITES', payload: favs });
        }
      } catch (error) {
        warnInDev('Failed to load favorites:', error);
      }
    };
    loadFavorites();
  }, []);

  // Save favorites to storage when they change
  useEffect(() => {
    const saveFavorites = async () => {
      try {
        await secureStorage.initialize();
        await secureStorage.setItem('wardrobe_favorites', JSON.stringify(state.favorites));
      } catch (error) {
        warnInDev('Failed to save favorites:', error);
      }
    };
    saveFavorites();
  }, [state.favorites]);

  const addItem = (item: WardrobeItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const updateItem = (item: WardrobeItem) => {
    dispatch({ type: 'UPDATE_ITEM', payload: item });
  };

  const deleteItem = (id: string) => {
    dispatch({ type: 'DELETE_ITEM', payload: id });
  };

  const toggleFavorite = (id: string) => {
    dispatch({ type: 'TOGGLE_FAVORITE', payload: id });
  };

  const setSearchQuery = (query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  };

  const setSelectedCategory = (category: string | null) => {
    dispatch({ type: 'SET_SELECTED_CATEGORY', payload: category });
  };

  const setSortBy = (sortBy: 'name' | 'date' | 'category') => {
    dispatch({ type: 'SET_SORT_BY', payload: sortBy });
  };

  const getFilteredItems = (): WardrobeItem[] => {
    let filtered = [...state.items];

    // Apply search filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name?.toLowerCase().includes(query) ||
          item.tags?.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    // Apply category filter
    if (state.selectedCategory) {
      filtered = filtered.filter((item) => item.category === state.selectedCategory);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (state.sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'category':
          return (a.category || '').localeCompare(b.category || '');
        case 'date':
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });

    return filtered;
  };

  const getFavoriteItems = (): WardrobeItem[] => {
    return state.items.filter((item) => state.favorites.includes(item.id));
  };

  const value: WardrobeContextType = {
    state,
    dispatch,
    addItem,
    updateItem,
    deleteItem,
    toggleFavorite,
    setSearchQuery,
    setSelectedCategory,
    setSortBy,
    getFilteredItems,
    getFavoriteItems,
  };

  return <WardrobeContext.Provider value={value}>{children}</WardrobeContext.Provider>;
}

export function useWardrobe(): WardrobeContextType {
  const context = useContext(WardrobeContext);
  if (context === undefined) {
    throw new Error('useWardrobe must be used within a WardrobeProvider');
  }
  return context;
}

export default WardrobeProvider;
