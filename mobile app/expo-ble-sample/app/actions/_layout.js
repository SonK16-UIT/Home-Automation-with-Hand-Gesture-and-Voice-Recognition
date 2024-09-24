import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function ModalLayout() {
  const router = useRouter();
  
  return (
    <Stack>
      <Stack.Screen 
        name="deviceActions" 
        options={{ 
          title: '',
          headerStyle: { backgroundColor: '#1F233A' }, 
          headerTintColor: '#fff', 
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="hubActions" 
        options={{ 
          headerTitle: '',
          headerStyle: { backgroundColor: '#1F233A' }, 
          headerTintColor: '#fff', 
          presentation: 'modal',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.replace('scenarios')}>
              <AntDesign name="arrowleft" size={22} color="white" />
            </TouchableOpacity>
          ),
        }} 
      />
    </Stack>
  );
}
