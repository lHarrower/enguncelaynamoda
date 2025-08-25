// Mock for expo-blur
import React from 'react';

export const BlurView = React.forwardRef((props, ref) => {
  const { children, ...otherProps } = props;
  return React.createElement('BlurView', { ...otherProps, ref }, children);
});

BlurView.displayName = 'BlurView';
