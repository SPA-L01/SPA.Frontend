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
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: true }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

import { ErrorBoundary } from '@/components/ErrorBoundary';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://b6bd333f45198113f1995b0ad16a71f6@o4511451166408704.ingest.us.sentry.io/4511482737524736',
  debug: false,           // Tắt debug log nội bộ của Sentry
  tracesSampleRate: 1.0,  // 100% performance traces
  enableNativeNagger: false,
  enabled: true,          // Bật Sentry để test nhận sự cố và biểu đồ trên Sentry Dashboard
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
      <SafeAreaProvider>
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
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(RootLayout);

