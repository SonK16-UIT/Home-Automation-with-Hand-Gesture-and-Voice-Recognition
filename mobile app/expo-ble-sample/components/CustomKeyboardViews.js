import { View, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import React from 'react';

const ios = Platform.OS === 'ios';

export default function CustomKeyboardViews({ children }) {
  return (
    <KeyboardAvoidingView
      behavior={ios ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={{ flex: 1 }}
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }} 
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
