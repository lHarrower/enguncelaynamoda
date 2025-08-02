// AI Name Generator Component
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemButton
} from '@mui/material';
import {
  AutoAwesome,
  Refresh,
  Edit,
  Check,
  Close,
  Lightbulb,
  Settings,
  History
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { useAINaming } from '@/hooks/useAINaming';
import { WardrobeItem, NamingResponse } from '@/types/aynaMirror';
import { NamingPreferences } from './NamingPreferences';

interface AINameGeneratorProps {
  item: Partial<WardrobeItem>;
  onNameSelected: (name: string, isAIGenerated: boolean) => void;
  onCancel?: () => void;
  initialName?: string;
  showPreferences?: boolean;
}

export const AINameGenerator: React.FC<AINameGeneratorProps> = ({
  item,
  onNameSelected,
  onCancel,
  initialName = '',
  showPreferences = false
}) => {
  const {
    isGenerating,
    error,
    lastResponse,
    generateNameForItem,
    clearError,
    getEffectiveName,
    saveNamingChoice
  } = useAINaming();

  const [customName, setCustomName] = useState(initialName);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [showPreferencesDialog, setShowPreferencesDialog] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Auto-generate name on mount if item has image
  useEffect(() => {
    if (item.imageUri && !hasGenerated && !initialName) {
      handleGenerateName();
    }
  }, [item.imageUri]);

  // Update custom name when AI name is generated
  useEffect(() => {
    if (lastResponse && !customName) {
      setCustomName(lastResponse.aiGeneratedName);
      setSelectedSuggestion(lastResponse.aiGeneratedName);
    }
  }, [lastResponse, customName]);

  const handleGenerateName = async () => {
    if (!item.imageUri) {
      return;
    }

    clearError();
    setHasGenerated(true);
    
    const response = await generateNameForItem(item);
    if (response) {
      setSelectedSuggestion(response.aiGeneratedName);
      if (!customName) {
        setCustomName(response.aiGeneratedName);
      }
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSelectedSuggestion(suggestion);
    setCustomName(suggestion);
  };

  const handleAcceptName = async () => {
    const finalName = customName.trim() || (lastResponse?.aiGeneratedName) || 'Item';
    const isAIGenerated = selectedSuggestion === lastResponse?.aiGeneratedName;
    
    // Save naming choice if we have an item ID
    if (item.id && lastResponse) {
      await saveNamingChoice(
        item.id,
        isAIGenerated ? 'ai' : 'user',
        isAIGenerated ? undefined : finalName
      );
    }
    
    onNameSelected(finalName, isAIGenerated);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'error';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High confidence';
    if (confidence >= 0.6) return 'Medium confidence';
    return 'Low confidence';
  };

  return (
    <>
      <Card>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoAwesome color="primary" />
              AI Name Generator
              <Tooltip title="Naming Preferences">
                <IconButton
                  size="small"
                  onClick={() => setShowPreferencesDialog(true)}
                  sx={{ ml: 'auto' }}
                >
                  <Settings fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Generate intelligent names for your wardrobe items
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
              {error}
            </Alert>
          )}

          {/* Item Preview */}
          {item.imageUri && (
            <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Box
                    component="img"
                    src={item.imageUri}
                    alt="Item"
                    sx={{
                      width: 60,
                      height: 60,
                      objectFit: 'cover',
                      borderRadius: 1
                    }}
                  />
                </Grid>
                <Grid item xs>
                  <Typography variant="body2" color="text.secondary">
                    {item.category && `Category: ${item.category}`}
                    {item.colors && item.colors.length > 0 && ` • Colors: ${item.colors.join(', ')}`}
                    {item.brand && ` • Brand: ${item.brand}`}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Generate Button */}
          {!lastResponse && (
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <LoadingButton
                variant="contained"
                onClick={handleGenerateName}
                loading={isGenerating}
                startIcon={<AutoAwesome />}
                disabled={!item.imageUri}
                size="large"
              >
                {isGenerating ? 'Generating Name...' : 'Generate AI Name'}
              </LoadingButton>
              {!item.imageUri && (
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                  Image required for AI name generation
                </Typography>
              )}
            </Box>
          )}

          {/* AI Response */}
          {lastResponse && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="subtitle1">AI Generated Name</Typography>
                <Chip
                  label={getConfidenceText(lastResponse.confidence)}
                  color={getConfidenceColor(lastResponse.confidence)}
                  size="small"
                />
                <Tooltip title="Generate New Name">
                  <IconButton size="small" onClick={handleGenerateName} disabled={isGenerating}>
                    {isGenerating ? <CircularProgress size={16} /> : <Refresh fontSize="small" />}
                  </IconButton>
                </Tooltip>
              </Box>

              <Paper sx={{ p: 2, mb: 2, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
                <Typography variant="h6" color="primary.main">
                  {lastResponse.aiGeneratedName}
                </Typography>
              </Paper>

              {/* Suggestions */}
              {lastResponse.suggestions && lastResponse.suggestions.length > 1 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Lightbulb fontSize="small" />
                    Alternative Suggestions
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {lastResponse.suggestions
                      .filter(s => s !== lastResponse.aiGeneratedName)
                      .map((suggestion, index) => (
                        <Chip
                          key={index}
                          label={suggestion}
                          variant={selectedSuggestion === suggestion ? 'filled' : 'outlined'}
                          color={selectedSuggestion === suggestion ? 'primary' : 'default'}
                          onClick={() => handleSuggestionClick(suggestion)}
                          clickable
                        />
                      ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Custom Name Input */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Edit fontSize="small" />
              Custom Name
            </Typography>
            <TextField
              fullWidth
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Enter a custom name or edit the AI suggestion"
              variant="outlined"
              helperText="You can use the AI suggestion or create your own name"
            />
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            {onCancel && (
              <Button
                variant="outlined"
                onClick={onCancel}
                startIcon={<Close />}
              >
                Cancel
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleAcceptName}
              startIcon={<Check />}
              disabled={!customName.trim()}
            >
              Use This Name
            </Button>
          </Box>

          {/* Analysis Details */}
          {lastResponse?.analysisData && (
            <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" gutterBottom>
                Analysis Details
              </Typography>
              <Grid container spacing={2}>
                {lastResponse.analysisData.detectedTags.length > 0 && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">Detected Tags:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {lastResponse.analysisData.detectedTags.slice(0, 5).map((tag, index) => (
                        <Chip key={index} label={tag} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Grid>
                )}
                {lastResponse.analysisData.dominantColors.length > 0 && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">Detected Colors:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {lastResponse.analysisData.dominantColors.slice(0, 3).map((color, index) => (
                        <Chip key={index} label={color} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Preferences Dialog */}
      <Dialog
        open={showPreferencesDialog}
        onClose={() => setShowPreferencesDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Naming Preferences
        </DialogTitle>
        <DialogContent>
          <NamingPreferences
            onPreferencesChange={() => {
              // Optionally regenerate name with new preferences
              if (lastResponse) {
                handleGenerateName();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreferencesDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// Compact version for inline use
export const CompactAINameGenerator: React.FC<{
  item: Partial<WardrobeItem>;
  onNameGenerated: (name: string) => void;
}> = ({ item, onNameGenerated }) => {
  const { generateNameForItem, isGenerating } = useAINaming();

  const handleQuickGenerate = async () => {
    const response = await generateNameForItem(item);
    if (response) {
      onNameGenerated(response.aiGeneratedName);
    }
  };

  return (
    <Tooltip title="Generate AI Name">
      <IconButton
        onClick={handleQuickGenerate}
        disabled={isGenerating || !item.imageUri}
        size="small"
      >
        {isGenerating ? (
          <CircularProgress size={16} />
        ) : (
          <AutoAwesome fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  );
};