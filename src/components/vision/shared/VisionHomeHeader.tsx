import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { getColor, getSpacing, getTypography } from '@/constants/AynaModaVisionTheme';

interface VisionHomeHeaderProps {
  userName?: string;
  onProfilePress: () => void;
}

const VisionHomeHeader: React.FC<VisionHomeHeaderProps> = ({
  userName = 'Beautiful',
  onProfilePress,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={styles.header}>
      <View>
        <Text style={[getTypography('caption', 'medium'), styles.greetingLabel]}>
          {getGreeting()}
        </Text>
        <Text style={[getTypography('h2', 'bold'), styles.welcomeTitle]}>
          {userName}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={styles.profileButton}
        onPress={onProfilePress}
        activeOpacity={0.8}
      >
        <BlurView intensity={20} style={styles.profileBlur}>
          <Ionicons 
            name="person-circle-outline" 
            size={28} 
            color={getColor('neutral', 'charcoal')} 
          />
        </BlurView>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: getSpacing('lg'),
    paddingTop: getSpacing('xxxl'),
    paddingBottom: getSpacing('xl'),
  },
  greetingLabel: {
    color: getColor('neutral', 'slate'),
    marginBottom: getSpacing('xs'),
  },
  welcomeTitle: {
    color: getColor('neutral', 'charcoal'),
  },
  profileButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileBlur: {
    padding: getSpacing('sm'),
  },
});

export default VisionHomeHeader;