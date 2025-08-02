// Enhanced Wardrobe Item Form with AI Naming
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Divider,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Save,
  Cancel,
  AutoAwesome,
  Image,
  Edit,
  Delete,
  Add
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { WardrobeItem, ItemCategory } from '@/types/aynaMirror';
import { AINameGenerator } from '../naming/AINameGenerator';
import { useAINaming } from '@/hooks/useAINaming';
import { enhancedWardrobeService } from '@/services/enhancedWardrobeService';

interface WardrobeItemFormProps {
  item?: Partial<WardrobeItem>;
  onSave: (item: WardrobeItem) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const CATEGORIES: ItemCategory[] = [
  'tops',
  'bottoms', 
  'dresses',
  'shoes',
  'accessories',
  'outerwear',
  'activewear'
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '6', '7', '8', '9', '10', '11', '12'];

export const WardrobeItemForm: React.FC<WardrobeItemFormProps> = ({
  item,
  onSave,
  onCancel,
  isEditing = false
}) => {
  const { getEffectiveName } = useAINaming();
  
  const [formData, setFormData] = useState({
    name: item?.name || '',
    aiGeneratedName: item?.aiGeneratedName || '',
    nameOverride: item?.nameOverride || false,
    category: item?.category || 'tops' as ItemCategory,
    subcategory: item?.subcategory || '',
    colors: item?.colors || [],
    brand: item?.brand || '',
    size: item?.size || '',
    purchaseDate: item?.purchaseDate || '',
    purchasePrice: item?.purchasePrice || 0,
    tags: item?.tags || [],
    notes: item?.notes || '',
    imageUri: item?.imageUri || ''
  });

  const [newColor, setNewColor] = useState('');
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAINaming, setShowAINaming] = useState(false);
  const [useAIName, setUseAIName] = useState(!item?.name && !item?.nameOverride);

  // Auto-open AI naming for new items with images
  useEffect(() => {
    if (!isEditing && formData.imageUri && !formData.name && !formData.aiGeneratedName) {
      setShowAINaming(true);
    }
  }, [isEditing, formData.imageUri, formData.name, formData.aiGeneratedName]);

  const handleInputChange = (field: keyof typeof formData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // If user manually enters a name, mark as override
    if (field === 'name' && value.trim()) {
      setFormData(prev => ({ ...prev, nameOverride: true }));
      setUseAIName(false);
    }
  };

  const handleSelectChange = (field: keyof typeof formData) => (
    event: any
  ) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleAddColor = () => {
    if (newColor.trim() && !formData.colors.includes(newColor.trim())) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, newColor.trim()]
      }));
      setNewColor('');
    }
  };

  const handleRemoveColor = (colorToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter(color => color !== colorToRemove)
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAINameSelected = (name: string, isAIGenerated: boolean) => {
    setFormData(prev => ({
      ...prev,
      name: isAIGenerated ? '' : name,
      aiGeneratedName: isAIGenerated ? name : prev.aiGeneratedName,
      nameOverride: !isAIGenerated
    }));
    setUseAIName(isAIGenerated);
    setShowAINaming(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.imageUri) {
        throw new Error('Image is required');
      }

      if (!formData.name && !formData.aiGeneratedName) {
        throw new Error('Item name is required');
      }

      // Prepare item data
      const itemData: Partial<WardrobeItem> = {
        ...item,
        name: formData.name,
        aiGeneratedName: formData.aiGeneratedName,
        nameOverride: formData.nameOverride,
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        colors: formData.colors,
        brand: formData.brand || undefined,
        size: formData.size || undefined,
        purchaseDate: formData.purchaseDate || undefined,
        purchasePrice: formData.purchasePrice || undefined,
        tags: formData.tags,
        notes: formData.notes || undefined,
        imageUri: formData.imageUri
      };

      if (isEditing && item?.id) {
        // Update existing item
        const { error: updateError } = await enhancedWardrobeService.supabase
          .from('wardrobe_items')
          .update({
            name: itemData.name,
            ai_generated_name: itemData.aiGeneratedName,
            name_override: itemData.nameOverride,
            category: itemData.category,
            subcategory: itemData.subcategory,
            colors: itemData.colors,
            brand: itemData.brand,
            size: itemData.size,
            purchase_date: itemData.purchaseDate,
            purchase_price: itemData.purchasePrice,
            tags: itemData.tags,
            notes: itemData.notes
          })
          .eq('id', item.id);

        if (updateError) {
          throw new Error(updateError.message);
        }

        onSave(itemData as WardrobeItem);
      } else {
        // Create new item
        const newItemData = await enhancedWardrobeService.saveClothingItem({
          image_uri: itemData.imageUri!,
          processed_image_uri: itemData.imageUri!, // Assuming same for now
          category: itemData.category!,
          subcategory: itemData.subcategory,
          colors: itemData.colors!,
          brand: itemData.brand,
          size: itemData.size,
          purchase_date: itemData.purchaseDate,
          purchase_price: itemData.purchasePrice,
          tags: itemData.tags,
          notes: itemData.notes,
          name: itemData.name,
          ai_generated_name: itemData.aiGeneratedName,
          name_override: itemData.nameOverride
        }, false); // Don't auto-generate AI name since we handle it manually

        onSave({
          ...itemData,
          id: newItemData.id,
          userId: newItemData.user_id,
          createdAt: new Date(newItemData.created_at),
          updatedAt: new Date(newItemData.updated_at)
        } as WardrobeItem);
      }
    } catch (err) {
      console.error('Error saving item:', err);
      setError(err instanceof Error ? err.message : 'Failed to save item');
    } finally {
      setIsSaving(false);
    }
  };

  const getDisplayName = () => {
    if (formData.name && formData.nameOverride) {
      return formData.name;
    }
    if (formData.aiGeneratedName) {
      return formData.aiGeneratedName;
    }
    return 'Unnamed Item';
  };

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {isEditing ? 'Edit Item' : 'Add New Item'}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Item Image */}
            {formData.imageUri && (
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Box
                    component="img"
                    src={formData.imageUri}
                    alt="Item"
                    sx={{
                      width: '100%',
                      maxWidth: 200,
                      height: 'auto',
                      borderRadius: 1
                    }}
                  />
                </Paper>
              </Grid>
            )}

            <Grid item xs={12} md={formData.imageUri ? 8 : 12}>
              {/* Item Name Section */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="subtitle1">Item Name</Typography>
                  {formData.imageUri && (
                    <Tooltip title="Generate AI Name">
                      <IconButton
                        size="small"
                        onClick={() => setShowAINaming(true)}
                        color="primary"
                      >
                        <AutoAwesome fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>

                <Paper sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Current Name:
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {getDisplayName()}
                  </Typography>
                  {formData.aiGeneratedName && !formData.nameOverride && (
                    <Chip
                      label="AI Generated"
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mt: 1 }}
                    />
                  )}
                  {formData.nameOverride && (
                    <Chip
                      label="Custom Name"
                      size="small"
                      color="secondary"
                      variant="outlined"
                      sx={{ mt: 1 }}
                    />
                  )}
                </Paper>

                <TextField
                  fullWidth
                  label="Custom Name (Optional)"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  placeholder="Enter a custom name or use AI suggestion"
                  helperText="Leave empty to use AI-generated name"
                />
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Basic Information */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={formData.category}
                      onChange={handleSelectChange('category')}
                      label="Category"
                    >
                      {CATEGORIES.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Subcategory"
                    value={formData.subcategory}
                    onChange={handleInputChange('subcategory')}
                    placeholder="e.g., T-shirt, Jeans, Sneakers"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Brand"
                    value={formData.brand}
                    onChange={handleInputChange('brand')}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Size</InputLabel>
                    <Select
                      value={formData.size}
                      onChange={handleSelectChange('size')}
                      label="Size"
                    >
                      {SIZES.map((size) => (
                        <MenuItem key={size} value={size}>
                          {size}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Purchase Date"
                    type="date"
                    value={formData.purchaseDate}
                    onChange={handleInputChange('purchaseDate')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Purchase Price"
                    type="number"
                    value={formData.purchasePrice}
                    onChange={handleInputChange('purchasePrice')}
                    InputProps={{ startAdornment: '$' }}
                  />
                </Grid>
              </Grid>

              {/* Colors */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Colors
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {formData.colors.map((color, index) => (
                    <Chip
                      key={index}
                      label={color}
                      onDelete={() => handleRemoveColor(color)}
                      deleteIcon={<Delete />}
                    />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    label="Add Color"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddColor()}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddColor}
                    startIcon={<Add />}
                  >
                    Add
                  </Button>
                </Box>
              </Box>

              {/* Tags */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {formData.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      deleteIcon={<Delete />}
                    />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    label="Add Tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddTag}
                    startIcon={<Add />}
                  >
                    Add
                  </Button>
                </Box>
              </Box>

              {/* Notes */}
              <Box sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={handleInputChange('notes')}
                  placeholder="Any additional notes about this item..."
                />
              </Box>
            </Grid>
          </Grid>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={onCancel}
              startIcon={<Cancel />}
            >
              Cancel
            </Button>
            <LoadingButton
              variant="contained"
              onClick={handleSave}
              loading={isSaving}
              startIcon={<Save />}
            >
              {isEditing ? 'Update Item' : 'Save Item'}
            </LoadingButton>
          </Box>
        </CardContent>
      </Card>

      {/* AI Naming Dialog */}
      <Dialog
        open={showAINaming}
        onClose={() => setShowAINaming(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Generate AI Name
        </DialogTitle>
        <DialogContent>
          <AINameGenerator
            item={{
              imageUri: formData.imageUri,
              category: formData.category,
              colors: formData.colors,
              brand: formData.brand
            }}
            onNameSelected={handleAINameSelected}
            initialName={formData.name}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};