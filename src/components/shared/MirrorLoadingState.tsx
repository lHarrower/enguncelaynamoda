import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withRepeat, withTiming, useSharedValue, useEffect } from 'react-native-reanimated';
import { DesignSystem } from '@/theme/DesignSystem';

interface MirrorLoadingStateProps {
  message?: string;
  subMessage?: string;
}

export const MirrorLoadingState: React.FC<MirrorLoadingStateProps> = ({
  message = "Curating your perfect look...",
  subMessage = "Analyzing your style preferences and today's weather",
}) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 2000 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.loadingContainer}>
      <BlurView intensity={20} style={styles.loadingBlur}>
        <View style={styles.loadingContent}>
          <Animated.View style={animatedStyle}>
            <Ionicons
              name="sparkles"
              size={48}
              color={DesignSystem.colors.sageGreen[500]}
            />
          </Animated.View>
          <Text style={styles.loadingText}>
            {message}
          </Text>
          <Text style={styles.loadingSubtext}>
            {subMessage}
          </Text>
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DesignSystem.spacing.xl,
  },
  loadingBlur: {
    borderRadius: DesignSystem.radius.lg,
    overflow: 'hidden',
  },
  loadingContent: {
    padding: DesignSystem.spacing.xxl,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  loadingText: {
    ...DesignSystem.typography.h3,
    color: DesignSystem.colors.inkGray[700],
    marginTop: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.sm,
    textAlign: 'center',
  },
  loadingSubtext: {
    ...DesignSystem.typography.caption,
    color: DesignSystem.colors.inkGray[600],
    textAlign: 'center',
  },
});