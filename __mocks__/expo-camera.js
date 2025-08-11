export const requestCameraPermissionsAsync = jest.fn(async () => ({ status: 'granted', granted: true, canAskAgain: true, expires: 'never' }));

export default {
  requestCameraPermissionsAsync,
};
