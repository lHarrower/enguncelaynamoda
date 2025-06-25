import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Replace these placeholder values with your actual Supabase project credentials
// You can find these in your Supabase project dashboard under Settings > API
const supabaseUrl = 'https://sjiupooxpzhwnfriyzqx.supabase.co'; // e.g., 'https://your-project.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqaXVwb294cHpod25mcml5enF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MDA4MDUsImV4cCI6MjA2NjI3NjgwNX0.GVNUCG8O-CDaaQEj4NorhTh6tjE_mpuB28j2hCMmXds'; // Your project's anon/public key

// Create and configure the Supabase client with React Native async storage
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use AsyncStorage for session persistence in React Native
    storage: AsyncStorage,
    // Automatically refresh the token before it expires
    autoRefreshToken: true,
    // Persist the session across app restarts
    persistSession: true,
    // Detect when the session should be refreshed
    detectSessionInUrl: false,
  },
});

export default supabase; 
