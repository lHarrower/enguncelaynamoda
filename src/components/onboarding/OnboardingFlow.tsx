import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import StyleDNASurvey from './StyleDNASurvey';
import WelcomeGift from './WelcomeGift';
import ConfidenceLoop from './ConfidenceLoop';

interface OnboardingFlowProps {
  onComplete: (userData: any) => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<'survey' | 'gift' | 'confidence' | 'complete'>('survey');
  const [styleDNA, setStyleDNA] = useState<any>(null);
  const [selectedOutfit, setSelectedOutfit] = useState<any>(null);
  const [confidenceFeedback, setConfidenceFeedback] = useState<string>('');
  const [showConfidenceLoop, setShowConfidenceLoop] = useState(false);

  const handleSurveyComplete = (dnaData: any) => {
    setStyleDNA(dnaData);
    setCurrentStep('gift');
  };

  const handleOutfitSelect = (outfit: any, feedback: string) => {
    setSelectedOutfit(outfit);
    setConfidenceFeedback(feedback);
    setShowConfidenceLoop(true);
  };

  const handleGiftComplete = () => {
    if (!selectedOutfit) {
      // If no outfit was selected, skip confidence loop
      handleOnboardingComplete();
    }
    // Otherwise, confidence loop will handle completion
  };

  const handleConfidenceLoopClose = () => {
    setShowConfidenceLoop(false);
  };

  const handleConfidenceLoopContinue = () => {
    setShowConfidenceLoop(false);
    handleOnboardingComplete();
  };

  const handleOnboardingComplete = () => {
    const userData = {
      styleDNA,
      firstOutfitChoice: selectedOutfit,
      onboardingCompleted: true,
      onboardingDate: new Date().toISOString(),
      confidenceLoopExperienced: !!selectedOutfit,
    };

    onComplete(userData);
  };

  return (
    <View style={styles.container}>
      {currentStep === 'survey' && (
        <StyleDNASurvey onComplete={handleSurveyComplete} />
      )}
      
      {currentStep === 'gift' && styleDNA && (
        <WelcomeGift
          styleDNA={styleDNA}
          onComplete={handleGiftComplete}
          onOutfitSelect={handleOutfitSelect}
        />
      )}

      {selectedOutfit && (
        <ConfidenceLoop
          visible={showConfidenceLoop}
          outfit={selectedOutfit}
          feedback={confidenceFeedback}
          onClose={handleConfidenceLoopClose}
          onContinue={handleConfidenceLoopContinue}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});