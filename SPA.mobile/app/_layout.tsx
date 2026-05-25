import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/context/AuthContext';
import { AppModeProvider } from '@/context/AppModeContext';
import { WalletProvider } from '@/context/WalletContext';
import { BookingProvider } from '@/context/BookingContext';
import { ParkingSpotProvider } from '@/context/ParkingSpotContext';
import { FavouritesProvider } from '@/context/FavouritesContext';
import { ToastProvider } from '@/context/ToastContext';
import { notificationService } from '@/services/notification.service';
import { analyticsService } from '@/services/analytics.service';
import { useEffect } from 'react';

export const unstable_settings = {
  anchor: '(tabs)',
};

function ScreenViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      analyticsService.logScreenView(pathname);
    }
  }, [pathname]);

  return null;
}

function RootNavigator() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ScreenViewTracker />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function RootLayout() {
  useEffect(() => {
    notificationService.registerForPushNotificationsAsync();
    
    // Bắt đầu đo lường thời lượng phiên hoạt động
    analyticsService.startSession();

    return () => {
      analyticsService.endSession();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <AuthProvider>
          <AppModeProvider>
            <ToastProvider>
              <WalletProvider>
                <BookingProvider>
                  <ParkingSpotProvider>
                    <FavouritesProvider>
                      <RootNavigator />
                    </FavouritesProvider>
                  </ParkingSpotProvider>
                </BookingProvider>
              </WalletProvider>
            </ToastProvider>
          </AppModeProvider>
        </AuthProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

