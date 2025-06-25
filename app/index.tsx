import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import CustomModal from '../components/CustomModal';
import ModernActionSheet from '../components/ModernActionSheet';
import ModernLoading from '../components/ModernLoading';
import Header from '../components/home/Header';
import SaleBanner from '../components/home/SaleBanner';
import { onShare, shareApp, shareWardrobeItem } from '../utils/sharing';

const sampleRecommendations = [
  { id: 1, title: "Pink Floral Dress", brand: "Zara", price: "$89", salePrice: "$59", match: "95%" },
  { id: 2, title: "Designer Handbag", brand: "Coach", price: "$320", salePrice: "$240", match: "88%" },
  { id: 3, title: "Summer Sandals", brand: "Steve Madden", price: "$95", salePrice: "$67", match: "92%" },
];

const trendingItems = [
  { id: 1, title: "Boho Maxi Dress", trend: "🔥 Trending" },
  { id: 2, title: "Statement Earrings", trend: "✨ New" },
  { id: 3, title: "Vintage Blazer", trend: "💎 Premium" },
];

export default function HomeScreen() {
  const router = useRouter();
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

  const toggleFavorite = (itemId: number) => {
    setFavorites(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
    // No notification - silent favorite toggle
  };

  const handleNotificationPress = () => {
    showLoading('Loading notifications...', 'Fetching your latest updates');
    
    // Simulate loading
    setTimeout(() => {
      hideLoading();
      showCustomAlert(
        "Notifications",
        "• Flash sale alert: Up to 70% off designer items\n• New arrivals from Chic Boutique\n• Your favorite dress is back in stock\n• Style tip: Try mixing patterns this season!",
        [
          { text: "Mark All Read", icon: "checkmark-done", style: "primary", onPress: () => {
            hideCustomAlert();
            setTimeout(() => showCustomAlert("Success", "All notifications marked as read! ✅", [{ text: "OK", onPress: hideCustomAlert }], "success"), 300);
          }},
          { text: "Settings", icon: "settings", onPress: () => { hideCustomAlert(); router.push('/profile'); }},
          { text: "Close", onPress: hideCustomAlert, style: "cancel" }
        ],
        "info"
      );
    }, 500);
  };

  const handleSaleBanner = () => {
    showLoading('Loading amazing deals...', 'Preparing exclusive offers for you');
    
    setTimeout(() => {
      hideLoading();
      showCustomAlert(
        "MEGA SALE!",
        "You're about to discover amazing deals up to 70% off! Ready to save big?",
        [
          { text: "Let's Shop!", icon: "storefront", style: "primary", onPress: () => { hideCustomAlert(); router.push('/discover'); }},
          { text: "Maybe Later", onPress: hideCustomAlert, style: "cancel" }
        ],
        "warning"
      );
    }, 300);
  };

  const handleRecommendationPress = (item: any) => {
    showActionSheet(
      item.title,
      `${item.brand} • ${item.salePrice} (was ${item.price}) • ${item.match} match`,
      [
        { 
          title: "Add to Favorites", 
          icon: "heart",
          subtitle: "Save this item to your favorites",
          style: "primary",
          onPress: () => { 
            hideActionSheet(); 
            toggleFavorite(item.id);
            showCustomAlert("Added to Favorites! 💖", "You can find this item in your favorites tab anytime.", [{ text: "OK", onPress: hideCustomAlert }], "success");
          }
        },
        { 
          title: "Add to Wardrobe", 
          icon: "shirt",
          subtitle: "Add to your virtual wardrobe",
          onPress: () => {
            hideActionSheet();
            setTimeout(() => {
              showCustomAlert("Added to Wardrobe! ✨", "This item has been added to your virtual wardrobe!", [{ text: "View Wardrobe", onPress: () => { hideCustomAlert(); router.push('/wardrobe'); } }, { text: "OK", onPress: hideCustomAlert }], "success");
            }, 300);
          }
        },
        { 
          title: "View Similar Items", 
          icon: "search",
          subtitle: "Find more items like this",
          onPress: () => { hideActionSheet(); router.push('/discover'); }
        },
        { 
          title: "Share Item", 
          icon: "share",
          subtitle: "Share with friends",
          onPress: async () => { 
            hideActionSheet(); 
            showLoading('Preparing to share...', 'Getting share options ready');
            
            // Simulate brief loading for UX
            setTimeout(async () => {
              hideLoading();
              const success = await shareWardrobeItem(
                item.title,
                item.brand,
                'Fashion Item'
              );
              
              if (success) {
                showCustomAlert("Shared Successfully! ✨", "Your fashion find has been shared with your friends!", [{ text: "Great!", onPress: hideCustomAlert }], "success");
              }
            }, 300);
          }
        }
      ]
    );
  };

  const handleQuickAction = (action: string) => {
    showLoading(`Processing ${action}...`, 'Just a moment please');
    
    setTimeout(() => {
      hideLoading();
      
      switch (action) {
        case 'camera':
          showActionSheet(
            "Add Outfit Photo",
            "Choose how you'd like to add this outfit to your wardrobe",
            [
              { 
                title: "Take Photo", 
                icon: "camera",
                subtitle: "Use your camera to capture a new outfit",
                style: "primary",
                onPress: () => {
                  hideActionSheet();
                  if ((global as any).permissionManager) {
                    (global as any).permissionManager.openCamera();
                  }
                }
              },
              { 
                title: "Choose from Gallery", 
                icon: "images",
                subtitle: "Select from your photo library",
                onPress: () => {
                  hideActionSheet();
                  if ((global as any).permissionManager) {
                    (global as any).permissionManager.openImagePicker();
                  }
                }
              }
            ]
          );
          break;
        case 'search':
          showActionSheet(
            "Find Amazing Sales!",
            "Let's discover the best deals and trending items just for you",
            [
              { 
                title: "Browse Sales", 
                icon: "flash",
                subtitle: "Discover the hottest deals and discounts",
                style: "primary",
                onPress: () => { hideActionSheet(); router.push('/discover'); }
              },
              { 
                title: "Trending Items", 
                icon: "trending-up",
                subtitle: "See what's popular right now",
                onPress: () => { hideActionSheet(); router.push('/discover'); }
              },
              { 
                title: "All Categories", 
                icon: "grid",
                subtitle: "Browse by your favorite categories",
                onPress: () => { hideActionSheet(); router.push('/discover'); }
              }
            ]
          );
          break;
        case 'boutiques':
          showActionSheet(
            "Discover Boutiques",
            "Explore curated boutiques and find your new favorite stores",
            [
              { 
                title: "Featured Boutiques", 
                icon: "storefront",
                subtitle: "Hand-picked premium boutiques",
                style: "primary",
                onPress: () => { hideActionSheet(); router.push('/discover'); }
              },
              { 
                title: "Local Stores", 
                icon: "location",
                subtitle: "Find boutiques near you",
                onPress: () => { hideActionSheet(); router.push('/discover'); }
              },
              { 
                title: "New & Emerging", 
                icon: "star",
                subtitle: "Discover upcoming designers",
                onPress: () => { hideActionSheet(); router.push('/discover'); }
              }
            ]
          );
          break;
      }
    }, 600);
  };

  const handleTrendingPress = (item: any) => {
    showCustomAlert(
      `${item.title} ${item.trend}`,
      "This is super trendy right now! Everyone's talking about it. Want to explore similar trending items?",
      [
        { text: "🔥 See What's Trending", onPress: () => { hideCustomAlert(); router.push('/discover'); }},
        { text: "💖 Add to Wishlist", onPress: () => {
          hideCustomAlert();
          setTimeout(() => showCustomAlert("Added to Wishlist! ✨", "You'll be notified when similar items go on sale!", [{ text: "OK", onPress: hideCustomAlert }]), 300);
        }},
        { text: "Maybe Later", onPress: hideCustomAlert, style: "cancel" }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Header 
          onNotificationPress={handleNotificationPress}
          notificationCount={3}
        />

        {/* Featured Sale Banner */}
        <SaleBanner onPress={handleSaleBanner} />

        {/* Personalized Recommendations Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💝 Just For You</Text>
          <Text style={styles.sectionSubtitle}>
            Items that match your style perfectly
          </Text>
          
          {sampleRecommendations.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.recommendationCard}
              onPress={() => handleRecommendationPress(item)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.matchBadge}>
                  <Text style={styles.matchText}>{item.match} Match</Text>
                </View>
                <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
                  <Ionicons 
                    name={favorites.includes(item.id) ? "heart" : "heart-outline"} 
                    size={24} 
                    color="#B8A084" 
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.brandText}>{item.brand}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.salePrice}>{item.salePrice}</Text>
                  <Text style={styles.originalPrice}>{item.price}</Text>
                  <Text style={styles.savingsText}>Save ${parseInt(item.price.slice(1)) - parseInt(item.salePrice.slice(1))}!</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={[styles.actionCard, styles.actionCardBrown]}
              onPress={() => handleQuickAction('camera')}
            >
              <Ionicons name="camera" size={28} color="#FFFFFF" />
              <Text style={styles.actionTextWhite}>Add Outfit</Text>
              <Text style={styles.actionSubtext}>Take a photo</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionCard, styles.actionCardGreen]}
              onPress={() => handleQuickAction('search')}
            >
              <Ionicons name="search" size={28} color="#FFFFFF" />
              <Text style={styles.actionTextWhite}>Find Sales</Text>
              <Text style={styles.actionSubtext}>Browse deals</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionCard, styles.actionCardCoral]}
              onPress={() => handleQuickAction('boutiques')}
            >
              <Ionicons name="storefront" size={28} color="#FFFFFF" />
              <Text style={styles.actionTextWhite}>Boutiques</Text>
              <Text style={styles.actionSubtext}>Discover stores</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Trending Now */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 Trending Now</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {trendingItems.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.trendingCard}
                onPress={() => handleTrendingPress(item)}
              >
                <Text style={styles.trendLabel}>{item.trend}</Text>
                <Text style={styles.trendTitle}>{item.title}</Text>
                <Text style={styles.shopNowText}>Shop Now →</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Style Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💅 Your Style Goals</Text>
          <TouchableOpacity 
            style={styles.goalsCard}
            onPress={() => router.push('/profile')}
          >
            <View style={styles.goalProgress}>
              <Text style={styles.goalTitle}>Complete Your Style Profile</Text>
              <Text style={styles.goalSubtitle}>75% Complete</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '75%' }]} />
              </View>
            </View>
            <View style={styles.goalItem}>
              <Text style={styles.goalNumber}>12</Text>
              <Text style={styles.goalLabel}>Items in wardrobe</Text>
            </View>
            <View style={styles.goalItem}>
              <Text style={styles.goalNumber}>$240</Text>
              <Text style={styles.goalLabel}>Saved this month</Text>
            </View>
            <View style={styles.goalItem}>
              <Text style={styles.goalNumber}>8</Text>
              <Text style={styles.goalLabel}>Favorite boutiques</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Share AYNAMODA */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💖 Share the Love</Text>
          <TouchableOpacity 
            style={styles.shareCard}
            onPress={async () => {
              showLoading('Preparing to share...', 'Getting share options ready');
              
              // Brief delay for better UX
              setTimeout(async () => {
                hideLoading();
                const success = await shareApp();
                
                if (success) {
                  showCustomAlert("Thanks for Sharing! 🌟", "Help your friends discover their perfect style with AYNAMODA!", [{ text: "You're Welcome!", onPress: hideCustomAlert }], "success");
                }
              }, 400);
            }}
          >
            <View style={styles.shareCardContent}>
              <Ionicons name="share-social" size={32} color="#B8918F" />
              <View style={styles.shareCardText}>
                <Text style={styles.shareCardTitle}>Tell Your Friends About AYNAMODA</Text>
                <Text style={styles.shareCardSubtitle}>Share the app and help them discover their perfect style ✨</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#B8918F" />
            </View>
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


  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#7A6B56',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#B8918F',
    marginBottom: 16,
  },
  recommendationCard: {
    backgroundColor: '#FDFCFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#B8918F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderLeftWidth: 5,
    borderLeftColor: '#B8918F',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  matchBadge: {
    backgroundColor: '#F0E6E3',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matchText: {
    color: '#B8918F',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  brandText: {
    fontSize: 14,
    color: '#9AA493',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  salePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#B8918F',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  savingsText: {
    fontSize: 12,
    color: '#9AA493',
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  actionCardBrown: {
    backgroundColor: '#B8918F',
  },
  actionCardGreen: {
    backgroundColor: '#9AA493',
  },
  actionCardCoral: {
    backgroundColor: '#D4A896',
  },
  actionTextWhite: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 8,
    fontWeight: 'bold',
  },
  actionSubtext: {
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 2,
  },
  trendingCard: {
    backgroundColor: '#FDFCFB',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#B5A3BC',
  },
  trendLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#B5A3BC',
    marginBottom: 4,
  },
  trendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  shopNowText: {
    fontSize: 12,
    color: '#B8918F',
    fontWeight: 'bold',
  },
  goalsCard: {
    backgroundColor: '#FDFCFB',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#B8918F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  goalItem: {
    alignItems: 'center',
  },
  goalNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#B8918F',
    marginBottom: 4,
  },
  goalLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  goalProgress: {
    flex: 1,
    marginRight: 16,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7A6B56',
    marginBottom: 4,
  },
  goalSubtitle: {
    fontSize: 12,
    color: '#B8918F',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#9AA493',
    borderRadius: 3,
  },
  shareCard: {
    backgroundColor: '#FDFCFB',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#B8918F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderLeftWidth: 5,
    borderLeftColor: '#B8918F',
  },
  shareCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareCardText: {
    flex: 1,
    marginLeft: 16,
    marginRight: 12,
  },
  shareCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7A6B56',
    marginBottom: 4,
  },
  shareCardSubtitle: {
    fontSize: 14,
    color: '#B8918F',
    lineHeight: 20,
  },

}); 
