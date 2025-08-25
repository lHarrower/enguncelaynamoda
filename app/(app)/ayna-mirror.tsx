// AYNA Mirror Main Screen - Integrated with expo-router
import { useTheme } from '@shopify/restyle';
import { Redirect, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { AynaMirrorScreen } from '@/screens/AynaMirrorScreen';
import deepLinkService, {
  processDeepLinkParams as _processDeepLinkParams,
} from '@/services/deepLinkService';
import { DesignSystemType } from '@/theme/DesignSystem';
import { logger } from '@/utils/logger';

// Safe resolver for backward compatibility (default or named export)
const processDeepLinkParams =
  (deepLinkService && deepLinkService.processDeepLinkParams) ||
  _processDeepLinkParams ||
  ((p: unknown) => p ?? {});

export default function AynaMirrorPage() {
  const { user, session, loading } = useAuth();
  const theme = useTheme<DesignSystemType>();
  const { colors } = theme;

  const params = useLocalSearchParams();

  useEffect(() => {
    try {
      if (params && Object.keys(params).length > 0) {
        deepLinkService.processDeepLinkParams({
          feedback: typeof params.feedback === 'string' ? params.feedback : undefined,
          outfit: typeof params.outfit === 'string' ? params.outfit : undefined,
          item: typeof params.item === 'string' ? params.item : undefined,
        });
      }
    } catch (err) {
      logger.error('deep link params processing error', { err, context: 'AynaMirrorPage' });
    }
  }, [params]);

  // Redirect to auth if not authenticated
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        {/* Loading handled by AynaMirrorScreen */}
      </View>
    );
  }

  if (!session || !user) {
    return <Redirect href="/auth/sign-in" />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <AynaMirrorScreen userId={user.id} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
