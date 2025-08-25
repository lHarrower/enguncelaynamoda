import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
// AYNAMODA Color Palette
const COLORS = {
  primary: '#8B6F47',
  secondary: '#B8A082',
  background: '#F5F1E8',
  surface: '#FFFFFF',
  text: '#2C2C2C',
  textLight: '#B8A082',
  border: '#E8DCC6',
  accent: '#D4AF37',
};

interface MirrorHeaderProps {
  greetingText: string;
  dateText: string;
  weatherText?: string;
  headerOpacity: Animated.SharedValue<number>;
  dimensions: {
    isTablet: boolean;
    headerHeight: number;
  };
}

export const MirrorHeader: React.FC<MirrorHeaderProps> = ({
  greetingText,
  dateText,
  weatherText,
  headerOpacity,
  dimensions,
}) => {
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  return (
    <Animated.View style={[getHeaderStyle(dimensions), headerAnimatedStyle]}>
      <BlurView intensity={20} style={styles.headerBlur}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Text style={getGreetingTextStyle(dimensions)}>{greetingText}</Text>
            <Text style={styles.dateText}>{dateText}</Text>
            {weatherText && (
              <View style={styles.weatherContainer}>
                <Ionicons name="partly-sunny-outline" size={16} color={COLORS.textLight} />
                <Text style={styles.weatherText}>{weatherText}</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
};

const getHeaderStyle = (dimensions: { headerHeight: number }) => ({
  height: dimensions.headerHeight,
  paddingTop: 44, // Status bar height
});

const getGreetingTextStyle = (dimensions: { isTablet: boolean }) => ({
  fontSize: dimensions.isTablet ? 32 : 28,
  fontWeight: '700' as const,
  color: COLORS.text,
  marginBottom: 4,
  fontFamily: 'Inter',
});

const styles = StyleSheet.create({
  dateText: {
    color: COLORS.textLight,
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '500' as const,
    marginBottom: 8,
  },
  headerBlur: {
    flex: 1,
  },
  headerContent: {
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  weatherContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  weatherText: {
    color: COLORS.textLight,
    fontFamily: 'Inter',
    fontSize: 14,
    textTransform: 'capitalize',
  },
});
