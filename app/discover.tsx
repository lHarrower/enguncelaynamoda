import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import CustomModal from '../components/CustomModal';
import ModernActionSheet from '../components/ModernActionSheet';
import ModernLoading from '../components/ModernLoading';

const featuredBoutiques = [
  { id: 1, name: 'Chic Boutique', rating: 4.8, newArrivals: 25, category: 'Designer' },
  { id: 2, name: 'Fashion Forward', rating: 4.6, newArrivals: 18, category: 'Trendy' },
  { id: 3, name: 'Style Studio', rating: 4.9, newArrivals: 12, category: 'Luxury' },
];

const saleItems = [
  { id: 1, title: 'Bohemian Maxi Dress', brand: 'Free People', price: '$180', salePrice: '$108', discount: '40%', match: '92%' },
  { id: 2, title: 'Leather Ankle Boots', brand: 'Steve Madden', price: '$150', salePrice: '$90', discount: '40%', match: '85%' },
  { id: 3, title: 'Silk Wrap Top', brand: 'Reformation', price: '$95', salePrice: '$57', discount: '40%', match: '88%' },
];

const trendingCategories = [
  { name: 'Summer', count: '120+ items', color: '#B8918F', icon: 'sunny' },
  { name: 'Designer', count: '85+ items', color: '#9AA493', icon: 'diamond' },
  { name: 'Vintage', count: '95+ items', color: '#C2958A', icon: 'library' },
  { name: 'Boho', count: '65+ items', color: '#B8A084', icon: 'leaf' },
];

export default function DiscoverScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
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

  const handleSearch = () => {
    if (searchQuery.trim() === '') {
      showCustomAlert("Search Required", "Please enter something to search for! 🔍", [{ text: "OK", onPress: hideCustomAlert }]);
      return;
    }
    
    showLoading('Searching...', 'Finding amazing matches for you');
    
    setTimeout(() => {
      hideLoading();
      showCustomAlert(
        "Search Results 🔍",
        `Searching for "${searchQuery}"...\n\n✨ Found 42 amazing matches!\n• 15 exact matches\n• 27 similar items\n• 8 on sale\n\nReady to explore your results?`,
        [
          { text: "🛍️ Show Results", icon: "storefront", style: "primary", onPress: () => {
            hideCustomAlert();
            showCustomAlert("Results Loaded!", "Your personalized search results are ready! 💖", [{ text: "OK", onPress: hideCustomAlert }], "success");
            setSearchQuery('');
          }},
          { text: "🎯 Refine Search", icon: "filter", onPress: () => {
            hideCustomAlert();
            showCustomAlert("Search Filters", "Advanced search filters would open here! 🎛️", [{ text: "OK", onPress: hideCustomAlert }], "info");
          }},
          { text: "Cancel", onPress: hideCustomAlert, style: "cancel" }
        ]
      );
    }, 800);
  };

  const handleBoutiquePress = (boutique: any) => {
    showLoading(`Loading ${boutique.name}...`, 'Getting boutique details');
    
    setTimeout(() => {
      hideLoading();
      showActionSheet(
        `${boutique.name} ✨`,
        `⭐ Rating: ${boutique.rating}/5 • 📂 Category: ${boutique.category} • 🆕 New Arrivals: ${boutique.newArrivals} items\n💝 Special offer: 20% off first purchase!`,
        [
          { 
            title: "💖 Follow Boutique", 
            icon: "heart",
            subtitle: "Get notified of new arrivals and sales",
            style: "primary",
            onPress: () => {
              hideActionSheet();
              showCustomAlert("Following! 💖", `You're now following ${boutique.name}! You'll get notified of new arrivals and sales! ✨`, [{ text: "OK", onPress: hideCustomAlert }], "success");
            }
          },
          { 
            title: "👗 Browse Items", 
            icon: "storefront",
            subtitle: "Explore their amazing collection",
            onPress: () => {
              hideActionSheet();
              showCustomAlert("Browse Collection", `Exploring ${boutique.name}'s amazing collection! 🛍️`, [{ text: "OK", onPress: hideCustomAlert }], "info");
            }
          },
          { 
            title: "🏪 View Profile", 
            icon: "business",
            subtitle: "See detailed boutique information",
            onPress: () => {
              hideActionSheet();
              showCustomAlert("Boutique Profile", `${boutique.name} - Est. 2020\nSpecialties: ${boutique.category}\nCustomer Reviews: ${boutique.rating}/5 ⭐`, [{ text: "OK", onPress: hideCustomAlert }], "info");
            }
          },
          { 
            title: "📱 Share", 
            icon: "share",
            subtitle: "Share with friends",
            onPress: () => {
              hideActionSheet();
              showCustomAlert("Shared! 📱", `You've shared ${boutique.name} with friends! 💖`, [{ text: "OK", onPress: hideCustomAlert }], "success");
            }
          }
        ]
      );
    }, 500);
  };

  const handleSaleItemPress = (item: any) => {
    showActionSheet(
      `${item.title} 💖`,
      `✨ Brand: ${item.brand} • 💯 Match: ${item.match}\n💰 Price: ${item.salePrice} (was ${item.price}) • 🔥 Discount: ${item.discount} off!\n⏰ Sale ends in 2 hours!`,
      [
        { 
          title: "💖 Add to Favorites", 
          icon: "heart",
          subtitle: "Save this amazing item",
          style: "primary",
          onPress: () => { 
            hideActionSheet(); 
            toggleFavorite(item.id);
          }
        },
        { 
          title: "👗 Add to Wardrobe", 
          icon: "shirt",
          subtitle: "Perfect for outfit planning",
          onPress: () => {
            hideActionSheet();
            showCustomAlert("Added to Wardrobe! ✨", "This fabulous item has been added to your virtual wardrobe! 👗", [{ text: "OK", onPress: hideCustomAlert }], "success");
          }
        },
        { 
          title: "🛒 Buy Now", 
          icon: "storefront",
          subtitle: "Secure checkout - save big!",
          onPress: () => {
            hideActionSheet();
            showCustomAlert("Purchase Confirmation", "Redirecting to secure checkout... 💳\n\nYou're about to save big!", [{ text: "OK", onPress: hideCustomAlert }], "success");
          }
        },
        { 
          title: "📱 Share Deal", 
          icon: "share",
          subtitle: "Share this amazing find",
          onPress: () => {
            hideActionSheet();
            showCustomAlert("Deal Shared! 📱", "Your friends will thank you for this amazing find! 💖", [{ text: "OK", onPress: hideCustomAlert }], "success");
          }
        }
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

  const handleFilterPress = (filterName: string) => {
    setSelectedFilters(prev =>
      prev.includes(filterName)
        ? prev.filter(f => f !== filterName)
        : [...prev, filterName]
    );
    
    // Show immediate feedback
    const isAdding = !selectedFilters.includes(filterName);
    if (isAdding) {
      showCustomAlert("Filter Applied! 🎯", `Showing ${filterName.toLowerCase()} items! Results updated! ✨`, [{ text: "OK", onPress: hideCustomAlert }], "success");
    }
  };

  const handleTrendingCategoryPress = (category: any) => {
    showLoading(`Loading ${category.name}...`, 'Finding trending styles');
    
    setTimeout(() => {
      hideLoading();
      showActionSheet(
        `${category.name} Collection 🔥`,
        `🌟 Discover ${category.count} in trending ${category.name.toLowerCase()} styles!\n\n✨ What's trending: Bold patterns, Vintage inspired, Sustainable materials`,
        [
          { 
            title: "🔥 Browse Collection", 
            icon: "flame",
            subtitle: "See all trending items",
            style: "primary",
            onPress: () => {
              hideActionSheet();
              showCustomAlert("Trending Items", `Loading ${category.name} trending collection! Get ready to be amazed! ✨`, [{ text: "OK", onPress: hideCustomAlert }], "success");
            }
          },
          { 
            title: "🔔 Set Alert", 
            icon: "notifications",
            subtitle: "Get notified of new arrivals",
            onPress: () => {
              hideActionSheet();
              showCustomAlert("Alert Set! 🔔", `You'll be the first to know about new ${category.name.toLowerCase()} arrivals and sales! 💖`, [{ text: "OK", onPress: hideCustomAlert }], "success");
            }
          },
          { 
            title: "📊 Trend Report", 
            icon: "bar-chart",
            subtitle: "See detailed trend analysis",
            onPress: () => {
              hideActionSheet();
              showCustomAlert("Trend Analysis", `${category.name} is 85% more popular this month!\nTop colors: Pink, Beige, Sage\nTop styles: Minimalist, Boho ✨`, [{ text: "OK", onPress: hideCustomAlert }], "info");
            }
          }
        ]
      );
    }, 600);
  };

  const handleQuizPress = () => {
    showActionSheet(
      "Style Quiz ✨",
      "Discover your personal style and get customized recommendations!\n\n🎯 Quick 2-minute quiz • 💖 Personalized results • 🛍️ Custom shopping suggestions",
      [
        { 
          title: "🚀 Take Quiz", 
          icon: "rocket",
          subtitle: "Discover your unique fashion DNA",
          style: "primary",
          onPress: () => {
            hideActionSheet();
            showCustomAlert("Style Quiz 📝", "Loading your personalized style quiz! Get ready to discover your unique fashion DNA! ✨", [{ text: "OK", onPress: hideCustomAlert }], "info");
          }
        },
        { 
          title: "📋 Previous Results", 
          icon: "document-text",
          subtitle: "See your last quiz results",
          onPress: () => {
            hideActionSheet();
            showCustomAlert("Your Style", "Your style: Romantic Minimalist\n85% match with current trends! 💖", [{ text: "OK", onPress: hideCustomAlert }], "success");
          }
        }
      ]
    );
  };

  const handleFlashSalePress = () => {
    showLoading('Loading flash sale...', 'Getting exclusive deals');
    
    setTimeout(() => {
      hideLoading();
      showActionSheet(
        "🔥 FLASH SALE ALERT! 🔥",
        "⚡ Limited time offer: Up to 70% off designer items!\n\n⏰ Only 1 hour 47 minutes left! • 💖 254 people viewing • 🛍️ 18 items in your size available",
        [
          { 
            title: "🛒 Shop Now", 
            icon: "storefront",
            subtitle: "Don't miss these incredible deals!",
            style: "primary",
            onPress: () => {
              hideActionSheet();
              showCustomAlert("Flash Sale Items", "Loading exclusive sale items just for you! ⚡💖", [{ text: "OK", onPress: hideCustomAlert }], "success");
            }
          },
          { 
            title: "⏰ Set Reminder", 
            icon: "alarm",
            subtitle: "Get notified of future flash sales",
            onPress: () => {
              hideActionSheet();
              showCustomAlert("Reminder Set! ⏰", "We'll notify you of future flash sales 15 minutes before they start! 🔔", [{ text: "OK", onPress: hideCustomAlert }], "success");
            }
          },
          { 
            title: "📱 Share with Friends", 
            icon: "share",
            subtitle: "Spread the amazing deals",
            onPress: () => {
              hideActionSheet();
              showCustomAlert("Shared! 📱", "Your friends will love you for sharing this amazing sale! 💖", [{ text: "OK", onPress: hideCustomAlert }], "success");
            }
          }
        ]
      );
    }, 400);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Discover Magic ✨</Text>
            <Text style={styles.subtitle}>Find your next favorite piece</Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationIcon}
            onPress={() => showCustomAlert("Notifications", "3 new sale alerts! 🔔", [{ text: "OK", onPress: hideCustomAlert }], "info")}
          >
            <Ionicons name="notifications" size={24} color="#B8918F" />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#B8918F" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search items, brands, styles..."
              placeholderTextColor="#B5A3BC"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
          </View>
          <TouchableOpacity style={styles.filterButton} onPress={() => showCustomAlert("Filters", "Filter options would open here! 🎛️", [{ text: "OK", onPress: hideCustomAlert }], "info")}>
            <Ionicons name="options" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Flash Sale Banner */}
        <TouchableOpacity style={styles.flashSaleBanner} onPress={handleFlashSalePress}>
          <Text style={styles.flashSaleText}>🔥 FLASH SALE! Up to 70% off</Text>
          <Text style={styles.flashSaleSubtext}>Limited time offer - Don't miss out!</Text>
        </TouchableOpacity>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          {['All', 'New', 'Sale', 'Designer', 'Vintage', 'Trending'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterPill,
                selectedFilters.includes(filter) && styles.filterPillActive
              ]}
              onPress={() => handleFilterPress(filter)}
            >
              <Text style={[
                styles.filterText,
                selectedFilters.includes(filter) && styles.filterTextActive
              ]}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Boutiques */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Featured Boutiques</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {featuredBoutiques.map((boutique) => (
              <TouchableOpacity 
                key={boutique.id} 
                style={styles.boutiqueCard}
                onPress={() => handleBoutiquePress(boutique)}
              >
                <View style={styles.boutiqueImagePlaceholder}>
                  <Ionicons name="storefront" size={40} color="#B8918F" />
                </View>
                <Text style={styles.boutiqueName}>{boutique.name}</Text>
                <View style={styles.boutiqueInfo}>
                  <Text style={styles.boutiqueRating}>⭐ {boutique.rating}</Text>
                  <Text style={styles.boutiqueCategory}>{boutique.category}</Text>
                </View>
                <Text style={styles.newArrivals}>{boutique.newArrivals} new arrivals</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Sale Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💝 Perfect Matches on Sale</Text>
          {saleItems.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.saleCard}
              onPress={() => handleSaleItemPress(item)}
            >
              <View style={styles.saleCardContent}>
                <View style={styles.saleItemImage}>
                  <Ionicons name="shirt" size={30} color="#B8918F" />
                </View>
                <View style={styles.saleItemInfo}>
                  <Text style={styles.saleItemTitle}>{item.title}</Text>
                  <Text style={styles.saleItemBrand}>{item.brand}</Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.salePrice}>{item.salePrice}</Text>
                    <Text style={styles.originalPrice}>{item.price}</Text>
                    <Text style={styles.discountBadge}>{item.discount} OFF</Text>
                  </View>
                </View>
                <View style={styles.saleCardActions}>
                  <View style={styles.matchBadge}>
                    <Text style={styles.matchText}>{item.match}</Text>
                  </View>
                  <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
                    <Ionicons 
                      name={favorites.includes(item.id) ? "heart" : "heart-outline"} 
                      size={24} 
                      color="#B8918F" 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Trending Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 Trending Now</Text>
          <View style={styles.categoriesGrid}>
            {trendingCategories.map((category, index) => (
              <TouchableOpacity 
                key={index} 
                style={[styles.categoryCard, { backgroundColor: category.color }]}
                onPress={() => handleTrendingCategoryPress(category)}
              >
                <Ionicons name={category.icon as any} size={32} color="#FFFFFF" />
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryCount}>{category.count}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Personal Shopping Assistant */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🤖 Your AI Shopping Assistant</Text>
          <TouchableOpacity style={styles.assistantCard} onPress={() => Alert.alert("AI Assistant 🤖", "Hi! I'm Maya, your personal shopping assistant! I can help you:\n\n• Find items that match your style\n• Get the best deals\n• Coordinate outfits\n• Track your favorite brands\n\nWhat would you like to discover today?", [{ text: "Let's Chat!", onPress: () => Alert.alert("Chat", "AI chat feature coming soon! 💬✨") }, { text: "Maybe Later", style: "cancel" }])}>
            <View style={styles.assistantAvatar}>
              <Ionicons name="sparkles" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.assistantInfo}>
              <Text style={styles.assistantName}>Maya - Your Style Expert</Text>
              <Text style={styles.assistantMessage}>
                "I found 12 new items that match your style! Want to see them?"
              </Text>
            </View>
            <View style={styles.chatBubble}>
              <Text style={styles.chatBubbleText}>💬</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Style Quiz CTA */}
        <TouchableOpacity style={styles.quizCTA} onPress={handleQuizPress}>
          <Text style={styles.quizTitle}>✨ Discover Your Style</Text>
          <Text style={styles.quizText}>Take our style quiz for personalized recommendations!</Text>
          <View style={styles.quizButton}>
            <Text style={styles.quizButtonText}>Start Quiz →</Text>
          </View>
        </TouchableOpacity>
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
  notificationIcon: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#C2958A',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDFCFB',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    shadowColor: '#B8918F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#2C3E50',
  },
  filterButton: {
    backgroundColor: '#B8918F',
    borderRadius: 25,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#B8918F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  flashSaleBanner: {
    backgroundColor: '#B8918F',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#B8918F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  flashSaleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  flashSaleSubtext: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  filtersContainer: {
    marginBottom: 20,
  },
  filterPill: {
    backgroundColor: '#FDFCFB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#B8918F',
  },
  filterPillActive: {
    backgroundColor: '#B8918F',
  },
  filterText: {
    fontSize: 14,
    color: '#B8918F',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#B8918F',
    marginBottom: 16,
  },
  boutiqueCard: {
    backgroundColor: '#FDFCFB',
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    width: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  boutiqueImagePlaceholder: {
    width: '100%',
    height: 80,
    backgroundColor: '#F0E6E3',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  boutiqueName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  boutiqueInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  boutiqueRating: {
    fontSize: 12,
    color: '#D4B896',
    fontWeight: 'bold',
  },
  boutiqueCategory: {
    fontSize: 12,
    color: '#9AA493',
    fontWeight: '600',
  },
  newArrivals: {
    fontSize: 11,
    color: '#666',
  },
  saleCard: {
    backgroundColor: '#FDFCFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#B8918F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    borderLeftWidth: 5,
    borderLeftColor: '#B8918F',
  },
  saleCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saleItemImage: {
    width: 60,
    height: 60,
    backgroundColor: '#F0E6E3',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  saleItemInfo: {
    flex: 1,
  },
  saleItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  saleItemBrand: {
    fontSize: 12,
    color: '#9AA493',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  salePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#B8918F',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountBadge: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: 'bold',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  saleCardActions: {
    alignItems: 'center',
  },
  matchBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  matchText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  quizCTA: {
    backgroundColor: '#FDFCFB',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#B8918F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#B8918F',
  },
  quizTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#B8918F',
    marginBottom: 8,
  },
  quizText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  quizButton: {
    backgroundColor: '#B8918F',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  quizButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  assistantCard: {
    backgroundColor: '#FDFCFB',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#B8918F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#B8918F',
  },
  assistantAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#B8918F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  assistantInfo: {
    flex: 1,
  },
  assistantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#B8918F',
    marginBottom: 4,
  },
  assistantMessage: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  chatBubble: {
    backgroundColor: '#C2958A',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatBubbleText: {
    fontSize: 16,
  },
}); 
