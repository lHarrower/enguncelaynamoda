import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeInUp, SlideInDown, ZoomIn } from 'react-native-reanimated';

import { DesignSystem } from '@/theme/DesignSystem';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const containerPadding = DesignSystem.spacing.xl;
const DISCOVER_CARD_WIDTH = screenWidth - containerPadding * 2;
const DISCOVER_CARD_HEIGHT = screenHeight * 0.7;

interface SaleBannerProps {
  onPress: () => void;
  title?: string;
  subtitle?: string;
  ctaText?: string;
}

const SaleBanner: React.FC<SaleBannerProps> = ({
  onPress,
  title = '🌟 MEGA SALE ALERT!',
  subtitle = 'Up to 70% off designer pieces',
  ctaText = 'Shop Now →',
}) => {
  const styles = StyleSheet.create({
    backgroundGradient: {
      bottom: 0,
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
    },
    badge: {
      backgroundColor: DesignSystem.colors.primary[500], // Golden Atelier
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      alignSelf: 'flex-start',
      marginBottom: 8,
      shadowColor: DesignSystem.colors.primary[500],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    badgeText: {
      color: DesignSystem.colors.background.primary, // Velvet Noir on golden background
      fontSize: 12,
      fontFamily: 'Karla_700Bold',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    container: {
      marginHorizontal: 20,
      marginVertical: 16,
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: DesignSystem.colors.primary[500], // Mauve Mystique
      shadowColor: DesignSystem.colors.background.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 12,
      borderWidth: 1,
      borderColor: DesignSystem.colors.border.primary, // Smoky Quartz
      // New dimensions based on DiscoverCard
      width: DISCOVER_CARD_WIDTH * 0.8,
      height: DISCOVER_CARD_HEIGHT * 0.8,
      alignSelf: 'center',
    },
    content: {
      padding: 24,
      flex: 1, // Changed to flex: 1 to fill height
      flexDirection: 'column', // Changed to column
      alignItems: 'center', // Center items horizontally
      justifyContent: 'center', // Center items vertically
    },
    ctaButton: {
      backgroundColor: DesignSystem.colors.background.primary, // Velvet Noir
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      shadowColor: DesignSystem.colors.background.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
      borderWidth: 1,
      borderColor: DesignSystem.colors.border.primary,
    },
    ctaText: {
      color: DesignSystem.colors.text.primary, // Ivory Whisper
      fontSize: 14,
      fontFamily: 'Karla_700Bold',
      letterSpacing: 0.3,
    },
    decorativeElement: {
      backgroundColor: DesignSystem.colors.primary[500],
      borderRadius: 40,
      height: 80,
      opacity: 0.1,
      position: 'absolute',
      right: -20,
      top: -20,
      width: 80,
    },
    decorativeElement2: {
      backgroundColor: DesignSystem.colors.background.primary,
      borderRadius: 50,
      bottom: -30,
      height: 100,
      left: -30,
      opacity: 0.05,
      position: 'absolute',
      width: 100,
    },
    subtitle: {
      color: DesignSystem.colors.text.primary,
      fontFamily: 'Karla_400Regular',
      fontSize: 14,
      lineHeight: 20,
      opacity: 0.9,
      textAlign: 'center', // Center subtitle text
    },
    textContainer: {
      flex: 0, // Unset flex
      marginRight: 0, // Unset margin
      marginBottom: 24, // Add space between text and button
      alignItems: 'center', // Center text
    },
    title: {
      fontSize: 22,
      fontFamily: 'PlayfairDisplay_700Bold', // Serif for timeless elegance
      color: DesignSystem.colors.text.primary, // Ivory Whisper
      marginBottom: 4,
      letterSpacing: 0.5,
      textAlign: 'center', // Center title text
    },
  });

  return (
    <Animated.View entering={FadeInUp.delay(200).duration(800)}>
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Sale banner: ${title}, ${subtitle}`}
        accessibilityHint="Tap to view sale items"
      >
        <LinearGradient
          colors={[
            DesignSystem.colors.primary[500] || '#007AFF',
            DesignSystem.colors.gold[400] || '#C9A227',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.backgroundGradient}
        />
        <Animated.View style={styles.content} entering={ZoomIn.delay(400).duration(600)}>
          <Animated.View style={styles.textContainer}>
            <Animated.View entering={FadeInDown.delay(800).duration(400)}>
              <LinearGradient
                colors={[
                  DesignSystem.colors.gold[400] || '#C9A227',
                  DesignSystem.colors.primary[500] || '#007AFF',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.badge}
              >
                <Text style={styles.badgeText}>Limited Time</Text>
              </LinearGradient>
            </Animated.View>
            <Animated.View entering={SlideInDown.delay(600).duration(500)}>
              <Text style={styles.title}>{title}</Text>
            </Animated.View>
            <Animated.View entering={FadeInUp.delay(900).duration(400)}>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </Animated.View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(1200).duration(300)}>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityLabel={ctaText}
              accessibilityHint="Tap to shop sale items"
            >
              <Text style={styles.ctaText}>{ctaText}</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        <Animated.View
          style={styles.decorativeElement}
          entering={ZoomIn.delay(1000).duration(300)}
        />
        <Animated.View
          style={styles.decorativeElement2}
          entering={ZoomIn.delay(1300).duration(400)}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default SaleBanner;
