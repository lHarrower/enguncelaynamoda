import { LogBox } from "react-native";

// Quiet noisy dev-time warnings.
LogBox.ignoreLogs([
  /Require cycle:/,
  /expo-notifications: Android Push notifications/,
  /Linking requires a build-time setting `scheme`/,
]);

export {};
