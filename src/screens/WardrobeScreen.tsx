// Enhanced Wardrobe Screen with AI Naming Integration
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  Sort,
  ViewModule,
  ViewList,
  Settings,
  AutoAwesome,
  Edit,
  Delete,
  Refresh,
  MoreVert,
  Tune
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { WardrobeItem, ItemCategory } from '@/types/aynaMirror';
import { WardrobeItemCard } from '@/components/sanctuary/WardrobeItemCard';
import { WardrobeItemForm } from '@/components/wardrobe/WardrobeItemForm';
import { AINameGenerator } from '@/components/naming/AINameGenerator';
import { NamingPreferences } from '@/components/naming/NamingPreferences';
import { useAINaming } from '@/hooks/useAINaming';
import { enhancedWardrobeService } from '@/services/enhancedWardrobeService';

interface FilterOptions {
  category: ItemCategory | 'all';
  colors: string[];
  brands: string[];
  hasAIName: boolean | null;
  searchQuery: string;
}

interface SortOptions {
  field: 'name' | 'category' | 'createdAt' | 'lastWorn' | 'wearCount';
  direction: 'asc' | 'desc';
}

const CATEGORIES: (ItemCategory | 'all')[] = [
  'all',
  'tops',
  'bottoms',
  'dresses',
  'shoes',
  'accessories',
  'outerwear',
  'activewear'
];

export const WardrobeScreen: React.FC = () => {
  const { preferences, generateName, isLoading } = useAINaming();
  
  // State management
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);
  
  // Dialog states
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter and sort states
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'all',
    colors: [],
    brands: [],
    hasAIName: null,
    searchQuery: ''
  });
  
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: 'createdAt',
    direction: 'desc'
  });
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAIIndicators, setShowAIIndicators] = useState(true);
  
  // Menu states
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [itemMenuAnchor, setItemMenuAnchor] = useState<null | HTMLElement>(null);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'info' });

  // Load wardrobe items
  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await enhancedWardrobeService.supabase
        .from('wardrobe_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      const wardrobeItems: WardrobeItem[] = (data || []).map(record => ({
        id: record.id,
        userId: record.user_id,
        name: record.name,
        aiGeneratedName: record.ai_generated_name,
        nameOverride: record.name_override,
        imageUri: record.image_uri,
        processedImageUri: record.processed_image_uri,
        category: record.category as ItemCategory,
        subcategory: record.subcategory,
        colors: record.colors || [],
        brand: record.brand,
        size: record.size,
        purchaseDate: record.purchase_date,
        purchasePrice: record.purchase_price,
        tags: record.tags || [],
        notes: record.notes,
        usageStats: {
          wearCount: record.usage_count || 0,
          lastWorn: record.last_worn ? new Date(record.last_worn) : undefined,
          averageWearInterval: 0,
          seasonalUsage: {},
          occasionUsage: {}
        },
        styleCompatibility: [],
        confidenceHistory: [],
        createdAt: new Date(record.created_at),
        updatedAt: new Date(record.updated_at),
        aiAnalysisData: record.ai_analysis_data
      }));

      setItems(wardrobeItems);
      setError(null);
    } catch (err) {
      console.error('Error loading wardrobe items:', err);
      setError(err instanceof Error ? err.message : 'Failed to load items');
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...items];

    // Apply filters
    if (filters.category !== 'all') {
      filtered = filtered.filter(item => item.category === filters.category);
    }

    if (filters.colors.length > 0) {
      filtered = filtered.filter(item => 
        item.colors.some(color => filters.colors.includes(color))
      );
    }

    if (filters.brands.length > 0) {
      filtered = filtered.filter(item => 
        item.brand && filters.brands.includes(item.brand)
      );
    }

    if (filters.hasAIName !== null) {
      filtered = filtered.filter(item => {
        const hasAI = !item.nameOverride && !!item.aiGeneratedName;
        return filters.hasAIName ? hasAI : !hasAI;
      });
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        const effectiveName = getEffectiveName(item).toLowerCase();
        return effectiveName.includes(query) ||
               item.category.toLowerCase().includes(query) ||
               (item.brand && item.brand.toLowerCase().includes(query)) ||
               item.colors.some(color => color.toLowerCase().includes(query)) ||
               item.tags.some(tag => tag.toLowerCase().includes(query));
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortOptions.field) {
        case 'name':
          aValue = getEffectiveName(a);
          bValue = getEffectiveName(b);
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        case 'createdAt':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        case 'lastWorn':
          aValue = a.usageStats?.lastWorn || new Date(0);
          bValue = b.usageStats?.lastWorn || new Date(0);
          break;
        case 'wearCount':
          aValue = a.usageStats?.wearCount || 0;
          bValue = b.usageStats?.wearCount || 0;
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }

      if (aValue < bValue) return sortOptions.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOptions.direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredItems(filtered);
  }, [items, filters, sortOptions]);

  // Load items on mount
  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Helper functions
  const getEffectiveName = (item: WardrobeItem): string => {
    if (item.name && item.nameOverride) {
      return item.name;
    }
    if (item.aiGeneratedName) {
      return item.aiGeneratedName;
    }
    return item.name || 'Unnamed Item';
  };

  const getUniqueColors = (): string[] => {
    const colors = new Set<string>();
    items.forEach(item => item.colors.forEach(color => colors.add(color)));
    return Array.from(colors).sort();
  };

  const getUniqueBrands = (): string[] => {
    const brands = new Set<string>();
    items.forEach(item => item.brand && brands.add(item.brand));
    return Array.from(brands).sort();
  };

  // Event handlers
  const handleItemClick = (item: WardrobeItem) => {
    setSelectedItem(item);
    setShowEditForm(true);
  };

  const handleItemLongPress = (item: WardrobeItem) => {
    setSelectedItem(item);
    // Could open context menu or quick actions
  };

  const handleSaveItem = async (item: WardrobeItem) => {
    try {
      await loadItems(); // Refresh the list
      setShowAddForm(false);
      setShowEditForm(false);
      setSelectedItem(null);
      setSnackbar({
        open: true,
        message: 'Item saved successfully!',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to save item',
        severity: 'error'
      });
    }
  };

  const handleDeleteItem = async (item: WardrobeItem) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const { error } = await enhancedWardrobeService.supabase
        .from('wardrobe_items')
        .delete()
        .eq('id', item.id);

      if (error) {
        throw new Error(error.message);
      }

      await loadItems();
      setSnackbar({
        open: true,
        message: 'Item deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to delete item',
        severity: 'error'
      });
    }
  };

  const handleRegenerateAIName = async (item: WardrobeItem) => {
    try {
      const newName = await enhancedWardrobeService.regenerateItemName(item.id);
      if (newName) {
        await loadItems();
        setSnackbar({
          open: true,
          message: 'AI name regenerated successfully!',
          severity: 'success'
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to regenerate AI name',
        severity: 'error'
      });
    }
  };

  const handleBulkAIGeneration = async () => {
    const itemsWithoutNames = items.filter(item => 
      !item.name && !item.aiGeneratedName
    );

    if (itemsWithoutNames.length === 0) {
      setSnackbar({
        open: true,
        message: 'All items already have names',
        severity: 'info'
      });
      return;
    }

    try {
      setLoading(true);
      let successCount = 0;
      
      for (const item of itemsWithoutNames) {
        try {
          await enhancedWardrobeService.regenerateItemName(item.id);
          successCount++;
        } catch (err) {
          console.warn(`Failed to generate name for item ${item.id}:`, err);
        }
      }

      await loadItems();
      setSnackbar({
        open: true,
        message: `Generated names for ${successCount} items`,
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to generate names',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && items.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Typography>Loading wardrobe...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            My Wardrobe
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Bulk AI Name Generation">
              <LoadingButton
                variant="outlined"
                startIcon={<AutoAwesome />}
                onClick={handleBulkAIGeneration}
                loading={isLoading}
                size="small"
              >
                Generate Names
              </LoadingButton>
            </Tooltip>
            
            <Tooltip title="Refresh">
              <IconButton onClick={loadItems}>
                <Refresh />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Settings">
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                <MoreVert />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Stats */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Chip label={`${items.length} items`} variant="outlined" />
          <Chip 
            label={`${items.filter(item => !item.nameOverride && item.aiGeneratedName).length} AI named`} 
            color="primary" 
            variant="outlined" 
          />
          <Chip 
            label={`${items.filter(item => item.nameOverride && item.name).length} custom named`} 
            color="secondary" 
            variant="outlined" 
          />
        </Box>

        {/* Search and Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search items..."
            value={filters.searchQuery}
            onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
            sx={{ minWidth: 300 }}
          />
          
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value as any }))}
              label="Category"
            >
              {CATEGORIES.map(category => (
                <MenuItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setShowFilters(true)}
          >
            More Filters
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<Sort />}
            onClick={() => {
              const newDirection = sortOptions.direction === 'asc' ? 'desc' : 'asc';
              setSortOptions(prev => ({ ...prev, direction: newDirection }));
            }}
          >
            Sort {sortOptions.direction === 'asc' ? '↑' : '↓'}
          </Button>
          
          <Tooltip title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}>
            <IconButton onClick={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}>
              {viewMode === 'grid' ? <ViewList /> : <ViewModule />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No items found
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {items.length === 0 
              ? "Start building your wardrobe by adding your first item!"
              : "Try adjusting your filters or search query."
            }
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowAddForm(true)}
          >
            Add First Item
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {filteredItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
              <WardrobeItemCard
                item={item}
                onPress={() => handleItemClick(item)}
                onLongPress={() => handleItemLongPress(item)}
                showAIIndicator={showAIIndicators}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setShowAddForm(true)}
      >
        <Add />
      </Fab>

      {/* Settings Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => { setShowPreferences(true); setAnchorEl(null); }}>
          <ListItemIcon><Settings /></ListItemIcon>
          <ListItemText>Naming Preferences</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setShowAIIndicators(!showAIIndicators); setAnchorEl(null); }}>
          <ListItemIcon><AutoAwesome /></ListItemIcon>
          <ListItemText>Toggle AI Indicators</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { handleBulkAIGeneration(); setAnchorEl(null); }}>
          <ListItemIcon><Refresh /></ListItemIcon>
          <ListItemText>Regenerate All AI Names</ListItemText>
        </MenuItem>
      </Menu>

      {/* Add Item Dialog */}
      <Dialog open={showAddForm} onClose={() => setShowAddForm(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Item</DialogTitle>
        <DialogContent>
          <WardrobeItemForm
            onSave={handleSaveItem}
            onCancel={() => setShowAddForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={showEditForm} onClose={() => setShowEditForm(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Item</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <WardrobeItemForm
              item={selectedItem}
              onSave={handleSaveItem}
              onCancel={() => setShowEditForm(false)}
              isEditing
            />
          )}
        </DialogContent>
      </Dialog>

      {/* AI Name Generator Dialog */}
      <Dialog open={showAIGenerator} onClose={() => setShowAIGenerator(false)} maxWidth="md" fullWidth>
        <DialogTitle>Generate AI Name</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <AINameGenerator
              item={selectedItem}
              onNameSelected={(name, isAI) => {
                // Handle name selection
                setShowAIGenerator(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Naming Preferences Dialog */}
      <Dialog open={showPreferences} onClose={() => setShowPreferences(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Naming Preferences</DialogTitle>
        <DialogContent>
          <NamingPreferences onClose={() => setShowPreferences(false)} />
        </DialogContent>
      </Dialog>

      {/* Advanced Filters Dialog */}
      <Dialog open={showFilters} onClose={() => setShowFilters(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Advanced Filters</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* AI Name Filter */}
            <FormControl fullWidth>
              <InputLabel>Name Type</InputLabel>
              <Select
                value={filters.hasAIName === null ? 'all' : filters.hasAIName ? 'ai' : 'custom'}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters(prev => ({
                    ...prev,
                    hasAIName: value === 'all' ? null : value === 'ai'
                  }));
                }}
                label="Name Type"
              >
                <MenuItem value="all">All Items</MenuItem>
                <MenuItem value="ai">AI Generated Names</MenuItem>
                <MenuItem value="custom">Custom Names</MenuItem>
              </Select>
            </FormControl>

            {/* Sort Field */}
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortOptions.field}
                onChange={(e) => setSortOptions(prev => ({ ...prev, field: e.target.value as any }))}
                label="Sort By"
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="category">Category</MenuItem>
                <MenuItem value="createdAt">Date Added</MenuItem>
                <MenuItem value="lastWorn">Last Worn</MenuItem>
                <MenuItem value="wearCount">Wear Count</MenuItem>
              </Select>
            </FormControl>

            {/* Colors Filter */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>Colors</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {getUniqueColors().map(color => (
                  <Chip
                    key={color}
                    label={color}
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        colors: prev.colors.includes(color)
                          ? prev.colors.filter(c => c !== color)
                          : [...prev.colors, color]
                      }));
                    }}
                    color={filters.colors.includes(color) ? 'primary' : 'default'}
                    variant={filters.colors.includes(color) ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Box>

            {/* Brands Filter */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>Brands</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {getUniqueBrands().map(brand => (
                  <Chip
                    key={brand}
                    label={brand}
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        brands: prev.brands.includes(brand)
                          ? prev.brands.filter(b => b !== brand)
                          : [...prev.brands, brand]
                      }));
                    }}
                    color={filters.brands.includes(brand) ? 'primary' : 'default'}
                    variant={filters.brands.includes(brand) ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setFilters({
              category: 'all',
              colors: [],
              brands: [],
              hasAIName: null,
              searchQuery: ''
            });
          }}>
            Clear All
          </Button>
          <Button onClick={() => setShowFilters(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};