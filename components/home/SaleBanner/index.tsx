import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../context/ThemeContext';
import { LUX_PARISENNE_PALETTE } from '../../../constants/Colors';
import Animated, { FadeInUp, FadeInDown, ZoomIn, SlideInDown } from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
import { APP_THEME_V2 } from '../../../constants/AppThemeV2';

const containerPadding = APP_THEME_V2.spacing.xl; 
const DISCOVER_CARD_WIDTH = screenWidth - (containerPadding * 2);
const DISCOVER_CARD_HEIGHT = screenHeight * 0.7;


interface SaleBannerProps {
  onPress: () => void;
  title?: string;
  subtitle?: string;
  ctaText?: string;
}

const SaleBanner: React.FC<SaleBannerProps> = ({
  onPress,
  title = "🌟 MEGA SALE ALERT!",
  subtitle = "Up to 70% off designer pieces",
  ctaText = "Shop Now →"
}) => {
  const { colors, isDark } = useTheme();

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.tint, // Mauve Mystique
    shadowColor: colors.background,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: colors.border, // Smoky Quartz
    // New dimensions based on DiscoverCard
    width: DISCOVER_CARD_WIDTH * 0.8,
    height: DISCOVER_CARD_HEIGHT * 0.8,
    alignSelf: 'center',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    padding: 24,
    flex: 1, // Changed to flex: 1 to fill height
    flexDirection: 'column', // Changed to column
    alignItems: 'center', // Center items horizontally
    justifyContent: 'center', // Center items vertically
    },
  textContainer: {
    flex: 0, // Unset flex
    marginRight: 0, // Unset margin
    marginBottom: 24, // Add space between text and button
    alignItems: 'center', // Center text
  },
  badge: {
    backgroundColor: colors.highlight, // Golden Atelier
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
    shadowColor: colors.highlight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  badgeText: {
    color: colors.background, // Velvet Noir on golden background
    fontSize: 12,
    fontFamily: 'Karla_700Bold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 22,
    fontFamily: 'PlayfairDisplay_700Bold', // Serif for timeless elegance
    color: colors.text, // Ivory Whisper
    marginBottom: 4,
    letterSpacing: 0.5,
    textAlign: 'center', // Center title text
  },
  subtitle: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.9,
    fontFamily: 'Karla_400Regular',
    lineHeight: 20,
    textAlign: 'center', // Center subtitle text
    },
  ctaButton: {
    backgroundColor: colors.background, // Velvet Noir
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: colors.background,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ctaText: {
    color: colors.text, // Ivory Whisper
    fontSize: 14,
    fontFamily: 'Karla_700Bold',
    letterSpacing: 0.3,
    },
  decorativeElement: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.highlight,
    opacity: 0.1,
  },
  decorativeElement2: {
      position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
      backgroundColor: colors.background,
    opacity: 0.05,
  },
});

  return (
    <Animated.View entering={FadeInUp.delay(200).duration(800)}>
      <TouchableOpacity 
        style={styles.container} 
        onPress={onPress}
      >
        <LinearGradient
          colors={[LUX_PARISENNE_PALETTE.mauve_mystique, LUX_PARISENNE_PALETTE.mauve_mystique_light]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.backgroundGradient}
        />
        <Animated.View style={styles.content} entering={ZoomIn.delay(400).duration(600)}>
          <Animated.View style={styles.textContainer}>
            <Animated.View entering={FadeInDown.delay(800).duration(400)}>
              <LinearGradient
                colors={[LUX_PARISENNE_PALETTE.golden_atelier, LUX_PARISENNE_PALETTE.golden_atelier_light]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.badge}
              >
                <Text style={styles.badgeText}>
                  Limited Time
                </Text>
              </LinearGradient>
            </Animated.View>
            <Animated.View entering={SlideInDown.delay(600).duration(500)}>
              <Text style={styles.title}>
                {title}
              </Text>
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(900).duration(400)}>
              <Text style={styles.subtitle}>
              {subtitle}
              </Text>
            </Animated.View>
          </Animated.View>
          
          <Animated.View entering={FadeInUp.delay(1200).duration(300)}>
            <TouchableOpacity style={styles.ctaButton}>
                <Text style={styles.ctaText}>
                  {ctaText}
                </Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
        
        <Animated.View style={styles.decorativeElement} entering={ZoomIn.delay(1000).duration(300)} />
        <Animated.View style={styles.decorativeElement2} entering={ZoomIn.delay(1300).duration(400)} />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default SaleBanner; 