import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinenCanvas from './LinenCanvas';
import { APP_THEME_V2 } from '../../constants/AppThemeV2';

const LuxuryShowcase: React.FC = () => {
  return (
    <LinenCanvas>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Luxury Design System</Text>
          <Text style={styles.subtitle}>Coming Soon</Text>
          <Text style={styles.description}>
            The luxury design system showcase is being updated to reflect the new design language.
          </Text>
        </View>
      </SafeAreaView>
    </LinenCanvas>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: APP_THEME_V2.spacing.xl,
  },
  title: {
    ...APP_THEME_V2.typography.scale.hero,
    color: APP_THEME_V2.semantic.text.primary,
    textAlign: 'center',
    marginBottom: APP_THEME_V2.spacing.lg,
  },
  subtitle: {
    ...APP_THEME_V2.typography.scale.h2,
    color: APP_THEME_V2.colors.sageGreen[500],
    textAlign: 'center',
    marginBottom: APP_THEME_V2.spacing.xl,
  },
  description: {
    ...APP_THEME_V2.typography.scale.body1,
    color: APP_THEME_V2.semantic.text.secondary,
    fontFamily: APP_THEME_V2.typography.fonts.body,
    textAlign: 'center',
    maxWidth: 300,
  },
});

export default LuxuryShowcase; 