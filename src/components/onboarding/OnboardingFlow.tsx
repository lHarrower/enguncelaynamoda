import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import VisualStyleDNAUpload from '@/components/onboarding/VisualStyleDNAUpload';
import StyleDNASurvey from '@/components/onboarding/StyleDNASurvey';
import WelcomeGift from '@/components/onboarding/WelcomeGift';
import ConfidenceLoop from '@/components/onboarding/ConfidenceLoop';
import { StyleDNAResults } from './StyleDNAResults';
import { intelligenceService } from '@/services/intelligenceService';
import { styleDNAService } from '@/services/styleDNAService';

interface OnboardingFlowProps {
  onComplete: (userData: any) => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<'upload' | 'results' | 'survey' | 'gift' | 'confidence' | 'complete'>('upload');
  const [uploadedPhotos, setUploadedPhotos] = useState<any[]>([]);
  const [styleDNA, setStyleDNA] = useState<any>(null);
  const [isGeneratingStyleDNA, setIsGeneratingStyleDNA] = useState(false);
  const [selectedOutfit, setSelectedOutfit] = useState<any>(null);
  const [confidenceFeedback, setConfidenceFeedback] = useState<string>('');
  const [showConfidenceLoop, setShowConfidenceLoop] = useState(false);

  const handlePhotoUploadComplete = async (photos: any[]) => {
    setUploadedPhotos(photos);
    setIsGeneratingStyleDNA(true);
    
    try {
      // Generate Style DNA from uploaded photos
      const generatedStyleDNA = await styleDNAService.generateStyleDNA(user?.id || 'anonymous', photos);
      setStyleDNA(generatedStyleDNA);
      console.log('[OnboardingFlow] Style DNA generated successfully:', generatedStyleDNA);
    } catch (error) {
      console.error('[OnboardingFlow] Failed to generate Style DNA:', error);
      // Continue with flow even if Style DNA generation fails
    } finally {
      setIsGeneratingStyleDNA(false);
      // Show results if Style DNA was generated, otherwise go to survey
      setCurrentStep(generatedStyleDNA ? 'results' : 'survey');
    }
  };

  const handlePhotoUploadSkip = () => {
    setCurrentStep('survey');
  };
  
  const handleStyleDNAResultsContinue = () => {
    setCurrentStep('survey');
  };

  const handleSurveyComplete = (dnaData: any) => {
    setStyleDNA({ ...dnaData, uploadedPhotos });
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
      uploadedPhotos,
      firstOutfitChoice: selectedOutfit,
      onboardingCompleted: true,
      onboardingDate: new Date().toISOString(),
      confidenceLoopExperienced: !!selectedOutfit,
      visualOnboardingCompleted: uploadedPhotos.length > 0,
    };

    onComplete(userData);
  };

  return (
    <View style={styles.container}>
      {currentStep === 'upload' && (
        <VisualStyleDNAUpload
          onComplete={handlePhotoUploadComplete}
          onSkip={handlePhotoUploadSkip}
          isGenerating={isGeneratingStyleDNA}
        />
      )}
      
      {currentStep === 'results' && styleDNA && (
        <StyleDNAResults
          styleDNA={styleDNA}
          onContinue={handleStyleDNAResultsContinue}
        />
      )}
      
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