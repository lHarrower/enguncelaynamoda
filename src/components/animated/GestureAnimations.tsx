// Gesture Animations - Touch-based interactive animations
import React, { useRef, useCallback } from 'react';
import {
  Animated,
  PanGestureHandler,
  TapGestureHandler,
  PinchGestureHandler,
  State,
  GestureHandlerRootView
} from 'react-native-gesture-handler';
import { Dimensions, ViewStyle } from 'react-native';
import { useSpringAnimation, useFadeAnimation } from '@/hooks/useAnimation';
import { AnimationSystem, SPRING, TIMING } from '@/theme/foundations/Animation';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Draggable Component with spring physics
 */
interface DraggableProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onDragStart?: () => void;
  onDragEnd?: (x: number, y: number) => void;
  bounds?: {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
  };
  snapToGrid?: boolean;
  gridSize?: number;
  disabled?: boolean;
}

export const Draggable: React.FC<DraggableProps> = ({
  children,
  style,
  onDragStart,
  onDragEnd,
  bounds,
  snapToGrid = false,
  gridSize = 20,
  disabled = false
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const { isReducedMotionEnabled } = useFadeAnimation();
  
  const lastOffset = useRef({ x: 0, y: 0 });
  
  const onGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationX: translateX,
          translationY: translateY
        }
      }
    ],
    { useNativeDriver: true }
  );
  
  const onHandlerStateChange = useCallback(
    (event: any) => {
      if (disabled || isReducedMotionEnabled) return;
      
      const { state, translationX, translationY } = event.nativeEvent;
      
      switch (state) {
        case State.BEGAN:
          if (onDragStart) onDragStart();
          
          // Scale up slightly to indicate drag start
          Animated.spring(scale, {
            toValue: 1.05,
            ...SPRING.gentle,
            useNativeDriver: true
          }).start();
          break;
          
        case State.END:
        case State.CANCELLED:
          // Calculate final position
          let finalX = lastOffset.current.x + translationX;
          let finalY = lastOffset.current.y + translationY;
          
          // Apply bounds
          if (bounds) {
            if (bounds.left !== undefined) finalX = Math.max(bounds.left, finalX);
            if (bounds.right !== undefined) finalX = Math.min(bounds.right, finalX);
            if (bounds.top !== undefined) finalY = Math.max(bounds.top, finalY);
            if (bounds.bottom !== undefined) finalY = Math.min(bounds.bottom, finalY);
          }
          
          // Snap to grid if enabled
          if (snapToGrid) {
            finalX = Math.round(finalX / gridSize) * gridSize;
            finalY = Math.round(finalY / gridSize) * gridSize;
          }
          
          // Update last offset
          lastOffset.current = { x: finalX, y: finalY };
          
          // Animate to final position
          Animated.parallel([
            Animated.spring(translateX, {
              toValue: finalX,
              ...SPRING.gentle,
              useNativeDriver: true
            }),
            Animated.spring(translateY, {
              toValue: finalY,
              ...SPRING.gentle,
              useNativeDriver: true
            }),
            Animated.spring(scale, {
              toValue: 1,
              ...SPRING.gentle,
              useNativeDriver: true
            })
          ]).start();
          
          if (onDragEnd) onDragEnd(finalX, finalY);
          break;
      }
    },
    [disabled, isReducedMotionEnabled, onDragStart, onDragEnd, bounds, snapToGrid, gridSize]
  );
  
  if (disabled || isReducedMotionEnabled) {
    return (
      <Animated.View style={[style]}>
        {children}
      </Animated.View>
    );
  }
  
  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [
              { translateX },
              { translateY },
              { scale }
            ]
          }
        ]}
      >
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
};

/**
 * Swipeable Component with directional callbacks
 */
interface SwipeableProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  disabled?: boolean;
}

export const Swipeable: React.FC<SwipeableProps> = ({
  children,
  style,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  disabled = false
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const { isReducedMotionEnabled } = useFadeAnimation();
  
  const onGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationX: translateX,
          translationY: translateY
        }
      }
    ],
    { useNativeDriver: true }
  );
  
  const onHandlerStateChange = useCallback(
    (event: any) => {
      if (disabled) return;
      
      const { state, translationX, translationY, velocityX, velocityY } = event.nativeEvent;
      
      if (state === State.END) {
        const absX = Math.abs(translationX);
        const absY = Math.abs(translationY);
        
        // Determine swipe direction
        if (absX > absY && absX > threshold) {
          // Horizontal swipe
          if (translationX > 0 && onSwipeRight) {
            onSwipeRight();
          } else if (translationX < 0 && onSwipeLeft) {
            onSwipeLeft();
          }
        } else if (absY > threshold) {
          // Vertical swipe
          if (translationY > 0 && onSwipeDown) {
            onSwipeDown();
          } else if (translationY < 0 && onSwipeUp) {
            onSwipeUp();
          }
        }
        
        // Reset position
        if (!isReducedMotionEnabled) {
          Animated.parallel([
            Animated.spring(translateX, {
              toValue: 0,
              ...SPRING.gentle,
              useNativeDriver: true
            }),
            Animated.spring(translateY, {
              toValue: 0,
              ...SPRING.gentle,
              useNativeDriver: true
            })
          ]).start();
        }
      }
    },
    [disabled, isReducedMotionEnabled, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]
  );
  
  if (disabled || isReducedMotionEnabled) {
    return (
      <Animated.View style={[style]}>
        {children}
      </Animated.View>
    );
  }
  
  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [
              { translateX },
              { translateY }
            ]
          }
        ]}
      >
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
};

/**
 * Pinchable Component for zoom gestures
 */
interface PinchableProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPinchStart?: () => void;
  onPinchEnd?: (scale: number) => void;
  minScale?: number;
  maxScale?: number;
  disabled?: boolean;
}

export const Pinchable: React.FC<PinchableProps> = ({
  children,
  style,
  onPinchStart,
  onPinchEnd,
  minScale = 0.5,
  maxScale = 3,
  disabled = false
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const { isReducedMotionEnabled } = useFadeAnimation();
  
  const lastScale = useRef(1);
  
  const onGestureEvent = Animated.event(
    [
      {
        nativeEvent: { scale }
      }
    ],
    { useNativeDriver: true }
  );
  
  const onHandlerStateChange = useCallback(
    (event: any) => {
      if (disabled || isReducedMotionEnabled) return;
      
      const { state, scale: gestureScale } = event.nativeEvent;
      
      switch (state) {
        case State.BEGAN:
          if (onPinchStart) onPinchStart();
          break;
          
        case State.END:
        case State.CANCELLED:
          let finalScale = lastScale.current * gestureScale;
          
          // Apply scale bounds
          finalScale = Math.max(minScale, Math.min(maxScale, finalScale));
          
          lastScale.current = finalScale;
          
          // Animate to final scale
          Animated.spring(scale, {
            toValue: finalScale,
            ...SPRING.gentle,
            useNativeDriver: true
          }).start();
          
          if (onPinchEnd) onPinchEnd(finalScale);
          break;
      }
    },
    [disabled, isReducedMotionEnabled, onPinchStart, onPinchEnd, minScale, maxScale]
  );
  
  if (disabled || isReducedMotionEnabled) {
    return (
      <Animated.View style={[style]}>
        {children}
      </Animated.View>
    );
  }
  
  return (
    <PinchGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [{ scale }]
          }
        ]}
      >
        {children}
      </Animated.View>
    </PinchGestureHandler>
  );
};

/**
 * Tappable Component with press animations
 */
interface TappableProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  pressScale?: number;
  disabled?: boolean;
}

export const Tappable: React.FC<TappableProps> = ({
  children,
  style,
  onTap,
  onDoubleTap,
  onLongPress,
  pressScale = 0.95,
  disabled = false
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const { isReducedMotionEnabled } = useFadeAnimation();
  
  const doubleTapRef = useRef<any>();
  
  const animatePress = useCallback(
    (toValue: number) => {
      if (isReducedMotionEnabled) return;
      
      Animated.spring(scale, {
        toValue,
        ...SPRING.gentle,
        useNativeDriver: true
      }).start();
    },
    [isReducedMotionEnabled]
  );
  
  const onSingleTapEvent = useCallback(
    (event: any) => {
      if (disabled) return;
      
      const { state } = event.nativeEvent;
      
      if (state === State.BEGAN) {
        animatePress(pressScale);
      } else if (state === State.END) {
        animatePress(1);
        if (onTap) onTap();
      } else if (state === State.CANCELLED || state === State.FAILED) {
        animatePress(1);
      }
    },
    [disabled, animatePress, pressScale, onTap]
  );
  
  const onDoubleTapEvent = useCallback(
    (event: any) => {
      if (disabled) return;
      
      const { state } = event.nativeEvent;
      
      if (state === State.ACTIVE && onDoubleTap) {
        onDoubleTap();
      }
    },
    [disabled, onDoubleTap]
  );
  
  if (disabled) {
    return (
      <Animated.View style={[style, { opacity: 0.6 }]}>
        {children}
      </Animated.View>
    );
  }
  
  const TapComponent = onDoubleTap ? (
    <TapGestureHandler
      ref={doubleTapRef}
      onHandlerStateChange={onDoubleTapEvent}
      numberOfTaps={2}
    >
      <TapGestureHandler
        onHandlerStateChange={onSingleTapEvent}
        waitFor={doubleTapRef}
      >
        <Animated.View
          style={[
            style,
            {
              transform: isReducedMotionEnabled ? [] : [{ scale }]
            }
          ]}
        >
          {children}
        </Animated.View>
      </TapGestureHandler>
    </TapGestureHandler>
  ) : (
    <TapGestureHandler onHandlerStateChange={onSingleTapEvent}>
      <Animated.View
        style={[
          style,
          {
            transform: isReducedMotionEnabled ? [] : [{ scale }]
          }
        ]}
      >
        {children}
      </Animated.View>
    </TapGestureHandler>
  );
  
  return TapComponent;
};

/**
 * Pull to Refresh Component
 */
interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  refreshing?: boolean;
  threshold?: number;
  style?: ViewStyle;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  refreshing = false,
  threshold = 80,
  style
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const refreshOpacity = useRef(new Animated.Value(0)).current;
  const { isReducedMotionEnabled } = useFadeAnimation();
  
  const isRefreshing = useRef(false);
  
  const onGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationY: translateY
        }
      }
    ],
    { useNativeDriver: true }
  );
  
  const onHandlerStateChange = useCallback(
    async (event: any) => {
      if (isReducedMotionEnabled) return;
      
      const { state, translationY } = event.nativeEvent;
      
      if (state === State.END && translationY > threshold && !isRefreshing.current) {
        isRefreshing.current = true;
        
        // Show refresh indicator
        Animated.parallel([
          Animated.spring(translateY, {
            toValue: threshold,
            ...SPRING.gentle,
            useNativeDriver: true
          }),
          Animated.timing(refreshOpacity, {
            toValue: 1,
            duration: TIMING.fast,
            useNativeDriver: true
          })
        ]).start();
        
        try {
          await onRefresh();
        } finally {
          // Hide refresh indicator
          Animated.parallel([
            Animated.spring(translateY, {
              toValue: 0,
              ...SPRING.gentle,
              useNativeDriver: true
            }),
            Animated.timing(refreshOpacity, {
              toValue: 0,
              duration: TIMING.fast,
              useNativeDriver: true
            })
          ]).start(() => {
            isRefreshing.current = false;
          });
        }
      } else if (state === State.END) {
        // Reset position
        Animated.spring(translateY, {
          toValue: 0,
          ...SPRING.gentle,
          useNativeDriver: true
        }).start();
      }
    },
    [isReducedMotionEnabled, threshold, onRefresh]
  );
  
  if (isReducedMotionEnabled) {
    return (
      <Animated.View style={[{ flex: 1 }, style]}>
        {children}
      </Animated.View>
    );
  }
  
  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View
        style={[
          { flex: 1 },
          style,
          {
            transform: [{ translateY }]
          }
        ]}
      >
        {/* Refresh Indicator */}
        <Animated.View
          style={{
            position: 'absolute',
            top: -threshold,
            left: 0,
            right: 0,
            height: threshold,
            justifyContent: 'center',
            alignItems: 'center',
            opacity: refreshOpacity
          }}
        >
          {/* Add your refresh indicator here */}
        </Animated.View>
        
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
};

/**
 * Gesture Root Provider
 */
interface GestureRootProps {
  children: React.ReactNode;
}

export const GestureRoot: React.FC<GestureRootProps> = ({ children }) => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {children}
    </GestureHandlerRootView>
  );
};

export default {
  Draggable,
  Swipeable,
  Pinchable,
  Tappable,
  PullToRefresh,
  GestureRoot
};