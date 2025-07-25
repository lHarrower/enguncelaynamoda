import React, { useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * Component to remove debugging overlays and visual artifacts
 * that might cause unwanted lines or borders in production
 */
export default function DebugOverlayRemover() {
  useEffect(() => {
    if (__DEV__) {
      // Remove React Native debugging overlays
      const removeDebugOverlays = () => {
        // Remove inspector overlay
        if ((global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
          (global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot = () => {};
          (global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberUnmount = () => {};
        }
        
        // Disable yellow box warnings that might show borders
        if ((console as any).disableYellowBox !== undefined) {
          (console as any).disableYellowBox = true;
        }
        
        // Debug overlays and red borders removed for production UI
      };
      
      // Apply immediately and after a short delay to catch late-loading overlays
      removeDebugOverlays();
      const timeout = setTimeout(removeDebugOverlays, 1000);
      
      return () => clearTimeout(timeout);
    }
  }, []);

  return null; // This component doesn't render anything
} 