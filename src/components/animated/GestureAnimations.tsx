// Gesture Animations - Touch-based interactive animations
import React, { useCallback, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, ViewStyle } from 'react-native';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  PinchGestureHandler,
  PinchGestureHandlerGestureEvent,
  State,
  TapGestureHandler,
  TapGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';

import { useFadeAnimation } from '@/hooks/useAnimation';
import { SPRING, TIMING } from '@/theme/foundations/Animation';

const { width: _SCREEN_WIDTH, height: _SCREEN_HEIGHT } = Dimensions.get('window');

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
  disabled = false,
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
          translationY: translateY,
        },
      },
    ],
    { useNativeDriver: true },
  );

  const handleDragStart = useCallback(() => {
    if (onDragStart) {
      onDragStart();
    }
    Animated.spring(scale, {
      toValue: 1.05,
      ...SPRING.gentle,
      useNativeDriver: true,
    }).start();
  }, [onDragStart, scale]);

  const calculateFinalPosition = useCallback(
    (translationX: number, translationY: number) => {
      let finalX = lastOffset.current.x + translationX;
      let finalY = lastOffset.current.y + translationY;

      if (bounds) {
        if (bounds.left !== undefined) finalX = Math.max(bounds.left, finalX);
        if (bounds.right !== undefined) finalX = Math.min(bounds.right, finalX);
        if (bounds.top !== undefined) finalY = Math.max(bounds.top, finalY);
        if (bounds.bottom !== undefined) finalY = Math.min(bounds.bottom, finalY);
      }

      if (snapToGrid) {
        finalX = Math.round(finalX / gridSize) * gridSize;
        finalY = Math.round(finalY / gridSize) * gridSize;
      }

      return { finalX, finalY };
    },
    [bounds, snapToGrid, gridSize],
  );

  const handleDragEnd = useCallback(
    (translationX: number, translationY: number) => {
      const { finalX, finalY } = calculateFinalPosition(translationX, translationY);
      lastOffset.current = { x: finalX, y: finalY };

      Animated.parallel([
        Animated.spring(translateX, {
          toValue: finalX,
          ...SPRING.gentle,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: finalY,
          ...SPRING.gentle,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          ...SPRING.gentle,
          useNativeDriver: true,
        }),
      ]).start();

      if (onDragEnd) {
        onDragEnd(finalX, finalY);
      }
    },
    [calculateFinalPosition, translateX, translateY, scale, onDragEnd],
  );

  const onHandlerStateChange = useCallback(
    (event: PanGestureHandlerGestureEvent) => {
      if (disabled || isReducedMotionEnabled) {
        return;
      }

      const { state, translationX, translationY } = event.nativeEvent;

      switch (state) {
        case State.BEGAN:
          handleDragStart();
          break;
        case State.END:
        case State.CANCELLED:
          handleDragEnd(translationX, translationY);
          break;
      }
    },
    [disabled, isReducedMotionEnabled, handleDragStart, handleDragEnd],
  );

  if (disabled || isReducedMotionEnabled) {
    return <Animated.View style={style}>{children}</Animated.View>;
  }

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={(event) => void onHandlerStateChange(event)}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [{ translateX }, { translateY }, { scale }],
          },
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
  disabled = false,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const { isReducedMotionEnabled } = useFadeAnimation();

  const onGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationX: translateX,
          translationY: translateY,
        },
      },
    ],
    { useNativeDriver: true },
  );

  const handleHorizontalSwipe = useCallback(
    (translationX: number) => {
      if (translationX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (translationX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    },
    [onSwipeRight, onSwipeLeft],
  );

  const handleVerticalSwipe = useCallback(
    (translationY: number) => {
      if (translationY > 0 && onSwipeDown) {
        onSwipeDown();
      } else if (translationY < 0 && onSwipeUp) {
        onSwipeUp();
      }
    },
    [onSwipeDown, onSwipeUp],
  );

  const resetPosition = useCallback(() => {
    if (!isReducedMotionEnabled) {
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          ...SPRING.gentle,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          ...SPRING.gentle,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isReducedMotionEnabled, translateX, translateY]);

  const onHandlerStateChange = useCallback(
    (event: PanGestureHandlerGestureEvent) => {
      if (disabled || event.nativeEvent.state !== State.END) {
        return;
      }

      const { translationX, translationY } = event.nativeEvent;
      const absX = Math.abs(translationX);
      const absY = Math.abs(translationY);

      if (absX > absY && absX > threshold) {
        handleHorizontalSwipe(translationX);
      } else if (absY > threshold) {
        handleVerticalSwipe(translationY);
      }

      resetPosition();
    },
    [disabled, threshold, handleHorizontalSwipe, handleVerticalSwipe, resetPosition],
  );

  if (disabled || isReducedMotionEnabled) {
    return <Animated.View style={style}>{children}</Animated.View>;
  }

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={(event) => void onHandlerStateChange(event)}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [{ translateX }, { translateY }],
          },
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
  disabled = false,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const { isReducedMotionEnabled } = useFadeAnimation();

  const lastScale = useRef(1);

  const onGestureEvent = Animated.event(
    [
      {
        nativeEvent: { scale },
      },
    ],
    { useNativeDriver: true },
  );

  const onHandlerStateChange = useCallback(
    (event: PinchGestureHandlerGestureEvent) => {
      if (disabled || isReducedMotionEnabled) {
        return;
      }

      const { state, scale: gestureScale } = event.nativeEvent;

      switch (state) {
        case State.BEGAN:
          if (onPinchStart) {
            onPinchStart();
          }
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
            useNativeDriver: true,
          }).start();

          if (onPinchEnd) {
            onPinchEnd(finalScale);
          }
          break;
      }
    },
    [disabled, isReducedMotionEnabled, onPinchStart, onPinchEnd, minScale, maxScale, scale],
  );

  if (disabled || isReducedMotionEnabled) {
    return <Animated.View style={style}>{children}</Animated.View>;
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
            transform: [{ scale }],
          },
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
  disabled = false,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const { isReducedMotionEnabled } = useFadeAnimation();

  const doubleTapRef = useRef<TapGestureHandler>(null);

  const animatePress = useCallback(
    (toValue: number) => {
      if (isReducedMotionEnabled) {
        return;
      }

      Animated.spring(scale, {
        toValue,
        ...SPRING.gentle,
        useNativeDriver: true,
      }).start();
    },
    [isReducedMotionEnabled, scale],
  );

  const onSingleTapEvent = useCallback(
    (event: TapGestureHandlerGestureEvent) => {
      if (disabled) {
        return;
      }

      const { state } = event.nativeEvent;

      if (state === State.BEGAN) {
        animatePress(pressScale);
      } else if (state === State.END) {
        animatePress(1);
        if (onTap) {
          onTap();
        }
      } else if (state === State.CANCELLED || state === State.FAILED) {
        animatePress(1);
      }
    },
    [disabled, animatePress, pressScale, onTap],
  );

  const onDoubleTapEvent = useCallback(
    (event: TapGestureHandlerGestureEvent) => {
      if (disabled) {
        return;
      }

      const { state } = event.nativeEvent;

      if (state === State.ACTIVE && onDoubleTap) {
        onDoubleTap();
      }
    },
    [disabled, onDoubleTap],
  );

  if (disabled) {
    return <Animated.View style={[style, styles.disabledOpacity]}>{children}</Animated.View>;
  }

  const TapComponent = onDoubleTap ? (
    <TapGestureHandler ref={doubleTapRef} onHandlerStateChange={onDoubleTapEvent} numberOfTaps={2}>
      <TapGestureHandler onHandlerStateChange={onSingleTapEvent} waitFor={doubleTapRef}>
        <Animated.View
          style={[
            style,
            {
              transform: isReducedMotionEnabled ? [] : [{ scale }],
            },
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
            transform: isReducedMotionEnabled ? [] : [{ scale }],
          },
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
  refreshing: _refreshing = false,
  threshold = 80,
  style,
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const refreshOpacity = useRef(new Animated.Value(0)).current;
  const { isReducedMotionEnabled } = useFadeAnimation();

  const isRefreshing = useRef(false);

  const onGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationY: translateY,
        },
      },
    ],
    { useNativeDriver: true },
  );

  const onHandlerStateChange = useCallback(
    async (event: PanGestureHandlerGestureEvent) => {
      if (isReducedMotionEnabled) {
        return;
      }

      const { state, translationY } = event.nativeEvent;

      if (state === State.END && translationY > threshold && !isRefreshing.current) {
        isRefreshing.current = true;

        // Show refresh indicator
        Animated.parallel([
          Animated.spring(translateY, {
            toValue: threshold,
            ...SPRING.gentle,
            useNativeDriver: true,
          }),
          Animated.timing(refreshOpacity, {
            toValue: 1,
            duration: TIMING.quick,
            useNativeDriver: true,
          }),
        ]).start();

        try {
          await onRefresh();
        } finally {
          // Hide refresh indicator
          Animated.parallel([
            Animated.spring(translateY, {
              toValue: 0,
              ...SPRING.gentle,
              useNativeDriver: true,
            }),
            Animated.timing(refreshOpacity, {
              toValue: 0,
              duration: TIMING.quick,
              useNativeDriver: true,
            }),
          ]).start(() => {
            isRefreshing.current = false;
          });
        }
      } else if (state === State.END) {
        // Reset position
        Animated.spring(translateY, {
          toValue: 0,
          ...SPRING.gentle,
          useNativeDriver: true,
        }).start();
      }
    },
    [isReducedMotionEnabled, threshold, onRefresh, refreshOpacity, translateY],
  );

  if (isReducedMotionEnabled) {
    return <Animated.View style={[{ flex: 1 }, style]}>{children}</Animated.View>;
  }

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={(event) => void onHandlerStateChange(event)}
    >
      <Animated.View
        style={[
          { flex: 1 },
          style,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        {/* Refresh Indicator */}
        <Animated.View
          style={[
            styles.refreshIndicator,
            {
              top: -threshold,
              height: threshold,
              opacity: refreshOpacity,
            },
          ]}
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
  return <GestureHandlerRootView style={styles.gestureRoot}>{children}</GestureHandlerRootView>;
};

const styles = StyleSheet.create({
  disabledOpacity: {
    opacity: 0.6,
  },
  gestureRoot: {
    flex: 1,
  },
  refreshIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
  },
});

export default {
  Draggable,
  Swipeable,
  Pinchable,
  Tappable,
  PullToRefresh,
  GestureRoot,
};
