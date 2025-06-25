import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import CustomModal from '../components/CustomModal';
import ModernActionSheet from '../components/ModernActionSheet';
import ModernLoading from '../components/ModernLoading';

const userStats = {
  wardrobeItems: 50,
  favoriteItems: 15,
  followingBoutiques: 8,
  totalSaved: 485,
  thisMonthSaved: 127,
  stylesCreated: 23,
};

const recentActivity = [
  { id: 1, type: 'favorite', item: 'Designer Handbag', time: '2 hours ago', color: '#FF1493' },
  { id: 2, type: 'wardrobe', item: 'Summer Dress', time: '1 day ago', color: '#9370DB' },
  { id: 3, type: 'boutique', item: 'Followed Chic Boutique', time: '2 days ago', color: '#FF6347' },
  { id: 4, type: 'save', item: 'Saved $45 on Zara dress', time: '3 days ago', color: '#32CD32' },
];

const achievements = [
  { id: 1, title: 'Style Maven', description: 'Created 20+ outfits', icon: 'medal', color: '#FFD700' },
  { id: 2, title: 'Bargain Hunter', description: 'Saved $400+ this year', icon: 'trophy', color: '#FF6347' },
  { id: 3, title: 'Trendsetter', description: 'Early adopter of trends', icon: 'star', color: '#9370DB' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [privateProfile, setPrivateProfile] = useState(false);
  
  // Address and Payment states
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      title: 'Home',
      address: '123 Fashion Street, Style City, SC 12345',
      isDefault: true
    }
  ]);
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: 'card',
      title: 'Visa ****1234',
      details: 'Expires 12/25',
      isDefault: true
    }
  ]);
  const [saleAlerts, setSaleAlerts] = useState(true);
  const [newArrivals, setNewArrivals] = useState(true);
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

  const handleSignOut = () => {
    showCustomAlert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", onPress: hideCustomAlert, style: "cancel" },
        { 
          text: "Sign Out", 
          icon: "log-out",
          style: "destructive",
          onPress: () => {
            hideCustomAlert();
            setIsSignedIn(false);
            showCustomAlert("Signed Out", "You have been signed out successfully! 👋", [{ text: "OK", onPress: hideCustomAlert }], "success");
          }
        }
      ],
      "warning"
    );
  };

  const handleSignIn = () => {
    showActionSheet(
      "Welcome to AynaModa! 💖",
      "Choose how you'd like to sign in and start your fashion journey!",
      [
        { title: "📱 Continue with Phone", icon: "call", subtitle: "Sign in with your phone number", style: "primary", onPress: () => { hideActionSheet(); signInWith('Phone'); }},
        { title: "📧 Continue with Email", icon: "mail", subtitle: "Use your email address", onPress: () => { hideActionSheet(); signInWith('Email'); }},
        { title: "🍏 Continue with Apple", icon: "logo-apple", subtitle: "Quick sign in with Apple ID", onPress: () => { hideActionSheet(); signInWith('Apple'); }},
        { title: "📘 Continue with Facebook", icon: "logo-facebook", subtitle: "Connect with Facebook", onPress: () => { hideActionSheet(); signInWith('Facebook'); }},
        { title: "🔍 Continue with Google", icon: "logo-google", subtitle: "Use your Google account", onPress: () => { hideActionSheet(); signInWith('Google'); }},
        { title: "👀 Browse as Guest", icon: "eye", subtitle: "Explore without signing in", onPress: () => { hideActionSheet(); router.push('/discover'); }}
      ]
    );
  };

  const signInWith = (method: string) => {
    showLoading("Signing In...", `Connecting with ${method}... ✨`);
    
    // Simulate sign-in process
    setTimeout(() => {
      hideLoading();
      setIsSignedIn(true);
      showCustomAlert(
        "Welcome to AynaModa! 🎉", 
        `Successfully signed in with ${method}!\n\n✨ Your fashion journey begins now!\n💖 Discover personalized recommendations\n🛍️ Save your favorite items\n👗 Build your virtual wardrobe\n\nLet's start exploring!`,
        [
          { text: "🚀 Start Exploring", icon: "rocket", style: "primary", onPress: () => { hideCustomAlert(); router.push('/discover'); }},
          { text: "✨ Complete Profile", icon: "person", onPress: () => { hideCustomAlert(); handleEditProfile(); }},
          { text: "OK", onPress: hideCustomAlert }
        ],
        "success"
      );
    }, 1500);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'outfit':
        router.push('/wardrobe');
        break;
      case 'wishlist':
        router.push('/favorites');
        break;
      case 'explore':
        router.push('/discover');
        break;
      case 'share':
        showCustomAlert("Share Style", "Share your amazing style with friends! 📱✨", [{ text: "OK", onPress: hideCustomAlert }], "success");
        break;
    }
  };

  const handleAchievementPress = (achievement: string) => {
    const achievements = {
      'Style Maven': 'Unlock by creating 10 outfits! You\'ve mastered the art of mixing and matching! 👗✨',
      'Bargain Hunter': 'Earned by saving $500+ on sales! You know how to find the best deals! 💰🔥',
      'Trendsetter': 'Achieved by trying 20+ new styles! You\'re always ahead of the fashion curve! 🌟👑'
    };
    
    showCustomAlert(`${achievement} 🏆`, achievements[achievement as keyof typeof achievements] || "Amazing achievement!", [{ text: "OK", onPress: hideCustomAlert }], "success");
  };

  const handleMenuAction = (action: string) => {
    switch (action) {
      case 'orders':
        showCustomAlert("Order History", "Your order history would be displayed here! 📦", [{ text: "OK", onPress: hideCustomAlert }], "info");
        break;
      case 'addresses':
        handleAddressesAction();
        break;
      case 'payment':
        handlePaymentMethodsAction();
        break;
      case 'help':
        showCustomAlert("Help & Support", "How can we help you today? Our support team is here for you! 🤝", [{ text: "OK", onPress: hideCustomAlert }], "info");
        break;
      case 'about':
        showCustomAlert("About AynaModa", "AynaModa v1.1.0\nYour personal fashion discovery app! 💖", [{ text: "OK", onPress: hideCustomAlert }], "info");
        break;
      case 'privacy':
        showCustomAlert("Privacy Policy", "Your privacy is important to us. View our privacy policy for details. 🔒", [{ text: "OK", onPress: hideCustomAlert }], "info");
        break;
    }
  };

  const handleEditProfile = () => {
    showActionSheet(
      "Edit Profile",
      "What would you like to update?",
      [
        { title: "Photo", icon: "camera", subtitle: "Update your profile picture", style: "primary", onPress: () => { hideActionSheet(); showCustomAlert("Update Photo", "Photo update functionality would open here! 📸", [{ text: "OK", onPress: hideCustomAlert }], "info"); }},
        { title: "Bio", icon: "create", subtitle: "Edit your bio and description", onPress: () => { hideActionSheet(); showCustomAlert("Edit Bio", "Bio editing would open here! ✏️", [{ text: "OK", onPress: hideCustomAlert }], "info"); }},
        { title: "Style Preferences", icon: "sparkles", subtitle: "Retake the style quiz", onPress: () => { hideActionSheet(); showCustomAlert("Style Quiz", "Retake the style quiz to update your preferences! ✨", [{ text: "OK", onPress: hideCustomAlert }], "info"); }}
      ]
    );
  };

  const handleShareProfile = () => {
    showCustomAlert("Share Profile", "Share your amazing fashion profile with friends! 📱✨", [{ text: "OK", onPress: hideCustomAlert }], "success");
  };

  const handleAddressesAction = () => {
    const addressOptions = addresses.map(addr => ({
      title: addr.title,
      subtitle: addr.address,
      icon: addr.isDefault ? "home" : "location" as keyof typeof Ionicons.glyphMap,
      style: addr.isDefault ? "primary" : "default" as const,
      onPress: () => {
        hideActionSheet();
        showCustomAlert(`${addr.title} Address`, addr.address, [
          { text: "Edit", icon: "create", onPress: () => { hideCustomAlert(); handleEditAddress(addr.id); }},
          { text: "Set as Default", icon: "star", style: "primary", onPress: () => { hideCustomAlert(); handleSetDefaultAddress(addr.id); }},
          { text: "Delete", icon: "trash", style: "destructive", onPress: () => { hideCustomAlert(); handleDeleteAddress(addr.id); }},
          { text: "Cancel", onPress: hideCustomAlert }
        ], "info");
      }
    }));

    const addNewOption = {
      title: "Add New Address",
      subtitle: "Add a new shipping address",
      icon: "add-circle" as keyof typeof Ionicons.glyphMap,
      style: "primary" as const,
      onPress: () => {
        hideActionSheet();
        handleAddNewAddress();
      }
    };

    showActionSheet("Shipping Addresses", "Manage your delivery addresses", [...addressOptions, addNewOption]);
  };

  const handlePaymentMethodsAction = () => {
    const paymentOptions = paymentMethods.map(payment => ({
      title: payment.title,
      subtitle: payment.details,
      icon: payment.type === 'card' ? "card" : "wallet" as keyof typeof Ionicons.glyphMap,
      style: payment.isDefault ? "primary" : "default" as const,
      onPress: () => {
        hideActionSheet();
        showCustomAlert(`${payment.title}`, payment.details, [
          { text: "Edit", icon: "create", onPress: () => { hideCustomAlert(); handleEditPaymentMethod(payment.id); }},
          { text: "Set as Default", icon: "star", style: "primary", onPress: () => { hideCustomAlert(); handleSetDefaultPayment(payment.id); }},
          { text: "Delete", icon: "trash", style: "destructive", onPress: () => { hideCustomAlert(); handleDeletePaymentMethod(payment.id); }},
          { text: "Cancel", onPress: hideCustomAlert }
        ], "info");
      }
    }));

    const addNewCardOption = {
      title: "Add New Card",
      subtitle: "Add a new payment method",
      icon: "add-circle" as keyof typeof Ionicons.glyphMap,
      style: "primary" as const,
      onPress: () => {
        hideActionSheet();
        handleAddNewCard();
      }
    };

    showActionSheet("Payment Methods", "Manage your payment methods", [...paymentOptions, addNewCardOption]);
  };

  const handleAddNewAddress = () => {
    showLoading("Adding Address", "Setting up your new address...");
    
    setTimeout(() => {
      hideLoading();
      const newAddress = {
        id: addresses.length + 1,
        title: `Address ${addresses.length + 1}`,
        address: `${100 + addresses.length} New Street, Fashion City, FC ${10000 + addresses.length}`,
        isDefault: false
      };
      setAddresses([...addresses, newAddress]);
      showCustomAlert("Address Added! 🏠", `Your new address has been added successfully!\n\n${newAddress.address}`, [
        { text: "Add Another", icon: "add", style: "primary", onPress: () => { hideCustomAlert(); handleAddNewAddress(); }},
        { text: "Done", onPress: hideCustomAlert }
      ], "success");
    }, 1500);
  };

  const handleAddNewCard = () => {
    showLoading("Adding Card", "Setting up your new payment method...");
    
    setTimeout(() => {
      hideLoading();
      const cardTypes = ['Visa', 'Mastercard', 'American Express'];
      const randomCard = cardTypes[Math.floor(Math.random() * cardTypes.length)];
      const randomLast4 = Math.floor(1000 + Math.random() * 9000);
      
      const newCard = {
        id: paymentMethods.length + 1,
        type: 'card',
        title: `${randomCard} ****${randomLast4}`,
        details: `Expires ${Math.floor(1 + Math.random() * 12).toString().padStart(2, '0')}/${new Date().getFullYear() + Math.floor(1 + Math.random() * 5)}`,
        isDefault: false
      };
      setPaymentMethods([...paymentMethods, newCard]);
      showCustomAlert("Card Added! 💳", `Your new payment method has been added successfully!\n\n${newCard.title}\n${newCard.details}`, [
        { text: "Add Another", icon: "add", style: "primary", onPress: () => { hideCustomAlert(); handleAddNewCard(); }},
        { text: "Done", onPress: hideCustomAlert }
      ], "success");
    }, 1500);
  };

  const handleEditAddress = (id: number) => {
    showCustomAlert("Edit Address", "Address editing functionality would open here! ✏️", [{ text: "OK", onPress: hideCustomAlert }], "info");
  };

  const handleEditPaymentMethod = (id: number) => {
    showCustomAlert("Edit Payment Method", "Payment method editing would open here! ✏️", [{ text: "OK", onPress: hideCustomAlert }], "info");
  };

  const handleSetDefaultAddress = (id: number) => {
    setAddresses(addresses.map(addr => ({ ...addr, isDefault: addr.id === id })));
    showCustomAlert("Default Address Set! 🏠", "This address is now your default shipping address.", [{ text: "OK", onPress: hideCustomAlert }], "success");
  };

  const handleSetDefaultPayment = (id: number) => {
    setPaymentMethods(paymentMethods.map(payment => ({ ...payment, isDefault: payment.id === id })));
    showCustomAlert("Default Payment Set! 💳", "This payment method is now your default.", [{ text: "OK", onPress: hideCustomAlert }], "success");
  };

  const handleDeleteAddress = (id: number) => {
    const addressToDelete = addresses.find(addr => addr.id === id);
    if (addressToDelete?.isDefault && addresses.length > 1) {
      showCustomAlert("Cannot Delete", "You cannot delete your default address. Please set another address as default first.", [{ text: "OK", onPress: hideCustomAlert }], "warning");
      return;
    }
    
    setAddresses(addresses.filter(addr => addr.id !== id));
    showCustomAlert("Address Deleted", "The address has been removed from your account.", [{ text: "OK", onPress: hideCustomAlert }], "success");
  };

  const handleDeletePaymentMethod = (id: number) => {
    const paymentToDelete = paymentMethods.find(payment => payment.id === id);
    if (paymentToDelete?.isDefault && paymentMethods.length > 1) {
      showCustomAlert("Cannot Delete", "You cannot delete your default payment method. Please set another payment method as default first.", [{ text: "OK", onPress: hideCustomAlert }], "warning");
      return;
    }
    
    setPaymentMethods(paymentMethods.filter(payment => payment.id !== id));
    showCustomAlert("Payment Method Deleted", "The payment method has been removed from your account.", [{ text: "OK", onPress: hideCustomAlert }], "success");
  };

  if (!isSignedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Guest State */}
          <View style={styles.guestContainer}>
            <View style={styles.guestIcon}>
              <Ionicons name="person-outline" size={80} color="#9AA493" />
            </View>
            
            <Text style={styles.guestTitle}>Welcome to AynaModa! 💖</Text>
            <Text style={styles.guestSubtitle}>
              Sign in to save your favorites, track your style, and get personalized recommendations!
            </Text>
            
            <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
              <Text style={styles.signInButtonText}>Sign In / Sign Up</Text>
            </TouchableOpacity>
            
            <View style={styles.guestFeatures}>
              <Text style={styles.featuresTitle}>What you'll get:</Text>
              <View style={styles.featureItem}>
                <Ionicons name="heart" size={20} color="#B8918F" />
                <Text style={styles.featureText}>Save favorite items and boutiques</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="shirt" size={20} color="#9AA493" />
                <Text style={styles.featureText}>Build your virtual wardrobe</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="sparkles" size={20} color="#D4A896" />
                <Text style={styles.featureText}>Get personalized style recommendations</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="notifications" size={20} color="#BA68C8" />
                <Text style={styles.featureText}>Receive sale alerts on your favorites</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.browseButton}
              onPress={() => router.push('/discover')}
            >
              <Text style={styles.browseButtonText}>Browse as Guest</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleEditProfile}>
            <Ionicons name="create-outline" size={24} color="#B8918F" />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>My Profile ✨</Text>
            <Text style={styles.subtitle}>Your style journey</Text>
          </View>
          <TouchableOpacity onPress={handleShareProfile}>
            <Ionicons name="share-outline" size={24} color="#B8918F" />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>JD</Text>
            </View>
            <TouchableOpacity style={styles.editAvatarButton} onPress={() => showCustomAlert("Update Photo", "Photo update would open here! 📸", [{ text: "OK", onPress: hideCustomAlert }], "info")}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>Jessica Doe</Text>
          <Text style={styles.userBio}>Fashion enthusiast 💖 | Style explorer ✨ | Deal hunter 🛍️</Text>
          <Text style={styles.userLocation}>📍 New York, NY</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <TouchableOpacity style={styles.statCard} onPress={() => router.push('/wardrobe')}>
            <Text style={styles.statNumber}>50</Text>
            <Text style={styles.statLabel}>Wardrobe Items</Text>
            <Text style={styles.statEmoji}>👗</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.statCard} onPress={() => router.push('/favorites')}>
            <Text style={styles.statNumber}>15</Text>
            <Text style={styles.statLabel}>Favorites</Text>
            <Text style={styles.statEmoji}>💖</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.statCard} onPress={() => router.push('/discover')}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Following</Text>
            <Text style={styles.statEmoji}>🏪</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.statCard} onPress={() => showCustomAlert("Savings", "Total saved: $485! Keep discovering amazing deals! 💰", [{ text: "OK", onPress: hideCustomAlert }], "success")}>
            <Text style={styles.statNumber}>$485</Text>
            <Text style={styles.statLabel}>Total Saved</Text>
            <Text style={styles.statEmoji}>💰</Text>
          </TouchableOpacity>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Achievements</Text>
          <View style={styles.achievementsContainer}>
            <TouchableOpacity 
              style={styles.achievementBadge}
              onPress={() => handleAchievementPress('Style Maven')}
            >
              <Text style={styles.achievementEmoji}>👗</Text>
              <Text style={styles.achievementText}>Style Maven</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.achievementBadge}
              onPress={() => handleAchievementPress('Bargain Hunter')}
            >
              <Text style={styles.achievementEmoji}>💰</Text>
              <Text style={styles.achievementText}>Bargain Hunter</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.achievementBadge}
              onPress={() => handleAchievementPress('Trendsetter')}
            >
              <Text style={styles.achievementEmoji}>🌟</Text>
              <Text style={styles.achievementText}>Trendsetter</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 Recent Activity</Text>
          <View style={styles.activityContainer}>
            <TouchableOpacity style={styles.activityItem} onPress={() => router.push('/wardrobe')}>
              <View style={styles.activityIcon}>
                <Ionicons name="shirt" size={20} color="#B8918F" />
              </View>
              <View style={styles.activityText}>
                <Text style={styles.activityTitle}>Added Pink Floral Dress</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.activityItem} onPress={() => router.push('/favorites')}>
              <View style={styles.activityIcon}>
                <Ionicons name="heart" size={20} color="#B8918F" />
              </View>
              <View style={styles.activityText}>
                <Text style={styles.activityTitle}>Favorited Designer Handbag</Text>
                <Text style={styles.activityTime}>Yesterday</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.activityItem} onPress={() => router.push('/discover')}>
              <View style={styles.activityIcon}>
                <Ionicons name="storefront" size={20} color="#9AA493" />
              </View>
              <View style={styles.activityText}>
                <Text style={styles.activityTitle}>Started following Chic Boutique</Text>
                <Text style={styles.activityTime}>3 days ago</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={[styles.quickActionCard, styles.quickActionPink]}
              onPress={() => handleQuickAction('outfit')}
            >
              <Ionicons name="shirt" size={24} color="#FFFFFF" />
              <Text style={styles.quickActionText}>Add Outfit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionCard, styles.quickActionPurple]}
              onPress={() => handleQuickAction('wishlist')}
            >
              <Ionicons name="heart" size={24} color="#FFFFFF" />
              <Text style={styles.quickActionText}>Wishlist</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionCard, styles.quickActionRose]}
              onPress={() => handleQuickAction('explore')}
            >
              <Ionicons name="compass" size={24} color="#FFFFFF" />
              <Text style={styles.quickActionText}>Explore</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionCard, styles.quickActionLavender]}
              onPress={() => handleQuickAction('share')}
            >
              <Ionicons name="share" size={24} color="#FFFFFF" />
              <Text style={styles.quickActionText}>Share Style</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Settings</Text>
          
          <View style={styles.settingsGroup}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="notifications" size={20} color="#B8918F" />
                <Text style={styles.settingLabel}>Push Notifications</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#B5A3BC', true: '#B8918F' }}
                thumbColor={notifications ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="flash" size={20} color="#B8918F" />
                <Text style={styles.settingLabel}>Sale Alerts</Text>
              </View>
              <Switch
                value={saleAlerts}
                onValueChange={setSaleAlerts}
                trackColor={{ false: '#B5A3BC', true: '#B8918F' }}
                thumbColor={saleAlerts ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="sparkles" size={20} color="#B8918F" />
                <Text style={styles.settingLabel}>New Arrivals</Text>
              </View>
              <Switch
                value={newArrivals}
                onValueChange={setNewArrivals}
                trackColor={{ false: '#B5A3BC', true: '#B8918F' }}
                thumbColor={newArrivals ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="lock-closed" size={20} color="#B8918F" />
                <Text style={styles.settingLabel}>Private Profile</Text>
              </View>
              <Switch
                value={privateProfile}
                onValueChange={setPrivateProfile}
                trackColor={{ false: '#B5A3BC', true: '#B8918F' }}
                thumbColor={privateProfile ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
          </View>
          
          <View style={styles.menuGroup}>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuAction('orders')}>
              <Ionicons name="bag" size={20} color="#B8918F" />
              <Text style={styles.menuLabel}>Order History</Text>
              <Ionicons name="chevron-forward" size={20} color="#B5A3BC" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuAction('addresses')}>
              <Ionicons name="location" size={20} color="#B8918F" />
              <Text style={styles.menuLabel}>Addresses</Text>
              <Ionicons name="chevron-forward" size={20} color="#B5A3BC" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuAction('payment')}>
              <Ionicons name="card" size={20} color="#B8918F" />
              <Text style={styles.menuLabel}>Payment Methods</Text>
              <Ionicons name="chevron-forward" size={20} color="#B5A3BC" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuAction('help')}>
              <Ionicons name="help-circle" size={20} color="#B8918F" />
              <Text style={styles.menuLabel}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={20} color="#B5A3BC" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuAction('about')}>
              <Ionicons name="information-circle" size={20} color="#B8918F" />
              <Text style={styles.menuLabel}>About</Text>
              <Ionicons name="chevron-forward" size={20} color="#B5A3BC" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuAction('privacy')}>
              <Ionicons name="shield-checkmark" size={20} color="#B8918F" />
              <Text style={styles.menuLabel}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={20} color="#B5A3BC" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutButtonText}>Sign Out</Text>
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
  profileCard: {
    backgroundColor: '#FDFCFB',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#B8918F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#B8918F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B8918F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#9AA493',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  userBio: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  userLocation: {
    fontSize: 12,
    color: '#9AA493',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#B8918F',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  statEmoji: {
    fontSize: 16,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7A6B56',
    marginBottom: 16,
  },
  achievementsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  achievementBadge: {
    backgroundColor: '#FDFCFB',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#B8918F',
  },
  achievementEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  achievementText: {
    fontSize: 10,
    color: '#B8918F',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  activityContainer: {
    backgroundColor: '#FDFCFB',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0E6E3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityText: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
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
  quickActionPink: {
    backgroundColor: '#B8918F',
  },
  quickActionPurple: {
    backgroundColor: '#9AA493',
  },
  quickActionRose: {
    backgroundColor: '#D4A896',
  },
  quickActionLavender: {
    backgroundColor: '#B5A3BC',
  },
  quickActionText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 8,
    fontWeight: 'bold',
  },
  settingsGroup: {
    backgroundColor: '#FDFCFB',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 14,
    color: '#2C3E50',
    marginLeft: 12,
    fontWeight: '500',
  },
  menuGroup: {
    backgroundColor: '#FDFCFB',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  menuLabel: {
    fontSize: 14,
    color: '#2C3E50',
    marginLeft: 12,
    flex: 1,
    fontWeight: '500',
  },
  signOutButton: {
    backgroundColor: '#D4A896',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#D4A896',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  signOutButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  // Guest State Styles
  guestContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  guestIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0E6E3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: '#B5A3BC',
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7A6B56',
    marginBottom: 16,
    textAlign: 'center',
  },
  guestSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  signInButton: {
    backgroundColor: '#B8918F',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 32,
    shadowColor: '#B8918F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  signInButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  guestFeatures: {
    width: '100%',
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7A6B56',
    marginBottom: 16,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  browseButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#B8918F',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  browseButtonText: {
    fontSize: 14,
    color: '#B8918F',
    fontWeight: 'bold',
  },
}); 
