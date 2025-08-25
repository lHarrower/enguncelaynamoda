import { Redirect } from 'expo-router';

// Redirect to the actual wardrobe screen in the (app) directory
export default function WardrobeRedirect() {
  return <Redirect href="/(app)/wardrobe" />;
}
