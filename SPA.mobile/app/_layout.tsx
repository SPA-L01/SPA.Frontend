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
import * as Sentry from '@sentry/react-native';

// Khởi tạo Sentry cho ứng dụng React Native
Sentry.init({
  dsn: 'https://e14d3eaa5e0f457f8d6f3cde386b5770@o4507119106097152.ingest.us.sentry.io/4507119114354688',
  debug: false,           // tắt console spam, vẫn gửi lên server
  tracesSampleRate: 1.0,  // 100% performance traces
  enableNativeNagger: false,
});

function RootLayout() {
  useEffect(() => {
    notificationService.registerForPushNotificationsAsync();

    // Bắt đầu đo lường thời lượng phiên hoạt động
    analyticsService.startSession();

    // Gửi các event bị pending (khi app bị offline lần trước)
    analyticsService.flushOfflineQueue();

    // Gửi event "app opened" lên Sentry mỗi lần khởi động
    Sentry.captureMessage('app_opened', {
      level: 'info',
      tags: { event_type: 'lifecycle' },
    });
    // Metric counter cho app opens — nhìn thấy dạng chart trên Metrics tab
    Sentry.metrics.count('app.opened', 1);

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

export default Sentry.wrap(RootLayout);

