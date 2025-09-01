import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import StyleDNATest from './StyleDNATest';
import StyleDNAResult from './StyleDNAResult';
import { useStyleDNA } from '@/hooks/useStyleDNA';
import { useAuth } from '@/contexts/AuthContext';

interface StyleDNAFlowProps {
  onComplete: () => void;
  onBack?: () => void;
}

type FlowStep = 'test' | 'result';

interface TestResults {
  personality: string;
  answers: any[];
}

export default function StyleDNAFlow({ onComplete, onBack }: StyleDNAFlowProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('test');
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const { saveStyleDNA, isLoading } = useStyleDNA();
  const { user } = useAuth();

  const handleTestComplete = async (results: TestResults) => {
    setTestResults(results);
    
    try {
      // Save to backend and global state
      await saveStyleDNA({
        userId: user?.id,
        personality: results.personality,
        answers: results.answers,
        completedAt: new Date().toISOString(),
      });
      
      // Move to result screen
      setCurrentStep('result');
    } catch (error) {
      console.error('Error saving Style DNA:', error);
      // Still show results even if save fails
      setCurrentStep('result');
    }
  };

  const handleRetakeTest = () => {
    setTestResults(null);
    setCurrentStep('test');
  };

  const handleContinue = () => {
    onComplete();
  };

  return (
    <View style={styles.container}>
      {currentStep === 'test' && (
        <StyleDNATest
          onComplete={handleTestComplete}
          onBack={onBack}
        />
      )}
      
      {currentStep === 'result' && testResults && (
        <StyleDNAResult
          personality={testResults.personality}
          onContinue={handleContinue}
          onRetake={handleRetakeTest}
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