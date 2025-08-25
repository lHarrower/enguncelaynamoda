import { Redirect } from 'expo-router';

// Redirect to the actual profile screen in the (app) directory
export default function ProfileRedirect() {
  return <Redirect href="/(app)/profile" />;
}
