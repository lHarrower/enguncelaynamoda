// FILE: screens/MainRitualScreen.tsx

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinenCanvas } from '../components/luxury/LinenCanvas';
import { AynaOutfitCard } from '../components/sanctuary/AynaOutfitCard';
import { Outfit, ClothingItem } from '../data/sanctuaryModels';

// Sample outfit data with correct types
const createClothingItem = (id: string, name: string, category: any, imageUrl: string): ClothingItem => ({
  id,
  name,
  category,
  imageUrl,
  colors: ['neutral'],
  dateAdded: new Date(),
  wearCount: 0,
  confidenceScore: 8,
});

const DUMMY_OUTFITS: Outfit[] = [
  { 
    id: 'o1', 
    name: 'Serene Morning',
    moodTag: 'Serene & Grounded', 
    whisper: 'The soft cashmere wraps you in comfort, perfect for a peaceful day.', 
    items: [createClothingItem('1', 'Cashmere Sweater', 'tops', 'https://images.unsplash.com/photo-1506629905607-c7a8b3bb0aa3?w=800&h=1000&fit=crop')],
    confidenceScore: 8
  },
  { 
    id: 'o2', 
    name: 'Confident Leader',
    moodTag: 'Luminous & Confident', 
    whisper: 'Your classic blazer is ready to be your gentle armor today.', 
    items: [createClothingItem('2', 'Tailored Blazer', 'outerwear', 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=1000&fit=crop')],
    confidenceScore: 9
  },
  { 
    id: 'o3', 
    name: 'Joyful Spirit',
    moodTag: 'Joyful & Playful', 
    whisper: 'This flowing dress has been dreaming of sunny mornings. Carry the sunshine with you.', 
    items: [createClothingItem('3', 'Midi Dress', 'dresses', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&h=1000&fit=crop')],
    confidenceScore: 8
  },
];

export const MainRitualScreen = () => {
  return (
    <LinenCanvas>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Good morning, Beautiful</Text>
          <Text style={styles.subtitleText}>Your sanctuary awaits</Text>
        </View>
        {DUMMY_OUTFITS.map(outfit => (
          <AynaOutfitCard
            key={outfit.id}
            outfit={outfit}
            onPress={() => console.log('Outfit selected:', outfit.id)}
          />
        ))}
      </ScrollView>
    </LinenCanvas>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 30,
    paddingBottom: 50,
  },
  welcomeContainer: {
    padding: 24,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '400',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#888888',
    textAlign: 'center',
  },
});