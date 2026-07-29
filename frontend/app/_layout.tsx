import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Slot } from 'expo-router';

export default function RootLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F3F0' }}>
      <Slot />
    </SafeAreaView>
  );
}