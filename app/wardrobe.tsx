import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import CustomModal from '../components/CustomModal';
import ModernActionSheet from '../components/ModernActionSheet';
import ModernLoading from '../components/ModernLoading';

const wardrobeCategories = [
  { 
    name: 'Tops', 
    icon: 'shirt-outline', 
    count: 8, 
    color: '#B8918F',
    items: ['Silk Blouse', 'Cotton T-Shirt', 'Lace Top']
  },
  { 
    name: 'Bottoms', 
    icon: 'bag-outline', 
    count: 5, 
    color: '#9AA493',
    items: ['High-Waist Jeans', 'Mini Skirt', 'Wide Leg Pants']
  },
  { 
    name: 'Dresses', 
    icon: 'diamond-outline', 
    count: 12, 
    color: '#C2958A',
    items: ['Summer Dress', 'Evening Gown', 'Cocktail Dress']
  },
  { 
    name: 'Shoes', 
    icon: 'footsteps-outline', 
    count: 15, 
    color: '#B8A084',
    items: ['Heels', 'Sneakers', 'Boots']
  },
  { 
    name: 'Accessories', 
    icon: 'diamond', 
    count: 20, 
    color: '#A0845C',
    items: ['Handbags', 'Jewelry', 'Scarves']
  },
  { 
    name: 'Outerwear', 
    icon: 'layers-outline', 
    count: 6, 
    color: '#9B8B5A',
    items: ['Blazers', 'Coats', 'Jackets']
  },
];

const recentItems = [
  { id: 1, name: 'Pink Floral Dress', category: 'Dresses', color: '#C2958A', addedDate: '2 days ago' },
  { id: 2, name: 'Designer Handbag', category: 'Accessories', color: '#B8918F', addedDate: '1 week ago' },
  { id: 3, name: 'Summer Sandals', category: 'Shoes', color: '#9AA493', addedDate: '3 days ago' },
];

export default function WardrobeScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState<{visible: boolean; title?: string; subtitle?: string}>({ visible: false });
  const [modalVisible, setModalVisible] = useState(false);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [modalContent, setModalContent] = useState<{
    title: string;
    message: string;
    buttons: Array<{text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' | 'primary'; icon?: keyof typeof Ionicons.glyphMap}>;
    type?: 'default' | 'success' | 'warning' | 'error' | 'info';
  }>({ title: '', message: '', buttons: [], type: 'default' });
  const [actionSheetContent, setActionSheetContent] = useState<{
    title?: string;
    subtitle?: string;
    options: Array<{title: string; icon?: keyof typeof Ionicons.glyphMap; onPress: () => void; style?: 'default' | 'destructive' | 'primary'; subtitle?: string}>;
  }>({ options: [] });

  const showCustomAlert = (title: string, message: string, buttons: Array<{text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' | 'primary'; icon?: keyof typeof Ionicons.glyphMap}>, type: 'default' | 'success' | 'warning' | 'error' | 'info' = 'default') => {
    setModalContent({ title, message, buttons, type });
    setModalVisible(true);
  };

  const hideCustomAlert = () => {
    setModalVisible(false);
  };

  const showActionSheet = (title: string, subtitle: string, options: Array<{title: string; icon?: keyof typeof Ionicons.glyphMap; onPress: () => void; style?: 'default' | 'destructive' | 'primary'; subtitle?: string}>) => {
    setActionSheetContent({ title, subtitle, options });
    setActionSheetVisible(true);
  };

  const hideActionSheet = () => {
    setActionSheetVisible(false);
  };

  const showLoading = (title: string, subtitle?: string) => {
    setLoading({ visible: true, title, subtitle });
  };

  const hideLoading = () => {
    setLoading({ visible: false });
  };

  const handleAddButton = () => {
    showActionSheet(
      "Add Items to Wardrobe",
      "How would you like to add items to your fabulous collection?",
      [
        { title: "Take Photo", icon: "camera", subtitle: "Capture new items with your camera", style: "primary", onPress: () => { hideActionSheet(); router.push('/add-item'); }},
        { title: "Choose from Gallery", icon: "images", subtitle: "Select from your photo library", onPress: () => { hideActionSheet(); router.push('/add-item'); }},
        { title: "Browse Catalog", icon: "storefront", subtitle: "Discover new items to add", onPress: () => { hideActionSheet(); handleQuickAction('browse'); }},
        { title: "Virtual Try-On", icon: "scan", subtitle: "Coming soon - see how items look on you", onPress: () => {
          hideActionSheet();
          setTimeout(() => showCustomAlert("Virtual Try-On", "AI virtual try-on feature coming soon! Get ready to see how items look on you! ✨", [{ text: "OK", onPress: hideCustomAlert }], "info"), 300);
        }},
      ]
    );
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'camera':
        // Navigate to our new AddItemScreen which has the sophisticated camera flow
        router.push('/add-item');
        break;
      case 'gallery':
        // For now, also navigate to AddItemScreen (user can access gallery from there)
        router.push('/add-item');
        break;
      case 'browse':
        showCustomAlert(
          "Browse Catalog 🛍️",
          "Discover new pieces to add to your wardrobe!",
          [
            { text: "🔥 See Trending", onPress: () => { hideCustomAlert(); router.push('/discover'); }},
            { text: "💖 Your Style", onPress: () => { hideCustomAlert(); router.push('/discover'); }},
            { text: "Cancel", onPress: hideCustomAlert, style: "cancel" }
          ]
        );
        break;
    }
  };

  const handleCategoryPress = (category: any) => {
    setSelectedCategory(category);
    showLoading(`Loading ${category.name}...`, 'Fetching your collection');
    
    setTimeout(() => {
      hideLoading();
      showCustomAlert(
        `${category.name} Collection ${category.emoji || '👕'}`,
        `You have ${category.count} amazing items in this category!\n\n✨ Recent additions:\n${category.items?.slice(0, 3).join('\n') || '• Stylish pieces'}\n\nWhat would you like to do?`,
        [
          { text: "👀 View All Items", onPress: () => {
            showCustomAlert("Collection View", `Viewing all ${category.count} ${category.name.toLowerCase()} items! 👗`, [{ text: "OK", onPress: hideCustomAlert }]);
          }},
          { text: "🛍️ Shop Similar", onPress: () => router.push('/discover') },
          { text: "✨ Create Outfit", onPress: () => {
            showCustomAlert("Outfit Creator", `Creating outfits with your ${category.name.toLowerCase()}! 🎨`, [{ text: "OK", onPress: hideCustomAlert }]);
          }},
          { text: "Cancel", onPress: hideCustomAlert, style: "cancel" }
        ]
      );
    }, 600);
  };

  const handleRecentItemPress = (item: any) => {
    showCustomAlert(
      `${item.name} 💖`,
      `Category: ${item.category}\nAdded: ${item.addedDate}\n\nThis piece is perfect for creating stunning outfits! What would you like to do?`,
      [
        { text: "✨ Create Outfit", onPress: () => {
          showCustomAlert("Outfit Creator 🎨", "AI stylist is mixing and matching this item with your wardrobe! ✨", [{ text: "OK", onPress: hideCustomAlert }]);
        }},
        { text: "📱 Share Look", onPress: () => {
          showCustomAlert("Share Success! 📱", "Your fabulous item has been shared! Friends will be so jealous! 💖", [{ text: "OK", onPress: hideCustomAlert }]);
        }},
        { text: "📝 Add Notes", onPress: () => {
          showCustomAlert("Style Notes", "Add notes about this item:\n• When you wore it\n• Occasion\n• Styling tips ✍️", [{ text: "OK", onPress: hideCustomAlert }]);
        }},
        { text: "🗑️ Remove", onPress: () => {
          showCustomAlert("Remove Item", "Are you sure you want to remove this from your wardrobe?", [{ text: "Yes, Remove", onPress: () => showCustomAlert("Removed!", "Item removed from wardrobe! 🗑️", [{ text: "OK", onPress: hideCustomAlert }]) }, { text: "Keep It", onPress: hideCustomAlert, style: "cancel" }]);
        }},
        { text: "Cancel", onPress: hideCustomAlert, style: "cancel" }
      ]
    );
  };

  const toggleFavorite = (itemId: number) => {
    setFavorites(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
    
    // No notification - silent favorite toggle
  };

  const handleInspirationPress = () => {
    showCustomAlert(
      "Style Inspiration ✨",
      "Ready to create amazing outfits? Our AI stylist will help you discover new combinations!",
      [
        { text: "🤖 AI Stylist", onPress: () => {
          showCustomAlert("AI Stylist 🤖", "AI is analyzing your wardrobe to create perfect outfits! Coming soon! ✨", [{ text: "OK", onPress: hideCustomAlert }]);
        }},
        { text: "🔥 Trending Styles", onPress: () => router.push('/discover') },
        { text: "📱 Style Challenge", onPress: () => {
          showCustomAlert("Style Challenge 🎯", "Try the 30-day outfit challenge! Create unique looks every day! 🌟", [{ text: "OK", onPress: hideCustomAlert }]);
        }},
        { text: "Later", onPress: hideCustomAlert, style: "cancel" }
      ]
    );
  };

  const handleOutfitOfTheDay = () => {
    const outfits = [
      "• Silk Blouse (Cream)\n• High-Waist Jeans (Dark Blue)\n• Statement Earrings (Gold)\n• Leather Boots (Brown)",
      "• Floral Dress (Pink)\n• Denim Jacket (Light Blue)\n• Ankle Boots (Black)\n• Crossbody Bag (Tan)",
      "• Blazer (Navy)\n• White T-Shirt\n• Pleated Skirt (Burgundy)\n• Heels (Nude)",
    ];
    
    const randomOutfit = outfits[Math.floor(Math.random() * outfits.length)];
    
    showCustomAlert(
      "Outfit of the Day 👗",
      `Here's your perfect outfit for today:\n\n${randomOutfit}\n\nWeather: Perfect for today's conditions! ☀️\n\nTip: This combination enhances your natural style! ✨`,
      [
        { text: "💖 Love it!", onPress: () => {
          showCustomAlert("Outfit Saved! ✨", "This outfit has been saved to your favorites! You can recreate it anytime! 💖", [{ text: "OK", onPress: hideCustomAlert }]);
        }},
        { text: "🔄 Try Another", onPress: () => handleOutfitOfTheDay() },
        { text: "📱 Share Look", onPress: () => {
          showCustomAlert("Shared! 📱", "Your outfit of the day has been shared! Looking fabulous! ✨", [{ text: "OK", onPress: hideCustomAlert }]);
        }},
        { text: "Later", onPress: hideCustomAlert, style: "cancel" }
      ]
    );
  };

  const handleColorPalettePress = () => {
    showCustomAlert(
      "Your Color Palette 🎨",
      "These are your signature colors! Based on your wardrobe, you love:\n\n🌸 Soft Pinks\n🌿 Natural Greens\n🤎 Warm Browns\n💜 Gentle Purples\n\nWant to explore complementary colors?",
      [
        { text: "🛍️ Find Matching Items", onPress: () => router.push('/discover') },
        { text: "🌈 Color Analysis", onPress: () => {
          showCustomAlert("Personal Color Analysis 🌈", "Discover your perfect color palette! Professional color analysis coming soon! ✨", [{ text: "OK", onPress: hideCustomAlert }]);
        }},
        { text: "📊 Color Stats", onPress: () => {
          showCustomAlert("Color Statistics", "Pink: 35% of wardrobe\nNeutral: 28%\nBlue: 20%\nOther: 17%\n\nYou love feminine, soft colors! 💖", [{ text: "OK", onPress: hideCustomAlert }]);
        }},
        { text: "Close", onPress: hideCustomAlert, style: "cancel" }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>My Closet 👗</Text>
            <Text style={styles.subtitle}>50 items • $2,450 value • Looking fabulous!</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={handleAddButton}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Wardrobe Stats */}
        <TouchableOpacity style={styles.statsContainer} onPress={() => router.push('/profile')}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>50</Text>
            <Text style={styles.statLabel}>Total Items</Text>
            <Text style={styles.statEmoji}>👚</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>$2,450</Text>
            <Text style={styles.statLabel}>Total Value</Text>
            <Text style={styles.statEmoji}>💎</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Favorites</Text>
            <Text style={styles.statEmoji}>💖</Text>
          </View>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity 
            style={[styles.quickAction, styles.quickActionPink]}
            onPress={() => handleQuickAction('camera')}
          >
            <Ionicons name="camera" size={24} color="#FFFFFF" />
            <Text style={styles.quickActionText}>Add Photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickAction, styles.quickActionPurple]}
            onPress={() => handleQuickAction('gallery')}
          >
            <Ionicons name="images" size={24} color="#FFFFFF" />
            <Text style={styles.quickActionText}>From Gallery</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickAction, styles.quickActionRose]}
            onPress={() => handleQuickAction('browse')}
          >
            <Ionicons name="search" size={24} color="#FFFFFF" />
            <Text style={styles.quickActionText}>Browse</Text>
          </TouchableOpacity>
        </View>

        {/* Categories Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Categories</Text>
          <View style={styles.categoryGrid}>
            {wardrobeCategories.map((category, index) => (
              <TouchableOpacity 
                key={index} 
                style={[styles.categoryCard, { borderColor: category.color }]}
                onPress={() => handleCategoryPress(category)}
              >
                <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                  <Ionicons name={category.icon as any} size={28} color="#FFFFFF" />
                </View>
                <Text style={styles.categoryText}>{category.name}</Text>
                <Text style={[styles.categoryCount, { color: category.color }]}>
                  {category.count} items
                </Text>
                {category.count > 0 && (
                  <View style={[styles.newBadge, { backgroundColor: category.color }]}>
                    <Text style={styles.newBadgeText}>New!</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recently Added */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🆕 Recently Added</Text>
          {recentItems.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.recentItem}
              onPress={() => handleRecentItemPress(item)}
            >
              <View style={[styles.itemIcon, { backgroundColor: item.color }]}>
                <Ionicons name="shirt" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCategory}>{item.category}</Text>
                <Text style={styles.addedDate}>{item.addedDate}</Text>
              </View>
              <TouchableOpacity 
                style={styles.heartButton}
                onPress={() => toggleFavorite(item.id)}
              >
                <Ionicons 
                  name={favorites.includes(item.id) ? "heart" : "heart-outline"} 
                  size={24} 
                  color="#B8918F" 
                />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {/* Outfit of the Day */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Today's Outfit Suggestion</Text>
          <TouchableOpacity style={styles.outfitCard} onPress={handleOutfitOfTheDay}>
            <View style={styles.outfitHeader}>
              <Text style={styles.outfitTitle}>Perfect for Today!</Text>
              <Text style={styles.weatherText}>☀️ Sunny, 24°C</Text>
            </View>
            <View style={styles.outfitItems}>
                             <View style={styles.outfitItem}>
                 <Ionicons name="shirt" size={20} color="#B8918F" />
                 <Text style={styles.outfitItemText}>Silk Blouse</Text>
               </View>
               <View style={styles.outfitItem}>
                 <Ionicons name="bag" size={20} color="#9AA493" />
                 <Text style={styles.outfitItemText}>High-Waist Jeans</Text>
               </View>
               <View style={styles.outfitItem}>
                 <Ionicons name="diamond" size={20} color="#D4A896" />
                 <Text style={styles.outfitItemText}>Gold Earrings</Text>
               </View>
            </View>
            <Text style={styles.outfitCta}>Tap to see full outfit →</Text>
          </TouchableOpacity>
        </View>

        {/* Style Inspiration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Style Inspiration</Text>
          <TouchableOpacity style={styles.inspirationCard} onPress={handleInspirationPress}>
            <Text style={styles.inspirationTitle}>Create New Outfit</Text>
            <Text style={styles.inspirationText}>
              Mix & match your items to create stunning looks!
            </Text>
            <TouchableOpacity style={styles.inspirationButton} onPress={handleInspirationPress}>
              <Text style={styles.inspirationButtonText}>Start Styling ✨</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Color Palette */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 Your Color Palette</Text>
          <TouchableOpacity style={styles.colorPalette} onPress={handleColorPalettePress}>
            <View style={[styles.colorCircle, { backgroundColor: '#B8918F' }]} />
            <View style={[styles.colorCircle, { backgroundColor: '#9AA493' }]} />
            <View style={[styles.colorCircle, { backgroundColor: '#D4A896' }]} />
            <View style={[styles.colorCircle, { backgroundColor: '#B5A3BC' }]} />
            <View style={[styles.colorCircle, { backgroundColor: '#7A6B56' }]} />
            <TouchableOpacity style={styles.addColorButton} onPress={handleColorPalettePress}>
              <Ionicons name="add" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </ScrollView>

                    {/* Modern Components */}
      <CustomModal
        visible={modalVisible}
        title={modalContent.title}
        message={modalContent.message}
        buttons={modalContent.buttons}
        onClose={hideCustomAlert}
        type={modalContent.type}
      />
      
      <ModernActionSheet
        visible={actionSheetVisible}
        title={actionSheetContent.title}
        subtitle={actionSheetContent.subtitle}
        options={actionSheetContent.options}
        onClose={hideActionSheet}
      />
      
      <ModernLoading
        visible={loading.visible}
        title={loading.title}
        subtitle={loading.subtitle}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2EFE9', // Warm cream background
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#7A6B56', // Warm taupe primary
  },
  subtitle: {
    fontSize: 16,
    color: '#B8918F', // Rose pink accent
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#B8918F',
    padding: 15,
    borderRadius: 50,
    shadowColor: '#B8918F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  statCard: {
    backgroundColor: '#FDFCFB',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#B8918F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#B8918F',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statEmoji: {
    fontSize: 16,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  quickAction: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  quickActionPink: {
    backgroundColor: '#B8918F',
  },
  quickActionPurple: {
    backgroundColor: '#9AA493',
  },
  quickActionRose: {
    backgroundColor: '#D4A896',
  },
  quickActionText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 8,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7A6B56',
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    backgroundColor: '#FDFCFB',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    position: 'relative',
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  newBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  newBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  recentItem: {
    backgroundColor: '#FDFCFB',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 2,
  },
  itemCategory: {
    fontSize: 12,
    color: '#9AA493',
    marginBottom: 2,
  },
  addedDate: {
    fontSize: 11,
    color: '#999',
  },
  heartButton: {
    padding: 8,
  },
  inspirationCard: {
    backgroundColor: '#FDFCFB',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#B8918F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    borderLeftWidth: 5,
    borderLeftColor: '#B8918F',
  },
  inspirationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#B8918F',
    marginBottom: 8,
  },
  inspirationText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  inspirationButton: {
    backgroundColor: '#B8918F',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  inspirationButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  colorPalette: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  addColorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#9AA493',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outfitCard: {
    backgroundColor: '#FDFCFB',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#B8918F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    borderLeftWidth: 5,
    borderLeftColor: '#9AA493',
  },
  outfitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  outfitTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#B8918F',
  },
  weatherText: {
    fontSize: 12,
    color: '#666',
  },
  outfitItems: {
    marginBottom: 16,
  },
  outfitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  outfitItemText: {
    fontSize: 14,
    color: '#2C3E50',
    marginLeft: 8,
  },
  outfitCta: {
    fontSize: 14,
    color: '#B8918F',
    fontWeight: 'bold',
    textAlign: 'center',
  },

}); 
