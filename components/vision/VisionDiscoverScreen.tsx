import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Dimensions,
  PanGestureHandler,
  State,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AYNAMODA_VISION_THEME, getColor, getSpacing, getTypography } from '../../constants/AynaModaVisionTheme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.65;
const CARD_SPACING = 20;

interface OutfitCard {
  id: string;
  title: string;
  description: string;
  mood: string;
  colors: string[];
  confidence: number;
  pieces: string[];
}

const SAMPLE_OUTFITS: OutfitCard[] = [
  {
    id: '1',
    title: 'Serene Sunday',
    description: 'Effortless elegance for a peaceful day',
    mood: 'Calm & Confident',
    colors: ['#E8F4E6', '#F5F1E8', '#FFF8F0'],
    confidence: 95,
    pieces: ['Cream silk blouse', 'High-waisted trousers', 'Gold accessories'],
  },
  {
    id: '2',
    title: 'Creative Energy',
    description: 'Bold choices for inspired moments',
    mood: 'Vibrant & Artistic',
    colors: ['#FF6B6B', '#B794F6', '#68D391'],
    confidence: 88,
    pieces: ['Statement blazer', 'Wide-leg jeans', 'Colorful scarf'],
  },
  {
    id: '3',
    title: 'Minimalist Grace',
    description: 'Pure sophistication in simplicity',
    mood: 'Refined & Timeless',
    colors: ['#F7F7F7', '#E2E8F0', '#4A5568'],
    confidence: 92,
    pieces: ['White button-down', 'Tailored pants', 'Classic pumps'],
  },
];

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
      scale.value = withSpring(1.05, AYNAMODA_VISION_THEME.motion.spring.bouncy);
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
      const shouldSwipe = Math.abs(event.translationX) > SCREEN_WIDTH * 0.3;
      const direction = event.translationX > 0 ? 'right' : 'left';
      
      if (shouldSwipe) {
        // Swipe away
        translateX.value = withTiming(
          event.translationX > 0 ? SCREEN_WIDTH : -SCREEN_WIDTH,
          { duration: AYNAMODA_VISION_THEME.motion.duration.smooth }
        );
        translateY.value = withTiming(
          event.translationY + (Math.random() - 0.5) * 100,
          { duration: AYNAMODA_VISION_THEME.motion.duration.smooth }
        );
        rotate.value = withTiming(
          event.translationX > 0 ? 30 : -30,
          { duration: AYNAMODA_VISION_THEME.motion.duration.smooth }
        );
        opacity.value = withTiming(0, {
          duration: AYNAMODA_VISION_THEME.motion.duration.smooth,
        });
        
        runOnJS(onSwipe)(direction, outfit);
      } else {
        // Snap back
        translateX.value = withSpring(0, AYNAMODA_VISION_THEME.motion.spring.snappy);
        translateY.value = withSpring(0, AYNAMODA_VISION_THEME.motion.spring.snappy);
        rotate.value = withSpring(0, AYNAMODA_VISION_THEME.motion.spring.snappy);
        scale.value = withSpring(1, AYNAMODA_VISION_THEME.motion.spring.gentle);
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

  const backgroundStyle = useAnimatedStyle(() => {
    const swipeProgress = interpolate(
      Math.abs(translateX.value),
      [0, SCREEN_WIDTH * 0.3],
      [0, 1],
      Extrapolate.CLAMP
    );
    
    return {
      backgroundColor: interpolate(
        translateX.value,
        [-SCREEN_WIDTH * 0.3, 0, SCREEN_WIDTH * 0.3],
        ['rgba(245, 101, 101, 0.1)', 'transparent', 'rgba(104, 211, 145, 0.1)'],
        Extrapolate.CLAMP
      ),
    };
  });

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.cardContainer, animatedStyle]}>
        <Animated.View style={[styles.cardBackground, backgroundStyle]}>
          <LinearGradient
            colors={outfit.colors}
            style={styles.card}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <BlurView intensity={30} style={styles.cardContent}>
              {/* Header */}
              <View style={styles.cardHeader}>
                <View>
                  <Text style={[getTypography('h1'), styles.cardTitle]}>
                    {outfit.title}
                  </Text>
                  <Text style={[getTypography('body'), styles.cardDescription]}>
                    {outfit.description}
                  </Text>
                </View>
                
                <View style={styles.confidenceContainer}>
                  <Text style={[getTypography('label'), styles.confidenceLabel]}>
                    CONFIDENCE
                  </Text>
                  <Text style={[getTypography('h2'), styles.confidenceScore]}>
                    {outfit.confidence}%
                  </Text>
                </View>
              </View>

              {/* Mood */}
              <View style={styles.moodContainer}>
                <Ionicons 
                  name="heart" 
                  size={20} 
                  color={getColor('accent', 'coral')} 
                />
                <Text style={[getTypography('bodySmall'), styles.moodText]}>
                  {outfit.mood}
                </Text>
              </View>

              {/* Pieces */}
              <View style={styles.piecesContainer}>
                <Text style={[getTypography('label'), styles.piecesLabel]}>
                  PIECES
                </Text>
                {outfit.pieces.map((piece, idx) => (
                  <View key={idx} style={styles.pieceItem}>
                    <View style={styles.pieceDot} />
                    <Text style={[getTypography('bodySmall'), styles.pieceText]}>
                      {piece}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Action Hints */}
              <View style={styles.actionHints}>
                <View style={styles.actionHint}>
                  <Ionicons 
                    name="arrow-back" 
                    size={16} 
                    color={getColor('colors', 'error')} 
                  />
                  <Text style={[getTypography('bodySmall'), styles.hintText]}>
                    Pass
                  </Text>
                </View>
                
                <View style={styles.actionHint}>
                  <Text style={[getTypography('bodySmall'), styles.hintText]}>
                    Love
                  </Text>
                  <Ionicons 
                    name="arrow-forward" 
                    size={16} 
                    color={getColor('colors', 'success')} 
                  />
                </View>
              </View>
            </BlurView>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </PanGestureHandler>
  );
};

const VisionDiscoverScreen: React.FC = () => {
  const [outfits, setOutfits] = useState(SAMPLE_OUTFITS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedOutfits, setLikedOutfits] = useState<OutfitCard[]>([]);

  const handleSwipe = (direction: 'left' | 'right', outfit: OutfitCard) => {
    if (direction === 'right') {
      setLikedOutfits(prev => [...prev, outfit]);
    }
    
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, AYNAMODA_VISION_THEME.motion.duration.smooth);
  };

  const resetStack = () => {
    setCurrentIndex(0);
    setOutfits([...SAMPLE_OUTFITS]);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          getColor('primary', 'pearl'),
          getColor('primary', 'cream'),
          getColor('primary', 'sage'),
        ]}
        style={styles.backgroundGradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={getColor('neutral', 'charcoal')} 
            />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={[getTypography('h2'), styles.headerTitle]}>
              Discover
            </Text>
            <Text style={[getTypography('bodySmall'), styles.headerSubtitle]}>
              Swipe to explore your style
            </Text>
          </View>
          
          <TouchableOpacity style={styles.likedButton}>
            <Ionicons 
              name="heart" 
              size={24} 
              color={getColor('accent', 'coral')} 
            />
            {likedOutfits.length > 0 && (
              <View style={styles.likedBadge}>
                <Text style={styles.likedCount}>{likedOutfits.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Card Stack */}
        <View style={styles.cardStack}>
          {currentIndex >= outfits.length ? (
            <View style={styles.emptyState}>
              <Ionicons 
                name="checkmark-circle" 
                size={64} 
                color={getColor('accent', 'mint')} 
              />
              <Text style={[getTypography('h2'), styles.emptyTitle]}>
                All caught up!
              </Text>
              <Text style={[getTypography('body'), styles.emptyDescription]}>
                You've explored all available outfits
              </Text>
              <TouchableOpacity style={styles.resetButton} onPress={resetStack}>
                <Text style={[getTypography('body'), styles.resetButtonText]}>
                  Explore Again
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            outfits
              .slice(currentIndex, currentIndex + 3)
              .map((outfit, idx) => (
                <SwipeableCard
                  key={`${outfit.id}-${currentIndex}`}
                  outfit={outfit}
                  index={idx}
                  totalCards={3}
                  onSwipe={handleSwipe}
                  isActive={idx === 0}
                />
              ))
          )}
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity style={[styles.actionButton, styles.passButton]}>
            <Ionicons 
              name="close" 
              size={24} 
              color={getColor('colors', 'error')} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.superLikeButton]}>
            <Ionicons 
              name="star" 
              size={24} 
              color={getColor('accent', 'gold')} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.likeButton]}>
            <Ionicons 
              name="heart" 
              size={24} 
              color={getColor('colors', 'success')} 
            />
          </TouchableOpacity>
        </View>
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
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getSpacing('lg'),
    paddingTop: getSpacing('xxxl'),
    paddingBottom: getSpacing('lg'),
  },
  
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  headerCenter: {
    alignItems: 'center',
  },
  
  headerTitle: {
    color: getColor('neutral', 'charcoal'),
  },
  
  headerSubtitle: {
    color: getColor('neutral', 'slate'),
    marginTop: getSpacing('xs'),
  },
  
  likedButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  
  likedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: getColor('accent', 'coral'),
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  likedCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  cardStack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: getSpacing('lg'),
  },
  
  cardContainer: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  
  cardBackground: {
    flex: 1,
    borderRadius: AYNAMODA_VISION_THEME.layout.card.borderRadius,
  },
  
  card: {
    flex: 1,
    borderRadius: AYNAMODA_VISION_THEME.layout.card.borderRadius,
    ...AYNAMODA_VISION_THEME.layout.card,
  },
  
  cardContent: {
    flex: 1,
    padding: getSpacing('xl'),
    justifyContent: 'space-between',
  },
  
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  
  cardTitle: {
    color: getColor('neutral', 'charcoal'),
    marginBottom: getSpacing('xs'),
  },
  
  cardDescription: {
    color: getColor('neutral', 'slate'),
  },
  
  confidenceContainer: {
    alignItems: 'center',
  },
  
  confidenceLabel: {
    color: getColor('neutral', 'slate'),
    marginBottom: getSpacing('xs'),
  },
  
  confidenceScore: {
    color: getColor('accent', 'coral'),
  },
  
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getSpacing('sm'),
    marginVertical: getSpacing('lg'),
  },
  
  moodText: {
    color: getColor('neutral', 'charcoal'),
  },
  
  piecesContainer: {
    marginVertical: getSpacing('lg'),
  },
  
  piecesLabel: {
    color: getColor('neutral', 'slate'),
    marginBottom: getSpacing('md'),
  },
  
  pieceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing('sm'),
  },
  
  pieceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: getColor('accent', 'mint'),
    marginRight: getSpacing('sm'),
  },
  
  pieceText: {
    color: getColor('neutral', 'charcoal'),
  },
  
  actionHints: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  actionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getSpacing('xs'),
  },
  
  hintText: {
    color: getColor('neutral', 'slate'),
  },
  
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getSpacing('xl'),
    paddingBottom: getSpacing('xxxl'),
    gap: getSpacing('xl'),
  },
  
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    ...AYNAMODA_VISION_THEME.layout.card,
  },
  
  passButton: {
    backgroundColor: 'rgba(245, 101, 101, 0.1)',
  },
  
  superLikeButton: {
    backgroundColor: 'rgba(246, 224, 94, 0.1)',
    transform: [{ scale: 1.1 }],
  },
  
  likeButton: {
    backgroundColor: 'rgba(104, 211, 145, 0.1)',
  },
  
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: getSpacing('xl'),
  },
  
  emptyTitle: {
    color: getColor('neutral', 'charcoal'),
    marginTop: getSpacing('lg'),
    marginBottom: getSpacing('sm'),
  },
  
  emptyDescription: {
    color: getColor('neutral', 'slate'),
    textAlign: 'center',
    marginBottom: getSpacing('xl'),
  },
  
  resetButton: {
    backgroundColor: getColor('accent', 'coral'),
    paddingHorizontal: getSpacing('xl'),
    paddingVertical: getSpacing('md'),
    borderRadius: 25,
  },
  
  resetButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default VisionDiscoverScreen;