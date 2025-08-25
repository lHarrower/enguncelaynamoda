import React from 'react';

import ArtistryHomeScreen from '../artistry/ArtistryHomeScreen';
import { EditorialHomeScreen } from '../editorial/EditorialHomeScreen';
// Import home screen components
import PremiumHomeScreen from '../premium/PremiumHomeScreen';
import StudioHomeScreen from '../studio/StudioHomeScreen';
import UltraPremiumHomeScreen from '../ultra/UltraPremiumHomeScreen';
import { VisionHomeScreen, VisionWardrobeScreen } from '../vision';

// Wrapper components
export const LazyPremiumHomeScreen: React.FC = () => {
  return <PremiumHomeScreen />;
};

export const LazyStudioHomeScreen: React.FC = () => {
  return <StudioHomeScreen />;
};

export const LazyArtistryHomeScreen: React.FC = () => {
  return <ArtistryHomeScreen />;
};

export const LazyUltraPremiumHomeScreen: React.FC = () => {
  return <UltraPremiumHomeScreen />;
};

export const LazyEditorialHomeScreen: React.FC = () => {
  return <EditorialHomeScreen />;
};

export const LazyVisionHomeScreen: React.FC = () => {
  return <VisionHomeScreen />;
};

export const LazyVisionWardrobeScreen: React.FC = () => {
  return <VisionWardrobeScreen />;
};
