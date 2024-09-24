import React from 'react';
import { Stack, Link } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function MotionLayout() {
  const route = useRoute();
  const { id } = route.params;

  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: '',
          headerStyle: { backgroundColor: '#1F233A' }, 
          headerTintColor: '#fff', 
          presentation: 'motion',
        }} 
      />
    </Stack>
  );
}
