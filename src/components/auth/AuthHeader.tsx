// Auth Header Component
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface AuthHeaderProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({
  title = 'AYNA',
  subtitle = 'Your AI-Powered Style Assistant',
  showLogo = true,
}) => {
  return (
    <View style={styles.container}>
      {showLogo && (
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>AYNA</Text>
          </View>
        </View>
      )}

      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoPlaceholder: {
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  title: {
    color: '#1F2937',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default AuthHeader;
