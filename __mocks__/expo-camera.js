export const requestCameraPermissionsAsync = jest.fn(async () => ({
  status: 'granted',
  granted: true,
  canAskAgain: true,
  expires: 'never',
}));

export const useCameraPermissions = jest.fn(() => [
  {
    status: 'granted',
    granted: true,
    canAskAgain: true,
    expires: 'never',
  },
  jest.fn(async () => ({
    status: 'granted',
    granted: true,
    canAskAgain: true,
    expires: 'never',
  })),
]);

export const CameraView = jest.fn(({ children, ...props }) => {
  const React = require('react');
  const { View } = require('react-native');
  return React.createElement(View, { testID: 'camera-view', ...props }, children);
});

export const CameraType = {
  front: 'front',
  back: 'back',
};

export default {
  requestCameraPermissionsAsync,
  useCameraPermissions,
  CameraView,
  CameraType,
};
