import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { palette, spacing, radius, typography, shadows } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
  const handleGetStarted = () => {
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[palette.darkBg, '#1A1A1E']}
        style={styles.gradient}
      />
      
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.imageContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="car-sport" size={80} color={palette.white} />
            </View>
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>Welcome to SPA Parking</Text>
            <Text style={styles.subtitle}>
              Finding a parking spot has never been easier. Search, book, and pay all in one app.
            </Text>
          </View>

          <TouchableOpacity
            testID="get-started-button"
            style={styles.button}
            onPress={handleGetStarted}
          >
            <Text style={styles.buttonText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color={palette.white} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.darkBg,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  imageContainer: {
    marginBottom: spacing.xxl,
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    ...typography.h1,
    color: palette.white,
    textAlign: 'center',
    fontSize: 32,
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: palette.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#007AFF', // Standard blue for CTA
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: radius.full,
    gap: spacing.sm,
    ...shadows.md,
    width: '100%',
  },
  buttonText: {
    ...typography.body,
    color: palette.white,
    fontWeight: '700',
    fontSize: 18,
  },
});
