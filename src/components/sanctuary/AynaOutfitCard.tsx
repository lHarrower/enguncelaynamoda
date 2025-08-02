// Legacy AynaOutfitCard - Now redirects to the new V2 version
import React from 'react';
import { AynaOutfitCardV2 } from '@/components/sanctuary/AynaOutfitCardV2';
import { Outfit } from '@/data/sanctuaryModels';

interface AynaOutfitCardProps {
  outfit: Outfit;
  onPress: () => void;
  onFavorite?: () => void;
  showFavoriteButton?: boolean;
}

export const AynaOutfitCard: React.FC<AynaOutfitCardProps> = (props) => {
  // Forward all props to the new V2 component
  return <AynaOutfitCardV2 {...props} />;
};