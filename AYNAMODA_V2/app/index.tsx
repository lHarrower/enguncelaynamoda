import { Redirect } from 'expo-router';

/**
 * This component is now the entry point for users who are already logged in
 * and are redirected to the root ('/') by the AuthContext.
 * Its only job is to redirect them to the actual home screen,
 * which lives inside our '(app)' group.
 */
const Index = () => {
  // Redirect to the main screen stack inside the (app) group.
  // The router will automatically load `(app)/index.tsx`.
  return <Redirect href="/(app)" />;
};

export default Index;