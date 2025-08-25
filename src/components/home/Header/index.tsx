import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight, SlideInLeft } from 'react-native-reanimated';

import { DesignSystem } from '@/theme/DesignSystem';

interface HeaderProps {
  onNotificationPress: () => void;
  notificationCount?: number;
  greeting?: string;
  welcomeText?: string;
}

const Header: React.FC<HeaderProps> = ({
  onNotificationPress,
  notificationCount = 0,
  greeting = 'Hey Beautiful! 💖',
  welcomeText = 'Ready to discover amazing deals?',
}) => {
  const styles = StyleSheet.create({
    badgeText: {
      color: DesignSystem.colors.text.inverse,
      fontFamily: 'Karla_700Bold',
      fontSize: 11,
      letterSpacing: 0.2,
    },
    container: {
      backgroundColor: DesignSystem.colors.background.primary,
      borderBottomColor: DesignSystem.colors.border.primary,
      borderBottomWidth: 1,
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    filterButton: {
      backgroundColor: DesignSystem.colors.primary[500],
      borderRadius: 8,
      elevation: 3,
      marginLeft: 12,
      padding: 8,
      shadowColor: DesignSystem.colors.primary[500],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    greeting: {
      color: DesignSystem.colors.text.secondary,
      fontFamily: 'Karla_400Regular',
      fontSize: 16,
      opacity: 0.9,
    },
    notificationBadge: {
      alignItems: 'center',
      backgroundColor: DesignSystem.colors.primary[500],
      borderColor: DesignSystem.colors.background.primary,
      borderRadius: 12,
      borderWidth: 2,
      elevation: 3,
      height: 24,
      justifyContent: 'center',
      minWidth: 24,
      position: 'absolute',
      right: 4,
      shadowColor: DesignSystem.colors.shadow.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      top: 4,
    },
    notificationContainer: {
      position: 'relative',
    },
    notificationIcon: {
      backgroundColor: DesignSystem.colors.background.elevated,
      borderColor: DesignSystem.colors.border.primary,
      borderRadius: 16,
      borderWidth: 1,
      elevation: 4,
      padding: 12,
      shadowColor: DesignSystem.colors.shadow.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
    },
    premiumAccent: {
      backgroundColor: DesignSystem.colors.primary[500],
      borderRadius: 4,
      elevation: 2,
      height: 8,
      left: -2,
      position: 'absolute',
      shadowColor: DesignSystem.colors.shadow.primary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      top: -2,
      width: 8,
    },
    profileButton: {
      alignItems: 'center',
      backgroundColor: DesignSystem.colors.background.elevated,
      borderColor: DesignSystem.colors.border.primary,
      borderRadius: 22,
      borderWidth: 1,
      elevation: 4,
      height: 44,
      justifyContent: 'center',
      shadowColor: DesignSystem.colors.shadow.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      width: 44,
    },
    searchContainer: {
      alignItems: 'center',
      backgroundColor: DesignSystem.colors.background.elevated,
      borderColor: DesignSystem.colors.border.primary,
      borderRadius: 12,
      borderWidth: 1,
      elevation: 2,
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 12,
      shadowColor: DesignSystem.colors.shadow.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    searchInput: {
      color: DesignSystem.colors.text.primary,
      flex: 1,
      fontFamily: 'Karla_400Regular',
      fontSize: 16,
      marginLeft: 12,
    },
    searchPlaceholder: {
      color: DesignSystem.colors.text.secondary,
      opacity: 0.6,
    },
    topRow: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    userName: {
      fontSize: 24,
      fontFamily: 'PlayfairDisplay_700Bold', // Serif for timeless elegance
      color: DesignSystem.colors.text.primary,
      marginTop: 4,
      letterSpacing: 0.5,
    },
  });

  return (
    <Animated.View style={styles.container} entering={FadeInDown.duration(800)}>
      {/* Top Row with Greeting and Profile */}
      <Animated.View style={styles.topRow} entering={SlideInLeft.delay(200).duration(600)}>
        <View>
          <Animated.View entering={FadeInDown.delay(400).duration(600)}>
            <Text style={styles.greeting}>{welcomeText}</Text>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(600).duration(600)}>
            <Text style={styles.userName}>{greeting}</Text>
          </Animated.View>
        </View>

        <Animated.View
          style={styles.notificationContainer}
          entering={FadeInRight.delay(300).duration(600)}
        >
          <TouchableOpacity
            style={styles.profileButton}
            onPress={onNotificationPress}
            accessibilityRole="button"
            accessibilityLabel="Profile"
            accessibilityHint="Tap to view your profile and account settings"
          >
            <Ionicons name="person-outline" size={20} color={DesignSystem.colors.text.primary} />
          </TouchableOpacity>
          {notificationCount > 0 && (
            <Animated.View
              style={styles.notificationBadge}
              entering={FadeInDown.delay(800).duration(400)}
            >
              <Text style={styles.badgeText}>
                {notificationCount > 99 ? '99+' : notificationCount}
              </Text>
            </Animated.View>
          )}
        </Animated.View>
      </Animated.View>

      {/* Search Bar */}
      <Animated.View style={styles.searchContainer} entering={FadeInDown.delay(800).duration(600)}>
        <Ionicons name="search-outline" size={20} color={DesignSystem.colors.text.secondary} />
        <Text style={[styles.searchInput, styles.searchPlaceholder]}>Search luxury fashion...</Text>
        <TouchableOpacity
          style={styles.filterButton}
          accessibilityRole="button"
          accessibilityLabel="Filter options"
          accessibilityHint="Tap to show or hide search filters"
        >
          <Ionicons name="options-outline" size={16} color={DesignSystem.colors.text.inverse} />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

export default Header;
