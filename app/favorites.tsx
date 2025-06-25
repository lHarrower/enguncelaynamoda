import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import CustomModal from '../components/CustomModal';
import ModernActionSheet from '../components/ModernActionSheet';
import ModernLoading from '../components/ModernLoading';

const favoriteItems = [
  { id: 1, name: 'Pink Floral Dress', brand: 'Zara', price: '$89', salePrice: '$59', onSale: true, category: 'Dresses' },
  { id: 2, name: 'Designer Handbag', brand: 'Coach', price: '$320', salePrice: '$240', onSale: true, category: 'Accessories' },
  { id: 3, name: 'Silk Blouse', brand: 'H&M', price: '$45', salePrice: null, onSale: false, category: 'Tops' },
  { id: 4, name: 'Ankle Boots', brand: 'Steve Madden', price: '$120', salePrice: '$84', onSale: true, category: 'Shoes' },
  { id: 5, name: 'Statement Earrings', brand: 'Pandora', price: '$65', salePrice: null, onSale: false, category: 'Accessories' },
];

const favoriteBoutiques = [
  { id: 1, name: 'Chic Boutique', rating: 4.8, newArrivals: 12, category: 'Designer' },
  { id: 2, name: 'Fashion Forward', rating: 4.6, newArrivals: 8, category: 'Trendy' },
  { id: 3, name: 'Style Studio', rating: 4.9, newArrivals: 5, category: 'Luxury' },
];

export default function FavoritesScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'items' | 'boutiques'>('items');
  const [itemFavorites, setItemFavorites] = useState<number[]>([1, 2, 3, 4, 5]);
  const [boutiqueFavorites, setBoutiqueFavorites] = useState<number[]>([1, 2, 3]);
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

  const handleItemPress = (item: any) => {
    showLoading(`Loading ${item.name}...`, 'Getting item details');
    
    setTimeout(() => {
      hideLoading();
      showActionSheet(
        `${item.name} 💖`,
        `✨ Brand: ${item.brand} • 📂 Category: ${item.category}\n💰 Price: ${item.onSale ? item.salePrice : item.price}${item.onSale ? ` (was ${item.price}) 🔥` : ''}\n${item.onSale ? '⏰ Sale ends soon!' : ''}`,
        [
          { 
            title: "👀 View Details", 
            icon: "eye",
            subtitle: "See full item details and styling options",
            style: "primary",
            onPress: () => {
              hideActionSheet();
              showCustomAlert("Item Details", "Loading detailed view with styling options! ✨", [{ text: "OK", onPress: hideCustomAlert }], "info");
            router.push('/discover');
            }
          },
          { 
            title: "👗 Add to Wardrobe", 
            icon: "shirt",
            subtitle: "Perfect for outfit planning",
            onPress: () => {
              hideActionSheet();
              showCustomAlert("Added to Wardrobe! ✨", "This favorite item is now in your virtual wardrobe! Perfect for outfit planning! 👗", [{ text: "OK", onPress: hideCustomAlert }], "success");
            }
          },
          { 
            title: "🛒 Buy Now", 
            icon: "storefront",
            subtitle: "Secure checkout available",
            onPress: () => {
              hideActionSheet();
              showCustomAlert("Purchase Ready", "Redirecting to secure checkout! You've made an excellent choice! 💳", [{ text: "OK", onPress: hideCustomAlert }], "success");
            }
          },
          { 
            title: "📱 Share", 
            icon: "share",
            subtitle: "Share with friends",
            onPress: () => {
              hideActionSheet();
              showCustomAlert("Shared! 📱", "Your friends will love this item as much as you do! ✨", [{ text: "OK", onPress: hideCustomAlert }], "success");
            }
          },
          { 
            title: "💔 Remove from Favorites", 
            icon: "heart-dislike",
            subtitle: "Remove from your favorites",
            style: "destructive",
            onPress: () => removeFromFavorites(item.id, 'item')
          }
        ]
      );
    }, 500);
  };

  const handleBoutiquePress = (boutique: any) => {
    showLoading(`Loading ${boutique.name}...`, 'Getting boutique information');
    
    setTimeout(() => {
      hideLoading();
      showActionSheet(
        `${boutique.name} ✨`,
        `⭐ Rating: ${boutique.rating}/5 • 📂 Category: ${boutique.category}\n🆕 New Arrivals: ${boutique.newArrivals} items • 💝 Special: 15% off for followers`,
        [
          { 
            title: "🛍️ Browse Items", 
            icon: "storefront",
            subtitle: "Explore their amazing collection",
            style: "primary",
            onPress: () => {
              hideActionSheet();
              showCustomAlert("Browse Collection", `Exploring ${boutique.name}'s amazing collection! 🛍️`, [{ text: "OK", onPress: hideCustomAlert }], "info");
            router.push('/discover');
            }
          },
          { 
            title: "🏪 Visit Profile", 
            icon: "business",
            subtitle: "See detailed boutique information",
            onPress: () => {
              hideActionSheet();
              showCustomAlert("Boutique Profile", `${boutique.name} - Since 2018\nSpecialties: ${boutique.category}\nFollowers: 12.5K | Reviews: ${boutique.rating}/5 ⭐`, [{ text: "OK", onPress: hideCustomAlert }], "info");
            }
          },
          { 
            title: "🔔 Set Notifications", 
            icon: "notifications",
            subtitle: "Get notified about new arrivals and sales",
            onPress: () => {
              hideActionSheet();
              showCustomAlert("Notifications Set! 🔔", `You'll be the first to know about:\n• New arrivals\n• Flash sales\n• Exclusive offers\nFrom ${boutique.name}! 💖`, [{ text: "OK", onPress: hideCustomAlert }], "success");
            }
          },
          { 
            title: "📱 Share Boutique", 
            icon: "share",
            subtitle: "Share with friends",
            onPress: () => {
              hideActionSheet();
              showCustomAlert("Shared! 📱", `Your friends will discover amazing fashion at ${boutique.name}! ✨`, [{ text: "OK", onPress: hideCustomAlert }], "success");
            }
          },
          { 
            title: "💔 Unfollow", 
            icon: "heart-dislike",
            subtitle: "Stop following this boutique",
            style: "destructive",
            onPress: () => removeFromFavorites(boutique.id, 'boutique')
          }
        ]
      );
    }, 400);
  };

  const removeFromFavorites = (id: number, type: 'item' | 'boutique') => {
    const itemName = type === 'item' ? 'item' : 'boutique';
    
    showCustomAlert(
      `Remove ${itemName === 'item' ? 'Item' : 'Boutique'}?`,
      `Are you sure you want to remove this ${itemName} from your favorites?`,
      [
        { 
          text: `Yes, Remove 💔`, 
          style: "destructive",
          icon: "trash",
          onPress: () => {
            hideCustomAlert();
            if (type === 'item') {
              setItemFavorites(prev => prev.filter(itemId => itemId !== id));
              showCustomAlert("Removed from Favorites 💔", "Item removed from your favorites! You can always add it back later. ✨", [{ text: "OK", onPress: hideCustomAlert }], "info");
            } else {
              setBoutiqueFavorites(prev => prev.filter(boutiqueId => boutiqueId !== id));
              showCustomAlert("Unfollowed 💔", "Boutique unfollowed! You can follow them again anytime. ✨", [{ text: "OK", onPress: hideCustomAlert }], "info");
            }
          }
        },
        { text: "Keep It 💖", onPress: hideCustomAlert, style: "cancel" }
      ],
      "warning"
    );
  };

  const handleSaleAlert = () => {
    const onSaleItems = favoriteItems.filter(item => item.onSale);
    showLoading('Loading sale information...', 'Calculating your savings');
    
    setTimeout(() => {
      hideLoading();
      showCustomAlert(
        "🔥 SALE ALERT! 🔥",
        `Amazing news! ${onSaleItems.length} of your favorite items are on sale right now:\n\n${onSaleItems.map(item => `• ${item.name} - ${item.salePrice || item.price} (was ${item.price})`).join('\n')}\n\n💰 Total savings available: $${onSaleItems.reduce((sum, item) => sum + (parseInt(item.price.slice(1)) - parseInt((item.salePrice || item.price).slice(1))), 0)}\n\nReady to grab these deals?`,
        [
          { text: "🛒 Shop Sale Items", icon: "storefront", style: "primary", onPress: () => {
            hideCustomAlert();
            showCustomAlert("Shopping Mode Activated! 🛒", "Loading your favorite sale items! Time to save big! ✨", [{ text: "OK", onPress: hideCustomAlert }], "success");
            router.push('/discover');
          }},
          { text: "⏰ Set Reminder", icon: "alarm", onPress: () => {
            hideCustomAlert();
            showCustomAlert("Reminder Set! ⏰", "We'll remind you before these sales end! Don't miss out! 🔔", [{ text: "OK", onPress: hideCustomAlert }], "success");
          }},
          { text: "📱 Share Deals", icon: "share", onPress: () => {
            hideCustomAlert();
            showCustomAlert("Deals Shared! 📱", "Your friends will thank you for sharing these amazing deals! 💖", [{ text: "OK", onPress: hideCustomAlert }], "success");
          }},
          { text: "Maybe Later", onPress: hideCustomAlert, style: "cancel" }
        ],
        "warning"
      );
    }, 600);
  };

  const handleQuickAction = (action: string) => {
    showLoading(`Processing ${action}...`, 'Getting everything ready');
    
    setTimeout(() => {
      hideLoading();
      
      switch (action) {
        case 'shop':
          showActionSheet(
            "Shopping Time! 🛍️",
            "Ready to discover new items to love? Let's find your next favorite piece!",
            [
              { title: "🔥 Browse Sales", icon: "flame", subtitle: "Check out current sales and discounts", style: "primary", onPress: () => { hideActionSheet(); router.push('/discover'); }},
              { title: "✨ Trending Items", icon: "trending-up", subtitle: "See what's popular right now", onPress: () => { hideActionSheet(); router.push('/discover'); }},
              { title: "💖 Similar Items", icon: "heart", subtitle: "Find items similar to your favorites", onPress: () => { hideActionSheet(); router.push('/discover'); }}
            ]
          );
          break;
        case 'share':
          showActionSheet(
            "Share Your Style 📱",
            "Share your amazing favorites with friends and family!",
            [
              { title: "📱 Share All Favorites", icon: "share", subtitle: "Share your entire collection", style: "primary", onPress: () => {
                hideActionSheet();
                showCustomAlert("Shared! 📱", "Your entire favorites collection has been shared! Friends will be so inspired! ✨", [{ text: "OK", onPress: hideCustomAlert }], "success");
              }},
              { title: "🎁 Create Wishlist", icon: "gift", subtitle: "Perfect for birthdays and holidays", onPress: () => {
                hideActionSheet();
                showCustomAlert("Wishlist Created! 🎁", "Perfect for birthdays, holidays, or just sharing your style! 💖", [{ text: "OK", onPress: hideCustomAlert }], "success");
              }},
              { title: "📝 Style Inspiration", icon: "create", subtitle: "Share styling tips and inspiration", onPress: () => {
                hideActionSheet();
                showCustomAlert("Style Guide Shared!", "Your fashion inspiration is now spreading! ✨", [{ text: "OK", onPress: hideCustomAlert }], "success");
              }}
            ]
          );
          break;
        case 'organize':
          showActionSheet(
            "Organize Favorites 📂",
            "Keep your favorites perfectly organized!",
            [
              { title: "🏷️ Create Collections", icon: "pricetags", subtitle: "Organize by season, occasion, or style", style: "primary", onPress: () => {
                hideActionSheet();
                showCustomAlert("Collections 🏷️", "Organize by season, occasion, or style! Feature coming soon! ✨", [{ text: "OK", onPress: hideCustomAlert }], "info");
              }},
              { title: "🔄 Sort by Price", icon: "swap-vertical", subtitle: "Sort from low to high or high to low", onPress: () => {
                hideActionSheet();
                showCustomAlert("Sorted! 🔄", "Your favorites are now sorted by price! Easy shopping! 💰", [{ text: "OK", onPress: hideCustomAlert }], "success");
              }},
              { title: "📅 Sort by Date Added", icon: "calendar", subtitle: "See your most recent favorites first", onPress: () => {
                hideActionSheet();
                showCustomAlert("Sorted! 📅", "See your most recent favorites first! ✨", [{ text: "OK", onPress: hideCustomAlert }], "success");
              }}
            ]
          );
          break;
      }
    }, 400);
  };

  const handleClearAll = () => {
    showCustomAlert(
      "Clear All Favorites? 🗑️",
      `Are you sure you want to clear all your ${activeTab === 'items' ? 'favorite items' : 'followed boutiques'}?\n\nThis will remove ${activeTab === 'items' ? itemFavorites.length : boutiqueFavorites.length} ${activeTab} from your favorites.\n\n⚠️ This action cannot be undone.`,
      [
        { 
          text: `Clear All (${activeTab === 'items' ? itemFavorites.length : boutiqueFavorites.length})`, 
          style: "destructive",
          icon: "trash",
          onPress: () => {
            hideCustomAlert();
            if (activeTab === 'items') {
              setItemFavorites([]);
              showCustomAlert("All Items Cleared! 🗑️", "Your favorite items have been cleared! Start fresh and discover new favorites! ✨", [{ text: "OK", onPress: hideCustomAlert }], "info");
            } else {
              setBoutiqueFavorites([]);
              showCustomAlert("All Boutiques Unfollowed! 🗑️", "You've unfollowed all boutiques! Explore and find new amazing stores! ✨", [{ text: "OK", onPress: hideCustomAlert }], "info");
            }
          }
        },
        { text: "Cancel", onPress: hideCustomAlert, style: "cancel" }
      ],
      "warning"
    );
  };

  const onSaleCount = favoriteItems.filter(item => item.onSale).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>My Favorites 💖</Text>
            <Text style={styles.subtitle}>Your most loved pieces & boutiques</Text>
          </View>
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={handleClearAll}
          >
            <Ionicons name="trash-outline" size={20} color="#B8918F" />
          </TouchableOpacity>
        </View>

        {/* Sale Alert Banner */}
        {onSaleCount > 0 && (
          <TouchableOpacity style={styles.saleAlertBanner} onPress={handleSaleAlert}>
            <Text style={styles.saleAlertText}>🚨 {onSaleCount} of your favorites are on sale!</Text>
            <Text style={styles.saleAlertSubtext}>Tap to shop now →</Text>
          </TouchableOpacity>
        )}

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'items' && styles.activeTab]}
            onPress={() => setActiveTab('items')}
          >
            <Text style={[styles.tabText, activeTab === 'items' && styles.activeTabText]}>
              Items ({itemFavorites.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'boutiques' && styles.activeTab]}
            onPress={() => setActiveTab('boutiques')}
          >
            <Text style={[styles.tabText, activeTab === 'boutiques' && styles.activeTabText]}>
              Boutiques ({boutiqueFavorites.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity 
            style={[styles.quickAction, styles.quickActionPink]}
            onPress={() => handleQuickAction('shop')}
          >
            <Ionicons name="bag" size={20} color="#FFFFFF" />
            <Text style={styles.quickActionText}>Shop</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickAction, styles.quickActionPurple]}
            onPress={() => handleQuickAction('share')}
          >
            <Ionicons name="share" size={20} color="#FFFFFF" />
            <Text style={styles.quickActionText}>Share</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickAction, styles.quickActionRose]}
            onPress={() => handleQuickAction('organize')}
          >
            <Ionicons name="folder" size={20} color="#FFFFFF" />
            <Text style={styles.quickActionText}>Organize</Text>
          </TouchableOpacity>
        </View>

        {/* Wishlist Sharing */}
        {activeTab === 'items' && itemFavorites.length > 0 && (
          <TouchableOpacity 
            style={styles.shareWishlistCard}
            onPress={() => showCustomAlert("Share Wishlist 💕", "Share your amazing wishlist with friends and family!\n\n• Get gift ideas from your loved ones\n• Create collaborative wishlists\n• Track what friends are loving\n\nYour wishlist contains " + itemFavorites.length + " fabulous items!", [
              { text: "Share Now", icon: "share", style: "primary", onPress: () => {
                hideCustomAlert();
                showCustomAlert("Shared!", "Your wishlist has been shared! 📱✨", [{ text: "OK", onPress: hideCustomAlert }], "success");
              }},
              { text: "Maybe Later", onPress: hideCustomAlert, style: "cancel" }
            ])}
          >
                         <View style={styles.shareWishlistContent}>
               <Ionicons name="gift" size={32} color="#B8918F" />
               <View style={styles.shareWishlistText}>
                 <Text style={styles.shareWishlistTitle}>Share Your Wishlist 🎁</Text>
                 <Text style={styles.shareWishlistSubtitle}>
                   Perfect for birthdays, holidays, or just sharing your style!
                 </Text>
               </View>
               <Ionicons name="arrow-forward" size={24} color="#B8918F" />
            </View>
          </TouchableOpacity>
        )}

        {/* Content based on active tab */}
        {activeTab === 'items' ? (
          /* Favorite Items */
          <View style={styles.content}>
            {itemFavorites.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="heart-outline" size={64} color="#B5A3BC" />
                <Text style={styles.emptyTitle}>No favorite items yet</Text>
                <Text style={styles.emptyText}>
                  Start browsing and heart items you love!
                </Text>
                <TouchableOpacity 
                  style={styles.emptyButton}
                  onPress={() => router.push('/discover')}
                >
                  <Text style={styles.emptyButtonText}>Discover Items</Text>
                </TouchableOpacity>
              </View>
            ) : (
              favoriteItems
                .filter(item => itemFavorites.includes(item.id))
                .map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.itemCard}
                    onPress={() => handleItemPress(item)}
                  >
                    {item.onSale && (
                      <View style={styles.saleBadge}>
                        <Text style={styles.saleBadgeText}>SALE</Text>
                      </View>
                    )}
                    <View style={styles.itemImage}>
                      <Ionicons name="shirt" size={30} color="#B8918F" />
                    </View>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemBrand}>{item.brand}</Text>
                      <Text style={styles.itemCategory}>{item.category}</Text>
                      <View style={styles.priceContainer}>
                        <Text style={styles.currentPrice}>
                          {item.onSale ? item.salePrice : item.price}
                        </Text>
                        {item.onSale && (
                          <Text style={styles.originalPrice}>{item.price}</Text>
                        )}
                      </View>
                    </View>
                                          <TouchableOpacity 
                        style={styles.heartButton}
                        onPress={() => removeFromFavorites(item.id, 'item')}
                      >
                        <Ionicons name="heart" size={24} color="#B8918F" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))
            )}
          </View>
        ) : (
          /* Favorite Boutiques */
          <View style={styles.content}>
            {boutiqueFavorites.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="storefront-outline" size={64} color="#B5A3BC" />
                <Text style={styles.emptyTitle}>No favorite boutiques yet</Text>
                <Text style={styles.emptyText}>
                  Discover amazing boutiques and follow your favorites!
                </Text>
                <TouchableOpacity 
                  style={styles.emptyButton}
                  onPress={() => router.push('/discover')}
                >
                  <Text style={styles.emptyButtonText}>Find Boutiques</Text>
                </TouchableOpacity>
              </View>
            ) : (
              favoriteBoutiques
                .filter(boutique => boutiqueFavorites.includes(boutique.id))
                .map((boutique) => (
                  <TouchableOpacity 
                    key={boutique.id} 
                    style={styles.boutiqueCard}
                    onPress={() => handleBoutiquePress(boutique)}
                  >
                    <View style={styles.boutiqueImage}>
                      <Ionicons name="storefront" size={40} color="#B8918F" />
                    </View>
                    <View style={styles.boutiqueInfo}>
                      <Text style={styles.boutiqueName}>{boutique.name}</Text>
                      <Text style={styles.boutiqueCategory}>{boutique.category}</Text>
                      <View style={styles.boutiqueStats}>
                        <Text style={styles.boutiqueRating}>⭐ {boutique.rating}</Text>
                        <Text style={styles.newArrivals}>
                          {boutique.newArrivals} new arrivals
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity 
                      style={styles.followButton}
                      onPress={() => removeFromFavorites(boutique.id, 'boutique')}
                    >
                      <Text style={styles.followButtonText}>Following</Text>
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))
            )}
          </View>
        )}
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
  clearButton: {
    padding: 8,
  },
  saleAlertBanner: {
    backgroundColor: '#B8918F',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#B8918F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  saleAlertText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  saleAlertSubtext: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FDFCFB',
    borderRadius: 25,
    padding: 4,
    marginBottom: 20,
    shadowColor: '#B8918F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#B8918F',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9AA493',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickAction: {
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionPink: {
    backgroundColor: '#B8918F',
  },
  quickActionPurple: {
    backgroundColor: '#9AA493',
  },
  quickActionRose: {
    backgroundColor: '#C2958A',
  },
  quickActionText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 6,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#B8918F',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  emptyButton: {
    backgroundColor: '#B8918F',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemCard: {
    backgroundColor: '#FDFCFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#B8918F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    position: 'relative',
  },
  saleBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  saleBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  itemImage: {
    width: 60,
    height: 60,
    backgroundColor: '#F0E6E3',
    borderRadius: 12,
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
    marginBottom: 4,
  },
  itemBrand: {
    fontSize: 12,
    color: '#9AA493',
    marginBottom: 2,
  },
  itemCategory: {
    fontSize: 11,
    color: '#999',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#B8918F',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  heartButton: {
    padding: 8,
  },
  boutiqueCard: {
    backgroundColor: '#FDFCFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#B8918F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  boutiqueImage: {
    width: 60,
    height: 60,
    backgroundColor: '#F0E6E3',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  boutiqueInfo: {
    flex: 1,
  },
  boutiqueName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  boutiqueCategory: {
    fontSize: 12,
    color: '#9AA493',
    marginBottom: 8,
  },
  boutiqueStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boutiqueRating: {
    fontSize: 12,
    color: '#D4B896',
    fontWeight: 'bold',
    marginRight: 12,
  },
  newArrivals: {
    fontSize: 11,
    color: '#666',
  },
  followButton: {
    backgroundColor: '#9AA493',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  followButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 4,
  },
  shareWishlistCard: {
    backgroundColor: '#FDFCFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#B8918F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#F0EDE6',
  },
  shareWishlistContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareWishlistText: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  shareWishlistTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#B8918F',
    marginBottom: 4,
  },
  shareWishlistSubtitle: {
    fontSize: 12,
    color: '#666',
  },
}); 
