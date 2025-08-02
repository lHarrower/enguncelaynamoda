import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { DesignSystem } from '@/theme/DesignSystem';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OutfitCard {
  id: string;
  title: string;
  description: string;
  mood: string;
  colors: string[];
  confidence: number;
  pieces: string[];
}

interface SwipeableCardProps {
  outfit: OutfitCard;
  index: number;
  totalCards: number;
  onSwipe: (direction: 'left' | 'right', outfit: OutfitCard) => void;
  isActive: boolean;
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({
  outfit,
  index,
  totalCards,
  onSwipe,
  isActive,
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(isActive ? 1 : 0.95);
  const opacity = useSharedValue(isActive ? 1 : 0.8);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      scale.value = withSpring(1.05);
    },
    
    onActive: (event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.3; // Subtle vertical movement
      rotate.value = interpolate(
        event.translationX,
        [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
        [-15, 0, 15],
        Extrapolate.CLAMP
      );
    },
    
    onEnd: (event) => {
      const threshold = SCREEN_WIDTH * 0.3;
      
      if (Math.abs(event.translationX) > threshold) {
        // Swipe detected
        const direction = event.translationX > 0 ? 'right' : 'left';
        const targetX = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
        
        translateX.value = withSpring(targetX);
        opacity.value = withSpring(0);
        
        runOnJS(onSwipe)(direction, outfit);
      } else {
        // Snap back
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotate.value = withSpring(0);
        scale.value = withSpring(isActive ? 1 : 0.95);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
    zIndex: totalCards - index,
  }));

  const renderColorPalette = () => (
    <View style={styles.colorPalette}>
      {outfit.colors.map((color, idx) => (
        <View
          key={idx}
          style={[
            styles.colorSwatch,
            { backgroundColor: color },
          ]}
        />
      ))}
    </View>
  );

  const renderPieces = () => (
    <View style={styles.piecesContainer}>
      {outfit.pieces.map((piece, idx) => (
        <View key={idx} style={styles.pieceTag}>
          <Text style={styles.pieceText}>{piece}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <LinearGradient
          colors={[
            DesignSystem.colors.background.primary,
            DesignSystem.colors.background.secondary,
          ]}
          style={styles.cardGradient}
        >
          <BlurView intensity={20} style={styles.cardContent}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{outfit.title}</Text>
                <Text style={styles.description}>{outfit.description}</Text>
              </View>
              <View style={styles.confidenceContainer}>
                <Text style={styles.confidenceText}>{outfit.confidence}%</Text>
                <Ionicons 
                  name="checkmark-circle" 
                  size={20} 
                  color={DesignSystem.colors.sage[500]} 
                />
              </View>
            </View>

            {/* Mood */}
            <View style={styles.moodContainer}>
              <Ionicons 
                name="heart" 
                size={16} 
                color={DesignSystem.colors.coral[500]} 
              />
              <Text style={styles.moodText}>{outfit.mood}</Text>
            </View>

            {/* Color Palette */}
            {renderColorPalette()}

            {/* Pieces */}
            {renderPieces()}

            {/* Swipe Indicators */}
            <View style={styles.swipeIndicators}>
              <View style={[styles.swipeIndicator, styles.passIndicator]}>
                <Ionicons name="close" size={24} color="white" />
              </View>
              <View style={[styles.swipeIndicator, styles.loveIndicator]}>
                <Ionicons name="heart" size={24} color="white" />
              </View>
            </View>
          </BlurView>
        </LinearGradient>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH - DesignSystem.spacing.xl * 2,
    height: '80%',
    borderRadius: DesignSystem.borderRadius.xl,
    overflow: 'hidden',
    ...DesignSystem.elevation.large,
  },
  cardGradient: {
    flex: 1,
  },
  cardContent: {
    flex: 1,
    padding: DesignSystem.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignSystem.spacing.lg,
  },
  titleContainer: {
    flex: 1,
    marginRight: DesignSystem.spacing.md,
  },
  title: {
    ...DesignSystem.typography.h2,
    color: DesignSystem.colors.charcoal[800],
    marginBottom: DesignSystem.spacing.xs,
  },
  description: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.charcoal[600],
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing.xs,
  },
  confidenceText: {
    ...DesignSystem.typography.caption,
    fontWeight: '600',
    color: DesignSystem.colors.sage[600],
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing.xs,
    marginBottom: DesignSystem.spacing.lg,
  },
  moodText: {
    ...DesignSystem.typography.caption,
    color: DesignSystem.colors.coral[600],
    fontWeight: '500',
  },
  colorPalette: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.sm,
    marginBottom: DesignSystem.spacing.lg,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  piecesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignSystem.spacing.sm,
    marginBottom: DesignSystem.spacing.xl,
  },
  pieceTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.xs,
    borderRadius: DesignSystem.borderRadius.md,
  },
  pieceText: {
    ...DesignSystem.typography.caption,
    color: DesignSystem.colors.charcoal[700],
  },
  swipeIndicators: {
    position: 'absolute',
    top: DesignSystem.spacing.xl,
    left: DesignSystem.spacing.xl,
    right: DesignSystem.spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  swipeIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8,
  },
  passIndicator: {
    backgroundColor: DesignSystem.colors.coral[500],
  },
  loveIndicator: {
    backgroundColor: DesignSystem.colors.sage[500],
  },
});

export default SwipeableCard;