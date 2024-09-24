import React from 'react';
import { Stack } from 'expo-router';

export default function ConnectLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="rasp" options={{ headerShown: false }}/>

      <Stack.Screen name="modal" options={{ 
        title: "wifi",
        headerShown: false 
      }} />
      <Stack.Screen name="motion" options={{ 
        title: "picture",
        headerShown: false
      }} />
    </Stack>
  );
}
