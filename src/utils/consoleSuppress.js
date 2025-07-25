// Console warning suppression for development
// This file suppresses known non-critical warnings that don't affect functionality

if (__DEV__) {
  // Suppress specific React Native warnings that are known and non-critical
  const originalWarn = console.warn;
  const originalError = console.error;

  console.warn = (...args) => {
    const message = args[0];
    
    // Suppress known non-critical warnings
    if (
      typeof message === 'string' && (
        message.includes('VirtualizedLists should never be nested') ||
        message.includes('componentWillReceiveProps has been renamed') ||
        message.includes('componentWillMount has been renamed') ||
        message.includes('AsyncStorage has been extracted') ||
        message.includes('Require cycle:') ||
        message.includes('Remote debugger')
      )
    ) {
      return;
    }
    
    originalWarn.apply(console, args);
  };

  console.error = (...args) => {
    const message = args[0];
    
    // Suppress LogBox-related errors that don't affect functionality
    if (
      typeof message === 'string' && (
        message.includes('LogBox') ||
        message.includes('not attached to window manager')
      )
    ) {
      return;
    }
    
    originalError.apply(console, args);
  };
}

// Global error handler for unhandled promise rejections
if (typeof global !== 'undefined') {
  global.ErrorUtils?.setGlobalHandler?.((error, isFatal) => {
    // Suppress specific LogBox-related crashes
    if (error && error.message && (
      error.message.includes('not attached to window manager') ||
      error.message.includes('LogBox') ||
      error.message.includes('DecorView')
    )) {
      console.log('LogBox-related error suppressed:', error.message);
      return;
    }
    
    // Log the error but don't crash the app for non-fatal errors
    if (!isFatal) {
      console.log('Non-fatal error caught:', error);
      return;
    }
    
    // For fatal errors, still log but handle gracefully
    console.error('Fatal error:', error);
  });

  // Additional LogBox crash prevention
  if (__DEV__) {
    // Override LogBox methods to prevent crashes
    try {
      const LogBox = require('react-native/Libraries/LogBox/LogBox');
      const originalHide = LogBox.hide;
      
      LogBox.hide = function(...args) {
        try {
          return originalHide.apply(this, args);
        } catch (error) {
          console.log('LogBox.hide error suppressed:', error.message);
        }
      };
    } catch (error) {
      // LogBox not available or already patched
    }
  }
}