import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/hooks/useAuth';
import { RootNavigator } from './src/navigation';
import { Loading } from './src/components/ui';
import { theme } from './src/utils';

function AppContent() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <Loading text="Carregando..." />;
  }

  return (
    <NavigationContainer>
      <RootNavigator />
      <StatusBar style="light" backgroundColor={theme.colors.background} />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
