import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import Icon from 'react-native-vector-icons/Ionicons';
import { Feather } from '@expo/vector-icons';
import CustomDrawerContent from '../../components/CustomDrawerContent';
import theme from '../../theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function _layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          drawerHideStatusBarOnOpen: true,
          drawerActiveBackgroundColor: '#21253B',
          drawerActiveTintColor: '#fff',
          drawerInactiveTintColor: '#A0A3BD',
          drawerLabelStyle: { marginLeft: -20 },
          drawerStyle: { paddingHorizontal: 0 }, // Removes padding
        }}
      >
        <Drawer.Screen
          name="home"
          options={{
            drawerLabel: 'Trang chủ',
            headerTitle: 'Trang chủ',
            drawerIcon: ({ size, color }) => (
              <Icon name="home-outline" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="profile"
          options={{
            drawerLabel: 'Hồ sơ',
            headerTitle: 'Hồ sơ',
            drawerIcon: ({ size, color }) => (
              <Feather name="user" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="scenarios"
          options={{
            drawerLabel: 'Ngữ cảnh',
            headerTitle: 'Ngữ cảnh',
            drawerIcon: ({ size, color }) => (
              <MaterialIcons name="settings-accessibility" color={color} size={size} />
            ),
          }}
        />
         <Drawer.Screen
          name="voice"
          options={{
            drawerLabel: 'Giọng nói',
            headerTitle: 'Giọng nói',
            drawerIcon: ({ size, color }) => (
              <MaterialIcons name="settings-voice" color={color} size={size}  />
            ),
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  voiceAsisContainer: {
    position: 'absolute',
    bottom: 90, // You can adjust this value to move it further up or down
    alignSelf: 'center', // Align center horizontally
    width: '90%', // You can adjust the width to fit your needs
    paddingLeft: 50,
  },
});
