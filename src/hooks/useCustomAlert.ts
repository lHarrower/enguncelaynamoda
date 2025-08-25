// Custom Alert Hook - React hook for managing custom alert states
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive' | 'primary';
  icon?: keyof typeof Ionicons.glyphMap;
}

export interface UseCustomAlertReturn {
  isVisible: boolean;
  title: string;
  message: string;
  buttons: AlertButton[];
  type: 'default' | 'success' | 'warning' | 'error' | 'info';
  showCustomAlert: (
    title: string,
    message: string,
    buttons: AlertButton[],
    type?: 'default' | 'success' | 'warning' | 'error' | 'info',
  ) => void;
  hideCustomAlert: () => void;
}

export function useCustomAlert(): UseCustomAlertReturn {
  const [isVisible, setIsVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [buttons, setButtons] = useState<AlertButton[]>([]);
  const [type, setType] = useState<'default' | 'success' | 'warning' | 'error' | 'info'>('default');

  const showCustomAlert = useCallback(
    (
      alertTitle: string,
      alertMessage: string,
      alertButtons: AlertButton[],
      alertType: 'default' | 'success' | 'warning' | 'error' | 'info' = 'default',
    ) => {
      setTitle(alertTitle);
      setMessage(alertMessage);
      setButtons(alertButtons);
      setType(alertType);
      setIsVisible(true);
    },
    [],
  );

  const hideCustomAlert = useCallback(() => {
    setIsVisible(false);
    setTitle('');
    setMessage('');
    setButtons([]);
    setType('default');
  }, []);

  return {
    isVisible,
    title,
    message,
    buttons,
    type,
    showCustomAlert,
    hideCustomAlert,
  };
}

export default useCustomAlert;
