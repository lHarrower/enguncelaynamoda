import { create } from 'zustand'
import { ClothingItem, ClothingFilter, WardrobeState } from '@/types'

interface WardrobeStore extends WardrobeState {
  // Actions
  setItems: (items: ClothingItem[]) => void
  addItem: (item: ClothingItem) => void
  updateItem: (id: string, updates: Partial<ClothingItem>) => void
  removeItem: (id: string) => void
  setSelectedItem: (item: ClothingItem | null) => void
  setFilters: (filters: Partial<ClothingFilter>) => void
  clearFilters: () => void
  setViewMode: (mode: 'grid' | 'list') => void
  setSortBy: (sortBy: 'name' | 'date' | 'category' | 'color') => void
  setSortOrder: (order: 'asc' | 'desc') => void
  setLoading: (loading: boolean) => void
  applyFilters: () => void
}

const initialFilters: ClothingFilter = {
  categories: [],
  colors: [],
  tags: [],
  seasons: [],
  brands: [],
  sizes: [],
  search: ''
}

export const useWardrobeStore = create<WardrobeStore>((set, get) => ({
  items: [],
  filteredItems: [],
  selectedItem: null,
  filters: initialFilters,
  viewMode: 'grid',
  sortBy: 'date',
  sortOrder: 'desc',
  isLoading: false,

  setItems: (items) => {
    set({ items })
    get().applyFilters()
  },

  addItem: (item) => {
    const { items } = get()
    const newItems = [item, ...items]
    set({ items: newItems })
    get().applyFilters()
  },

  updateItem: (id, updates) => {
    const { items } = get()
    const newItems = items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    )
    set({ items: newItems })
    get().applyFilters()
  },

  removeItem: (id) => {
    const { items, selectedItem } = get()
    const newItems = items.filter(item => item.id !== id)
    const newSelectedItem = selectedItem?.id === id ? null : selectedItem
    set({ items: newItems, selectedItem: newSelectedItem })
    get().applyFilters()
  },

  setSelectedItem: (item) => set({ selectedItem: item }),

  setFilters: (newFilters) => {
    const { filters } = get()
    const updatedFilters = { ...filters, ...newFilters }
    set({ filters: updatedFilters })
    get().applyFilters()
  },

  clearFilters: () => {
    set({ filters: initialFilters })
    get().applyFilters()
  },

  setViewMode: (viewMode) => set({ viewMode }),

  setSortBy: (sortBy) => {
    set({ sortBy })
    get().applyFilters()
  },

  setSortOrder: (sortOrder) => {
    set({ sortOrder })
    get().applyFilters()
  },

  setLoading: (isLoading) => set({ isLoading }),

  applyFilters: () => {
    const { items, filters, sortBy, sortOrder } = get()
    
    let filtered = [...items]

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.brand?.toLowerCase().includes(searchLower) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(item =>
        filters.categories!.includes(item.category)
      )
    }

    if (filters.colors && filters.colors.length > 0) {
      filtered = filtered.filter(item =>
        item.colors.some(color => filters.colors!.includes(color))
      )
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(item =>
        item.tags.some(tag => filters.tags!.includes(tag))
      )
    }

    if (filters.seasons && filters.seasons.length > 0) {
      filtered = filtered.filter(item =>
        item.season?.some(season => filters.seasons!.includes(season))
      )
    }

    if (filters.brands && filters.brands.length > 0) {
      filtered = filtered.filter(item =>
        item.brand && filters.brands!.includes(item.brand)
      )
    }

    if (filters.sizes && filters.sizes.length > 0) {
      filtered = filtered.filter(item =>
        item.size && filters.sizes!.includes(item.size)
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'date':
          aValue = new Date(a.created_at)
          bValue = new Date(b.created_at)
          break
        case 'category':
          aValue = a.category
          bValue = b.category
          break
        case 'color':
          aValue = a.colors[0] || ''
          bValue = b.colors[0] || ''
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    set({ filteredItems: filtered })
  }
})) 