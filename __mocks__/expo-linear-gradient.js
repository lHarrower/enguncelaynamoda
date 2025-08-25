// Mock for expo-linear-gradient
import React from 'react';

export const LinearGradient = React.forwardRef((props, ref) => {
  const { children, ...otherProps } = props;
  return React.createElement('LinearGradient', { ...otherProps, ref }, children);
});

LinearGradient.displayName = 'LinearGradient';
