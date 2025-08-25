// Type declarations for the mocks module

declare module 'mocks' {
  export const mocks: {
    asyncStorage: {
      getItem: jest.Mock;
      setItem: jest.Mock;
      removeItem: jest.Mock;
    };
    hapticFeedback: {
      trigger: jest.Mock;
    };
    imagePicker: {
      launchCamera: jest.Mock;
      launchImageLibrary: jest.Mock;
    };
    location: {
      getCurrentPositionAsync: jest.Mock;
      requestPermissionsAsync: jest.Mock;
    };
    reanimated: {
      withTiming: jest.Mock;
      withSpring: jest.Mock;
    };
    netInfo: {
      fetch: jest.Mock;
    };
    supabase: {
      from: jest.Mock;
    };
  };
}
