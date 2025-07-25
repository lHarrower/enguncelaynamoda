import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { APP_THEME_V2 } from '../../constants/AppThemeV2';

const FilterChip = ({ label, isActive, onPress }: { label: string, isActive: boolean, onPress: () => void }) => {
    
    const animatedContainerStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: withTiming(isActive ? APP_THEME_V2.semantic.accent : 'rgba(255, 255, 255, 0.5)')
        }
    });

    const animatedTextStyle = useAnimatedStyle(() => {
        return {
            color: withTiming(isActive ? APP_THEME_V2.colors.whisperWhite : APP_THEME_V2.semantic.text.secondary)
        }
    });

    return (
        <TouchableOpacity onPress={onPress}>
            <Animated.View style={[styles.categoryChip, animatedContainerStyle]}>
                <Animated.Text style={[styles.categoryText, animatedTextStyle]}>{label}</Animated.Text>
            </Animated.View>
        </TouchableOpacity>
    );
};


const styles = StyleSheet.create({
  categoryChip: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 22,
    marginRight: 12,
    ...APP_THEME_V2.elevation.whisper,
  },
  categoryText: {
    ...APP_THEME_V2.typography.scale.caption,
    fontFamily: APP_THEME_V2.typography.fonts.body,
    fontWeight: 'bold',
  },
});


export default FilterChip; 