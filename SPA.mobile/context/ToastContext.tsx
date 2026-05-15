import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Animated, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, spacing, radius, typography, shadows } from '@/constants/theme';

type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -20, duration: 300, useNativeDriver: true }),
    ]).start(() => setToast(null));
  }, []);

  const showToast = useCallback(({ message, type = 'info', duration = 3000 }: ToastOptions) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    setToast({ message, type, duration });
    
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();

    timeoutRef.current = setTimeout(hideToast, duration);
  }, [hideToast]);

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'alert-circle';
      default: return 'information-circle';
    }
  };

  const getBgColor = (type: ToastType) => {
    switch (type) {
      case 'success': return '#059669';
      case 'error': return '#DC2626';
      default: return palette.darkBg;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <SafeAreaView style={styles.toastContainer} pointerEvents="box-none">
          <Animated.View 
            style={[
              styles.toast, 
              { backgroundColor: getBgColor(toast.type!), opacity, transform: [{ translateY }] }
            ]}
          >
            <Ionicons name={getIcon(toast.type!)} size={20} color={palette.white} />
            <Text style={styles.message}>{toast.message}</Text>
            <TouchableOpacity onPress={hideToast}>
              <Ionicons name="close" size={18} color={palette.white} style={{ opacity: 0.7 }} />
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.full,
    gap: spacing.sm,
    maxWidth: '90%',
    ...shadows.md,
  },
  message: {
    ...typography.body,
    color: palette.white,
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
  },
});
