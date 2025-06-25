import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  onNotificationPress: () => void;
  notificationCount?: number;
  greeting?: string;
  welcomeText?: string;
}

const Header: React.FC<HeaderProps> = ({
  onNotificationPress,
  notificationCount = 0,
  greeting = "Hey Beautiful! 💖",
  welcomeText = "Ready to discover amazing deals?"
}) => {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>{greeting}</Text>
        <Text style={styles.welcomeText}>{welcomeText}</Text>
      </View>
      <TouchableOpacity style={styles.notificationIcon} onPress={onNotificationPress}>
        <Ionicons name="notifications" size={24} color="#B8918F" />
        {notificationCount > 0 && (
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>{notificationCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  greeting: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#7A6B56', // Warm taupe
  },
  welcomeText: {
    fontSize: 16,
    color: '#B8918F', // Rose pink
    marginTop: 4,
  },
  notificationIcon: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#D4A896', // Rose gold
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default Header; 