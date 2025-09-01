import { create } from 'zustand';
import { WardrobeItem } from '@/types/wardrobe';
import { WardrobeService } from '@/services/wardrobeService';

interface WardrobeState {
  items: WardrobeItem[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchItems: () => Promise<void>;
  addItem: (item: Omit<WardrobeItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateItem: (id: string, updates: Partial<WardrobeItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useWardrobeStore = create<WardrobeState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const items = await WardrobeService.getWardrobeItems();
      set({ items, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gardırop öğeleri yüklenirken hata oluştu';
      set({ error: errorMessage, isLoading: false });
    }
  },

  addItem: async (itemData) => {
    set({ isLoading: true, error: null });
    try {
      const newItem = await WardrobeService.createWardrobeItem(itemData);
      const currentItems = get().items;
      set({ 
        items: [newItem, ...currentItems], 
        isLoading: false 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Öğe eklenirken hata oluştu';
      set({ error: errorMessage, isLoading: false });
      throw error; // Re-throw to allow component-level handling
    }
  },

  updateItem: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updatedItem = await WardrobeService.updateWardrobeItem(id, updates);
      const currentItems = get().items;
      const updatedItems = currentItems.map(item => 
        item.id === id ? updatedItem : item
      );
      set({ items: updatedItems, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Öğe güncellenirken hata oluştu';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deleteItem: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await WardrobeService.deleteWardrobeItem(id);
      const currentItems = get().items;
      const filteredItems = currentItems.filter(item => item.id !== id);
      set({ items: filteredItems, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Öğe silinirken hata oluştu';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));

// Selectors for better performance
export const useWardrobeItems = () => useWardrobeStore(state => state.items);
export const useWardrobeLoading = () => useWardrobeStore(state => state.isLoading);
export const useWardrobeError = () => useWardrobeStore(state => state.error);
export const useWardrobeActions = () => useWardrobeStore(state => ({
  fetchItems: state.fetchItems,
  addItem: state.addItem,
  updateItem: state.updateItem,
  deleteItem: state.deleteItem,
  clearError: state.clearError,
  setLoading: state.setLoading,
}));