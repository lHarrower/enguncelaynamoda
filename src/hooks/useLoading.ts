// Loading Hook - React hook for managing loading states
import { useCallback, useState } from 'react';

export interface UseLoadingReturn {
  isLoading: boolean;
  showLoading: (title?: string, subtitle?: string) => void;
  hideLoading: () => void;
}

export function useLoading(): UseLoadingReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTitle, setLoadingTitle] = useState<string>('Loading...');
  const [loadingSubtitle, setLoadingSubtitle] = useState<string | undefined>();

  const showLoading = useCallback((title?: string, subtitle?: string) => {
    setLoadingTitle(title || 'Loading...');
    setLoadingSubtitle(subtitle);
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingTitle('Loading...');
    setLoadingSubtitle(undefined);
  }, []);

  return {
    isLoading,
    showLoading,
    hideLoading,
  };
}

export default useLoading;
