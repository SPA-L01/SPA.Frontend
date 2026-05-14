import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';

export const unstable_settings = {
  anchor: '(auth)',
};

function RootNavigator() {
  const { isLoggedIn, loading } = useAuth();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (loading) return;
    if (isLoggedIn) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/login');
    }
  }, [isLoggedIn, loading]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="parking/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="wallet/index" options={{ headerShown: false }} />
        <Stack.Screen name="wallet/top-up" options={{ headerShown: false }} />
        <Stack.Screen name="wallet/add-card" options={{ headerShown: false }} />
        <Stack.Screen name="payment/checkout" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
