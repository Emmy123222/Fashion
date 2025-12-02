// App.tsx
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';

// Global error handler setup
const setupGlobalErrorHandlers = () => {
  // Suppress console errors in production for cleaner UX
  if (!__DEV__) {
    console.error = () => {};
    console.warn = () => {};
  }
};

export default function App() {
  useEffect(() => {
    setupGlobalErrorHandlers();
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <ErrorBoundary>
            <StatusBar style="auto" />
            <AppNavigator />
          </ErrorBoundary>
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
