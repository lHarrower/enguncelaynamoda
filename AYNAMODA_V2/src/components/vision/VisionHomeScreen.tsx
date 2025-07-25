import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AYNAMODA_VISION_THEME, getColor, getSpacing, getTypography } from '../../constants/AynaModaVisionTheme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BENTO_PADDING = getSpacing('md');
const GRID_SIZE = (SCREEN_WIDTH - BENTO_PADDING * 3) / 2;

interface BentoCardProps {
  title: string;
  subtitle?: string;
  icon: string;
  gradient: string[];
  size: 'small' | 'medium' | 'large' | 'hero';
  onPress: () => void;
  children?: React.ReactNode;
}

const BentoCard: React.FC<BentoCardProps> = ({ 
  title, 
  subtitle, 
  icon, 
  gradient, 
  size, 
  onPress, 
  children 
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const magneticAnim = useRef(new Animated.ValueXY()).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  
  const cardDimensions = {
    small: { width: GRID_SIZE, height: GRID_SIZE },
    medium: { width: GRID_SIZE * 2 + BENTO_PADDING, height: GRID_SIZE },
    large: { width: GRID_SIZE * 2 + BENTO_PADDING, height: GRID_SIZE * 2 + BENTO_PADDING },
    hero: { width: SCREEN_WIDTH - BENTO_PADDING * 2, height: GRID_SIZE * 1.5 },
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    
    onPanResponderGrant: (evt) => {
      // Magnetic attraction effect
      const { locationX, locationY } = evt.nativeEvent;
      const centerX = cardDimensions[size].width / 2;
      const centerY = cardDimensions[size].height / 2;
      
      const deltaX = (locationX - centerX) * 0.1;
      const deltaY = (locationY - centerY) * 0.1;
      
      Animated.parallel([
        Animated.spring(magneticAnim, {
          toValue: { x: deltaX, y: deltaY },
          useNativeDriver: true,
          ...AYNAMODA_VISION_THEME.motion.spring.gentle,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1.05,
          useNativeDriver: true,
          ...AYNAMODA_VISION_THEME.motion.spring.bouncy,
        }),
        Animated.timing(rippleAnim, {
          toValue: 1,
          duration: AYNAMODA_VISION_THEME.motion.duration.graceful,
          useNativeDriver: true,
        }),
      ]).start();
    },
    
    onPanResponderRelease: () => {
      Animated.parallel([
        Animated.spring(magneticAnim, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
          ...AYNAMODA_VISION_THEME.motion.spring.snappy,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          ...AYNAMODA_VISION_THEME.motion.spring.gentle,
        }),
        Animated.timing(rippleAnim, {
          toValue: 0,
          duration: AYNAMODA_VISION_THEME.motion.duration.smooth,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onPress();
      });
    },
  });

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, AYNAMODA_VISION_THEME.signature.rippleScale],
  });

  const rippleOpacity = rippleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.3, 0],
  });

  return (
    <Animated.View
      style={[
        styles.bentoCard,
        cardDimensions[size],
        {
          transform: [
            { translateX: magneticAnim.x },
            { translateY: magneticAnim.y },
            { scale: scaleAnim },
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <LinearGradient
        colors={gradient}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <BlurView intensity={20} style={styles.cardBlur}>
          {/* Ripple Effect */}
          <Animated.View
            style={[
              styles.ripple,
              {
                transform: [{ scale: rippleScale }],
                opacity: rippleOpacity,
              },
            ]}
          />
          
          {/* Card Content */}
          <View style={styles.cardHeader}>
            <Ionicons 
              name={icon as any} 
              size={size === 'hero' ? 32 : 24} 
              color={getColor('neutral', 'charcoal')} 
            />
            <View style={styles.cardTitleContainer}>
              <Text style={[
                size === 'hero' ? getTypography('h1') : getTypography('h3'),
                styles.cardTitle
              ]}>
                {title}
              </Text>
              {subtitle && (
                <Text style={[getTypography('bodySmall'), styles.cardSubtitle]}>
                  {subtitle}
                </Text>
              )}
            </View>
          </View>
          
          {children && (
            <View style={styles.cardContent}>
              {children}
            </View>
          )}
        </BlurView>
      </LinearGradient>
    </Animated.View>
  );
};

const VisionHomeScreen: React.FC = () => {
  const [greeting, setGreeting] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: AYNAMODA_VISION_THEME.motion.duration.graceful,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        ...AYNAMODA_VISION_THEME.motion.spring.gentle,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          getColor('primary', 'cream'),
          getColor('primary', 'pearl'),
          getColor('primary', 'sage'),
        ]}
        style={styles.backgroundGradient}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <Animated.View 
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View>
              <Text style={[getTypography('label'), styles.greetingLabel]}>
                {greeting}
              </Text>
              <Text style={[getTypography('display'), styles.welcomeTitle]}>
                Your Daily Ritual
              </Text>
            </View>
            
            <TouchableOpacity style={styles.profileButton}>
              <BlurView intensity={20} style={styles.profileBlur}>
                <Ionicons 
                  name="person-circle-outline" 
                  size={32} 
                  color={getColor('neutral', 'charcoal')} 
                />
              </BlurView>
            </TouchableOpacity>
          </Animated.View>

          {/* Bento Grid */}
          <Animated.View 
            style={[
              styles.bentoGrid,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Hero Card - Today's Inspiration */}
            <BentoCard
              title="Today's Inspiration"
              subtitle="Curated just for you"
              icon="sparkles"
              gradient={[getColor('accent', 'coral'), getColor('accent', 'lavender')]}
              size="hero"
              onPress={() => console.log('Today\'s Inspiration pressed')}
            >
              <View style={styles.inspirationContent}>
                <Text style={[getTypography('body'), styles.inspirationText]}>
                  "Confidence is the best accessory you can wear"
                </Text>
              </View>
            </BentoCard>

            {/* Row 1 */}
            <View style={styles.bentoRow}>
              <BentoCard
                title="Quick Style"
                icon="flash"
                gradient={[getColor('accent', 'mint'), getColor('primary', 'sage')]}
                size="small"
                onPress={() => console.log('Quick Style pressed')}
              />
              
              <BentoCard
                title="Weather Perfect"
                subtitle="72°F, Sunny"
                icon="sunny"
                gradient={[getColor('accent', 'gold'), getColor('primary', 'champagne')]}
                size="small"
                onPress={() => console.log('Weather Perfect pressed')}
              />
            </View>

            {/* Row 2 */}
            <BentoCard
              title="Wardrobe Insights"
              subtitle="Discover hidden gems"
              icon="analytics"
              gradient={[getColor('accent', 'lavender'), getColor('primary', 'pearl')]}
              size="medium"
              onPress={() => console.log('Wardrobe Insights pressed')}
            >
              <View style={styles.insightsContent}>
                <Text style={[getTypography('bodySmall'), styles.insightText]}>
                  You have 3 unworn pieces perfect for today
                </Text>
              </View>
            </BentoCard>

            {/* Row 3 */}
            <View style={styles.bentoRow}>
              <BentoCard
                title="Style Goals"
                icon="trophy"
                gradient={[getColor('accent', 'gold'), getColor('accent', 'coral')]}
                size="small"
                onPress={() => console.log('Style Goals pressed')}
              />
              
              <BentoCard
                title="Discover"
                icon="compass"
                gradient={[getColor('accent', 'mint'), getColor('accent', 'lavender')]}
                size="small"
                onPress={() => console.log('Discover pressed')}
              />
            </View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  backgroundGradient: {
    flex: 1,
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    paddingBottom: getSpacing('xxxl'),
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: getSpacing('lg'),
    paddingTop: getSpacing('xxxl'),
    paddingBottom: getSpacing('xl'),
  },
  
  greetingLabel: {
    color: getColor('neutral', 'slate'),
    marginBottom: getSpacing('xs'),
  },
  
  welcomeTitle: {
    color: getColor('neutral', 'charcoal'),
  },
  
  profileButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  
  profileBlur: {
    padding: getSpacing('sm'),
  },
  
  bentoGrid: {
    paddingHorizontal: getSpacing('md'),
    gap: getSpacing('md'),
  },
  
  bentoRow: {
    flexDirection: 'row',
    gap: getSpacing('md'),
  },
  
  bentoCard: {
    borderRadius: AYNAMODA_VISION_THEME.layout.card.borderRadius,
    overflow: 'hidden',
    ...AYNAMODA_VISION_THEME.layout.card,
  },
  
  cardGradient: {
    flex: 1,
  },
  
  cardBlur: {
    flex: 1,
    padding: getSpacing('lg'),
    justifyContent: 'space-between',
  },
  
  ripple: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 100,
    height: 100,
    marginTop: -50,
    marginLeft: -50,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: getSpacing('sm'),
  },
  
  cardTitleContainer: {
    flex: 1,
  },
  
  cardTitle: {
    color: getColor('neutral', 'charcoal'),
    marginBottom: getSpacing('xs'),
  },
  
  cardSubtitle: {
    color: getColor('neutral', 'slate'),
  },
  
  cardContent: {
    marginTop: getSpacing('md'),
  },
  
  inspirationContent: {
    marginTop: getSpacing('lg'),
  },
  
  inspirationText: {
    color: getColor('neutral', 'charcoal'),
    fontStyle: 'italic',
  },
  
  insightsContent: {
    marginTop: getSpacing('md'),
  },
  
  insightText: {
    color: getColor('neutral', 'slate'),
  },
});

export default VisionHomeScreen;