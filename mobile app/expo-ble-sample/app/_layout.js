import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';
import "../global.css";
import { AuthContextProvider, useAuth } from '../context/authContext';
import { MenuProvider } from 'react-native-popup-menu';
import { Provider } from 'react-redux';
import { store } from '../redux/store';

const MainLayout = () => {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const opacity = useSharedValue(1); // Reanimated shared value for opacity

  useEffect(() => {
    const navigate = () => {
      const inApp = segments[0] === '(app)';
      if (isAuthenticated && !inApp) {
        router.replace('home');
      } else if (isAuthenticated === false) {
        router.replace('signIn');
      }
    };

    router.replace('introduction');

    const timer = setTimeout(() => {
      if (typeof isAuthenticated == 'undefined') return;

      opacity.value = withTiming(0, { duration: 500, easing: Easing.inOut(Easing.ease) }, () => {
        runOnJS(navigate)();
        opacity.value = withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) });
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Slot />
    </Animated.View>
  );
}

export default function RootLayout() {
  return (
    <MenuProvider>
      <AuthContextProvider>
        <Provider store={store}>
          <MainLayout />
        </Provider>
      </AuthContextProvider>
    </MenuProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F233A',
  },
});
