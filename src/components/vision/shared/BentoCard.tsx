import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AYNAMODA_VISION_THEME, getColor, getSpacing, getTypography } from '@/constants/AynaModaVisionTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
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

  const animatedStyle = {
    transform: [
      { translateX: magneticAnim.x },
      { translateY: magneticAnim.y },
      { scale: scaleAnim },
    ],
  };

  const rippleStyle = {
    opacity: rippleAnim,
    transform: [
      {
        scale: rippleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 2],
        }),
      },
    ],
  };

  return (
    <Animated.View
      style={[
        styles.bentoCard,
        cardDimensions[size],
        animatedStyle,
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
          <Animated.View style={[styles.ripple, rippleStyle]} />
          
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Text style={[getTypography('body', 'medium'), styles.cardTitle]}>
                {title}
              </Text>
              {subtitle && (
                <Text style={[getTypography('caption', 'regular'), styles.cardSubtitle]}>
                  {subtitle}
                </Text>
              )}
            </View>
            <Ionicons 
              name={icon as any} 
              size={24} 
              color={getColor('neutral', 'charcoal')} 
            />
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

const styles = StyleSheet.create({
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
});

export default BentoCard;