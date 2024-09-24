import React from 'react';
import { View, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';

const isIOS = Platform.OS === 'ios';

export default function CustomKeyboardViews2({ children }) {
  return (
    <KeyboardAvoidingView
      behavior={isIOS ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        bounces={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
