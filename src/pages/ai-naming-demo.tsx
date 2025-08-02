// AI Naming Demo Page
import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Divider,
  Alert,
  Chip,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  AutoAwesome,
  Image,
  Settings,
  History,
  Refresh,
  CheckCircle,
  Info,
  Lightbulb
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { AINameGenerator } from '@/components/naming/AINameGenerator';
import { NamingPreferences } from '@/components/naming/NamingPreferences';
import { useAINaming } from '@/hooks/useAINaming';
import { WardrobeItem } from '@/types/aynaMirror';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`demo-tabpanel-${index}`}
      aria-labelledby={`demo-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Sample wardrobe items for demo
const DEMO_ITEMS: Partial<WardrobeItem>[] = [
  {
    id: 'demo-1',
    imageUri: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=600&fit=crop',
    category: 'tops',
    colors: ['White', 'Blue'],
    brand: 'Uniqlo',
    subcategory: 'T-shirt'
  },
  {
    id: 'demo-2',
    imageUri: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=600&fit=crop',
    category: 'bottoms',
    colors: ['Blue', 'Indigo'],
    brand: 'Levi\'s',
    subcategory: 'Jeans'
  },
  {
    id: 'demo-3',
    imageUri: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=600&fit=crop',
    category: 'shoes',
    colors: ['White', 'Black'],
    brand: 'Nike',
    subcategory: 'Sneakers'
  },
  {
    id: 'demo-4',
    imageUri: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop',
    category: 'dresses',
    colors: ['Black'],
    brand: 'Zara',
    subcategory: 'Evening dress'
  }
];

export default function AINamingDemoPage() {
  const { 
    generateName, 
    preferences, 
    namingHistory, 
    isLoading, 
    error 
  } = useAINaming();
  
  const [activeTab, setActiveTab] = useState(0);
  const [selectedItem, setSelectedItem] = useState<Partial<WardrobeItem> | null>(null);
  const [generatedNames, setGeneratedNames] = useState<Record<string, string>>({});
  const [showPreferences, setShowPreferences] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleGenerateName = async (item: Partial<WardrobeItem>) => {
    if (!item.imageUri) return;
    
    try {
      const response = await generateName({
        imageUri: item.imageUri,
        category: item.category!,
        colors: item.colors || [],
        brand: item.brand,
        subcategory: item.subcategory
      });
      
      if (response?.suggestedName) {
        setGeneratedNames(prev => ({
          ...prev,
          [item.id!]: response.suggestedName
        }));
      }
    } catch (err) {
      console.error('Failed to generate name:', err);
    }
  };

  const handleBulkGenerate = async () => {
    for (const item of DEMO_ITEMS) {
      await handleGenerateName(item);
      // Add small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          AI-Powered Wardrobe Naming
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Automatically generate intelligent names for your wardrobe items using AI
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
          <Typography variant="body2">
            This demo showcases the AI naming system that analyzes wardrobe item images and generates 
            contextual names based on visual features, colors, brands, and user preferences.
          </Typography>
        </Alert>
      </Box>

      {/* Feature Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <AutoAwesome sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Smart Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary">
                AI analyzes images to detect colors, patterns, styles, and visual features
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Settings sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Customizable Styles
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose from different naming styles: descriptive, creative, minimal, or brand-focused
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <History sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Manual Override
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Always maintain control with the ability to override AI suggestions with custom names
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Demo Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="demo tabs">
          <Tab label="Live Demo" icon={<AutoAwesome />} />
          <Tab label="Preferences" icon={<Settings />} />
          <Tab label="History" icon={<History />} />
          <Tab label="Features" icon={<Info />} />
        </Tabs>

        {/* Live Demo Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Try AI Naming on Sample Items
            </Typography>
            <LoadingButton
              variant="contained"
              startIcon={<AutoAwesome />}
              onClick={handleBulkGenerate}
              loading={isLoading}
            >
              Generate All Names
            </LoadingButton>
          </Box>
          
          <Grid container spacing={3}>
            {DEMO_ITEMS.map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item.id}>
                <Card>
                  <Box
                    component="img"
                    src={item.imageUri}
                    alt="Demo item"
                    sx={{
                      width: '100%',
                      height: 200,
                      objectFit: 'cover'
                    }}
                  />
                  <CardContent>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {item.category} • {item.brand}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                        {item.colors?.map((color, index) => (
                          <Chip key={index} label={color} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                    
                    {generatedNames[item.id!] ? (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          AI Generated Name:
                        </Typography>
                        <Paper sx={{ p: 2, bgcolor: 'primary.50', border: 1, borderColor: 'primary.200' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircle sx={{ color: 'primary.main', fontSize: 16 }} />
                            <Typography variant="body1" fontWeight="medium">
                              {generatedNames[item.id!]}
                            </Typography>
                          </Box>
                        </Paper>
                      </Box>
                    ) : (
                      <Box sx={{ mb: 2, minHeight: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="body2" color="text.secondary" textAlign="center">
                          Click to generate AI name
                        </Typography>
                      </Box>
                    )}
                    
                    <LoadingButton
                      fullWidth
                      variant={generatedNames[item.id!] ? "outlined" : "contained"}
                      startIcon={generatedNames[item.id!] ? <Refresh /> : <AutoAwesome />}
                      onClick={() => handleGenerateName(item)}
                      loading={isLoading}
                      size="small"
                    >
                      {generatedNames[item.id!] ? 'Regenerate' : 'Generate Name'}
                    </LoadingButton>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Preferences Tab */}
        <TabPanel value={activeTab} index={1}>
          <Typography variant="h6" gutterBottom>
            Naming Preferences
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Customize how AI generates names for your wardrobe items.
          </Typography>
          
          <NamingPreferences />
        </TabPanel>

        {/* History Tab */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" gutterBottom>
            Naming History
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Track all naming changes and AI suggestions.
          </Typography>
          
          {namingHistory && namingHistory.length > 0 ? (
            <List>
              {namingHistory.slice(0, 10).map((entry, index) => (
                <ListItem key={index} divider>
                  <ListItemIcon>
                    <AutoAwesome color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={entry.newName}
                    secondary={`${entry.changeType} • ${new Date(entry.createdAt).toLocaleDateString()}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <History sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                No naming history yet. Start generating names to see your history here.
              </Typography>
            </Paper>
          )}
        </TabPanel>

        {/* Features Tab */}
        <TabPanel value={activeTab} index={3}>
          <Typography variant="h6" gutterBottom>
            AI Naming Features
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    🎨 Visual Analysis
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="Color detection and naming" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Pattern recognition (stripes, dots, etc.)" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Texture analysis (smooth, textured, etc.)" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Style classification (casual, formal, etc.)" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    🏷️ Smart Naming
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="Context-aware suggestions" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Brand and category integration" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Multiple naming style options" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Confidence scoring" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    ⚙️ Customization
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="Personalized naming preferences" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Manual override capability" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Bulk naming operations" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Naming history tracking" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    🔄 Integration
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="Seamless wardrobe integration" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Real-time name generation" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Search and filter by AI names" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Export and backup support" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Call to Action */}
      <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'primary.50' }}>
        <Lightbulb sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Ready to organize your wardrobe with AI?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Start using AI-powered naming to automatically organize and categorize your clothing items.
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<AutoAwesome />}
          href="/wardrobe"
        >
          Go to My Wardrobe
        </Button>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}
    </Container>
  );
}