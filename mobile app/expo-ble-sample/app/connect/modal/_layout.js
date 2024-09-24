import React from 'react';
import { Stack, Link } from 'expo-router';

import { TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import AntDesign from '@expo/vector-icons/AntDesign';
export default function ModalLayout() {
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
          presentation: 'modal',
          headerRight: () => (
            <Link href={{ pathname: "/connect/modal/second", params: { id } }} asChild>
              <TouchableOpacity>
                <AntDesign name="arrowright" size={22} color="white" />
              </TouchableOpacity>
            </Link>
          ),
        }} 
      />
      <Stack.Screen 
        name="second" 
        options={{ 
          headerTitle: '',
          headerStyle: { backgroundColor: '#1F233A' }, 
          headerTintColor: '#fff', 
          presentation: 'modal' 
        }} 
      />
       <Stack.Screen 
        name="third" 
        options={{ 
          headerShown: false
        }} 
      />
       <Stack.Screen 
        name="fourth" 
        options={{ 
          headerShown: false
        }} 
      />
    </Stack>
  );
}
