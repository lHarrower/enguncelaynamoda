import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import Animated, { FadeInDown, FadeInRight, SlideInLeft } from 'react-native-reanimated';

interface HeaderProps {
  onNotificationPress: () => void;
  notificationCount?: number;
  greeting?: string;
  welcomeText?: string;
}

const Header: React.FC<HeaderProps> = ({
  onNotificationPress,
  notificationCount = 0,
  greeting = "Hey Beautiful! 💖",
  welcomeText = "Ready to discover amazing deals?"
}) => {
  const { colors, isDark } = useTheme();

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background, // Velvet Noir
    borderBottomWidth: 1,
    borderBottomColor: colors.border, // Smoky Quartz
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  greeting: {
    fontSize: 16,
    color: colors.text_secondary, // Champagne Blush
      fontFamily: 'Karla_400Regular',
    opacity: 0.9,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'PlayfairDisplay_700Bold', // Serif for timeless elegance
    color: colors.text, // Ivory Whisper
    marginTop: 4,
    letterSpacing: 0.5,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card, // Champagne Blush
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.background,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card, // Champagne Blush
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.background,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.onSurface, // Velvet Noir on Champagne Blush
    fontFamily: 'Karla_400Regular',
    marginLeft: 12,
  },
  searchPlaceholder: {
    color: colors.onSurface,
    opacity: 0.6,
  },
  filterButton: {
    marginLeft: 12,
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.tint, // Mauve Mystique
    shadowColor: colors.tint,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    },
    notificationContainer: {
      position: 'relative',
  },
  notificationIcon: {
      padding: 12,
      backgroundColor: colors.card,
      borderRadius: 16,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
      borderColor: colors.border,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
      backgroundColor: colors.tint,
      borderRadius: 12,
      minWidth: 24,
      height: 24,
    alignItems: 'center',
    justifyContent: 'center',
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 2,
      borderColor: colors.background,
  },
  badgeText: {
      color: colors.background,
      fontSize: 11,
      fontFamily: 'Karla_700Bold',
      letterSpacing: 0.2,
    },
    premiumAccent: {
      position: 'absolute',
      top: -2,
      left: -2,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.tint,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
  },
});

  return (
    <Animated.View style={styles.container} entering={FadeInDown.duration(800)}>
      {/* Top Row with Greeting and Profile */}
      <Animated.View style={styles.topRow} entering={SlideInLeft.delay(200).duration(600)}>
        <View>
        <Animated.View entering={FadeInDown.delay(400).duration(600)}>
            <Text style={styles.greeting}>
              {welcomeText}
            </Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(600).duration(600)}>
            <Text style={styles.userName}>
              {greeting}
            </Text>
        </Animated.View>
        </View>
        
      <Animated.View style={styles.notificationContainer} entering={FadeInRight.delay(300).duration(600)}>
          <TouchableOpacity style={styles.profileButton} onPress={onNotificationPress}>
            <Ionicons name="person-outline" size={20} color={colors.onSurface} />
        </TouchableOpacity>
        {notificationCount > 0 && (
          <Animated.View style={styles.notificationBadge} entering={FadeInDown.delay(800).duration(400)}>
            <Text style={styles.badgeText}>{notificationCount > 99 ? '99+' : notificationCount}</Text>
          </Animated.View>
        )}
        </Animated.View>
      </Animated.View>

      {/* Search Bar */}
      <Animated.View style={styles.searchContainer} entering={FadeInDown.delay(800).duration(600)}>
        <Ionicons name="search-outline" size={20} color={colors.onSurface} />
        <Text style={[styles.searchInput, styles.searchPlaceholder]}>
          Search luxury fashion...
        </Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options-outline" size={16} color={colors.text} />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

export default Header; 