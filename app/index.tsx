// app/index.tsx - Main App Entry Point
import { Redirect } from 'expo-router';
import React from 'react';

// Redirect to the main app
export default function RootIndex() {
  return <Redirect href="/(app)" />;
}
