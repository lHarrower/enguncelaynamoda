// Header Component
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
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
  style?: any;
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
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 2,
  },
  button: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3B82F6',
  },
  buttonIcon: {
    fontSize: 20,
    color: '#3B82F6',
  },
});

export default Header;