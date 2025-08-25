// Header Component
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

import { useHapticFeedback } from '@/hooks/useHapticFeedback';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  leftButton?: {
    title?: string;
    icon?: string;
    onPress: () => void;
  };
  rightButton?: {
    title?: string;
    icon?: string;
    onPress: () => void;
  };
  centerComponent?: React.ReactNode;
  style?: ViewStyle;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  leftButton,
  rightButton,
  centerComponent,
  style,
}) => {
  const { triggerSelection } = useHapticFeedback();

  const handleButtonPress = (onPress: () => void) => {
    triggerSelection();
    onPress();
  };

  return (
    <SafeAreaView style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={styles.leftSection}>
          {leftButton && (
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleButtonPress(leftButton.onPress)}
              activeOpacity={0.7}
            >
              {leftButton.icon ? (
                <Text style={styles.buttonIcon}>{leftButton.icon}</Text>
              ) : (
                <Text style={styles.buttonText}>{leftButton.title}</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.centerSection}>
          {centerComponent || (
            <View style={styles.titleContainer}>
              {title && <Text style={styles.title}>{title}</Text>}
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
          )}
        </View>

        <View style={styles.rightSection}>
          {rightButton && (
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleButtonPress(rightButton.onPress)}
              activeOpacity={0.7}
            >
              {rightButton.icon ? (
                <Text style={styles.buttonIcon}>{rightButton.icon}</Text>
              ) : (
                <Text style={styles.buttonText}>{rightButton.title}</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  buttonIcon: {
    color: '#3B82F6',
    fontSize: 20,
  },
  buttonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '500',
  },
  centerSection: {
    alignItems: 'center',
    flex: 2,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftSection: {
    alignItems: 'flex-start',
    flex: 1,
  },
  rightSection: {
    alignItems: 'flex-end',
    flex: 1,
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
  title: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  titleContainer: {
    alignItems: 'center',
  },
});

export default Header;
