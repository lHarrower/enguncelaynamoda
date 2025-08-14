// (Inactive layout) central ignore-warnings imported in app/(app)/_layout.tsx
// app/_layout.tsx
import React from 'react'
import { Slot } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { View, StyleSheet } from 'react-native'

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <View style={styles.flex}>
          <Slot />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 }
})



