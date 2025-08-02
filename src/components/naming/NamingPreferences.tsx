// AI Naming Preferences Component
import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  Button,
  Alert,
  Divider,
  Chip,
  Grid,
  Paper
} from '@mui/material';
import {
  AutoAwesome,
  Palette,
  Style,
  Business,
  Save,
  Refresh
} from '@mui/icons-material';
import { useNamingPreferences } from '@/hooks/useAINaming';
import { NamingStyle } from '@/types/aynaMirror';
import { LoadingButton } from '@mui/lab';

interface NamingPreferencesProps {
  onPreferencesChange?: () => void;
}

const NAMING_STYLE_OPTIONS = [
  {
    value: 'descriptive' as NamingStyle,
    label: 'Descriptive',
    description: 'Detailed names with color, brand, and style',
    example: 'Blue Nike Running Shoes'
  },
  {
    value: 'creative' as NamingStyle,
    label: 'Creative',
    description: 'Fun and personalized naming style',
    example: 'My Favorite Blue Sneakers'
  },
  {
    value: 'minimal' as NamingStyle,
    label: 'Minimal',
    description: 'Simple and clean names',
    example: 'Blue Shoes'
  },
  {
    value: 'brand_focused' as NamingStyle,
    label: 'Brand Focused',
    description: 'Emphasizes brand names',
    example: 'Nike Blue Shoes'
  }
];

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'it', label: 'Italiano' }
];

export const NamingPreferences: React.FC<NamingPreferencesProps> = ({
  onPreferencesChange
}) => {
  const {
    preferences,
    isLoading,
    error,
    loadPreferences,
    updatePreferences
  } = useNamingPreferences();

  const [localPreferences, setLocalPreferences] = useState({
    namingStyle: 'descriptive' as NamingStyle,
    includeBrand: true,
    includeColor: true,
    includeMaterial: false,
    includeStyle: true,
    preferredLanguage: 'en',
    autoAcceptAINames: false
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  // Update local state when preferences load
  useEffect(() => {
    if (preferences) {
      setLocalPreferences({
        namingStyle: preferences.namingStyle || 'descriptive',
        includeBrand: preferences.includeBrand ?? true,
        includeColor: preferences.includeColor ?? true,
        includeMaterial: preferences.includeMaterial ?? false,
        includeStyle: preferences.includeStyle ?? true,
        preferredLanguage: preferences.preferredLanguage || 'en',
        autoAcceptAINames: preferences.autoAcceptAINames ?? false
      });
    }
  }, [preferences]);

  const handleStyleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalPreferences(prev => ({
      ...prev,
      namingStyle: event.target.value as NamingStyle
    }));
  };

  const handleToggleChange = (field: keyof typeof localPreferences) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setLocalPreferences(prev => ({
      ...prev,
      [field]: event.target.checked
    }));
  };

  const handleLanguageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalPreferences(prev => ({
      ...prev,
      preferredLanguage: event.target.value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await updatePreferences(localPreferences);
      setSaveSuccess(true);
      onPreferencesChange?.();
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving preferences:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (preferences) {
      setLocalPreferences({
        namingStyle: preferences.namingStyle || 'descriptive',
        includeBrand: preferences.includeBrand ?? true,
        includeColor: preferences.includeColor ?? true,
        includeMaterial: preferences.includeMaterial ?? false,
        includeStyle: preferences.includeStyle ?? true,
        preferredLanguage: preferences.preferredLanguage || 'en',
        autoAcceptAINames: preferences.autoAcceptAINames ?? false
      });
    }
  };

  const getPreviewName = () => {
    const { namingStyle, includeBrand, includeColor, includeStyle } = localPreferences;
    
    switch (namingStyle) {
      case 'descriptive':
        if (includeBrand && includeColor) return 'Blue Nike T-Shirt';
        if (includeColor && includeStyle) return 'Casual Blue T-Shirt';
        if (includeColor) return 'Blue T-Shirt';
        return 'T-Shirt';
        
      case 'creative':
        if (includeBrand && includeColor) return 'My Blue Nike Favorite';
        if (includeColor) return 'My Blue Essential';
        return 'Favorite T-Shirt';
        
      case 'minimal':
        if (includeColor) return 'Blue T-Shirt';
        return 'T-Shirt';
        
      case 'brand_focused':
        if (includeBrand && includeColor) return 'Nike Blue T-Shirt';
        if (includeBrand) return 'Nike T-Shirt';
        if (includeColor) return 'Blue T-Shirt';
        return 'T-Shirt';
        
      default:
        return 'Blue T-Shirt';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading preferences...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesome color="primary" />
            AI Naming Preferences
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Customize how AI generates names for your wardrobe items
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Preferences saved successfully!
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Naming Style */}
          <Grid item xs={12} md={6}>
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Style fontSize="small" />
                  Naming Style
                </Typography>
              </FormLabel>
              <RadioGroup
                value={localPreferences.namingStyle}
                onChange={handleStyleChange}
              >
                {NAMING_STYLE_OPTIONS.map((option) => (
                  <Box key={option.value} sx={{ mb: 1 }}>
                    <FormControlLabel
                      value={option.value}
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {option.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.description}
                          </Typography>
                          <Box sx={{ mt: 0.5 }}>
                            <Chip
                              label={option.example}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          </Box>
                        </Box>
                      }
                    />
                  </Box>
                ))}
              </RadioGroup>
            </FormControl>
          </Grid>

          {/* Include Options */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Palette fontSize="small" />
              Include in Names
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={localPreferences.includeColor}
                    onChange={handleToggleChange('includeColor')}
                  />
                }
                label="Color"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={localPreferences.includeBrand}
                    onChange={handleToggleChange('includeBrand')}
                  />
                }
                label="Brand"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={localPreferences.includeStyle}
                    onChange={handleToggleChange('includeStyle')}
                  />
                }
                label="Style"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={localPreferences.includeMaterial}
                    onChange={handleToggleChange('includeMaterial')}
                  />
                }
                label="Material"
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Language */}
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Business fontSize="small" />
              Language
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup
                value={localPreferences.preferredLanguage}
                onChange={handleLanguageChange}
                row
              >
                {LANGUAGE_OPTIONS.map((lang) => (
                  <FormControlLabel
                    key={lang.value}
                    value={lang.value}
                    control={<Radio size="small" />}
                    label={lang.label}
                  />
                ))}
              </RadioGroup>
            </FormControl>

            <Divider sx={{ my: 2 }} />

            {/* Auto Accept */}
            <FormControlLabel
              control={
                <Switch
                  checked={localPreferences.autoAcceptAINames}
                  onChange={handleToggleChange('autoAcceptAINames')}
                />
              }
              label={
                <Box>
                  <Typography variant="body2">Auto-accept AI names</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Automatically use AI-generated names without manual approval
                  </Typography>
                </Box>
              }
            />
          </Grid>
        </Grid>

        {/* Preview */}
        <Paper sx={{ p: 2, mt: 3, bgcolor: 'grey.50' }}>
          <Typography variant="subtitle2" gutterBottom>
            Preview
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            With your current settings, a blue Nike t-shirt would be named:
          </Typography>
          <Chip
            label={getPreviewName()}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 'medium' }}
          />
        </Paper>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={handleReset}
            startIcon={<Refresh />}
            disabled={isSaving}
          >
            Reset
          </Button>
          <LoadingButton
            variant="contained"
            onClick={handleSave}
            loading={isSaving}
            startIcon={<Save />}
          >
            Save Preferences
          </LoadingButton>
        </Box>
      </CardContent>
    </Card>
  );
};