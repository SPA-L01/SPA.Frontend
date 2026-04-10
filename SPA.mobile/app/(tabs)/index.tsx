import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette, spacing, radius, typography, shadows } from '@/constants/theme';
import { ParkingCard } from '@/components/ui/ParkingCard';
import { CategoryButton } from '@/components/ui/CategoryButton';
import {
  mockParkingLots,
  mockUser,
  DEFAULT_LOCATION,
  CURRENT_ADDRESS,
} from '@/constants/mockData';

// react-native-maps is native-only
let MapView: any = null;
let PROVIDER_DEFAULT: any = null;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  PROVIDER_DEFAULT = Maps.PROVIDER_DEFAULT;
}

const { width } = Dimensions.get('window');

type Category = 'car' | 'truck' | 'motor' | 'bicycle';

const CATEGORIES: { type: Category; label: string }[] = [
  { type: 'car', label: 'Car' },
  { type: 'truck', label: 'Track' },
  { type: 'motor', label: 'Motor' },
  { type: 'bicycle', label: 'Bicycle' },
];

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('car');

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={palette.darkBg} />

      {/* ── Dark Header ─────────────────────────────────────── */}
      <View style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerInner}>
            {/* User greeting */}
            <View style={styles.userRow}>
              {mockUser.avatarUrl ? (
                <Image
                  source={{ uri: mockUser.avatarUrl }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Ionicons name="person" size={20} color={palette.textMuted} />
                </View>
              )}
              <View style={styles.greetingText}>
                <Text style={styles.greetingSmall}>Welcome back!</Text>
                <Text style={styles.greetingName}>{mockUser.name}</Text>
              </View>
            </View>
            {/* Balance Chip & Bell */}
            <View style={styles.topActions}>
              <TouchableOpacity 
                style={styles.balanceHeaderChip}
                onPress={() => router.push('/wallet')}
              >
                <Ionicons name="wallet-outline" size={14} color={palette.white} />
                <Text style={styles.balanceHeaderText}>
                  {mockUser.balance.toLocaleString()}đ
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.bellBtn}>
                <Ionicons name="notifications" size={22} color={palette.white} />
                <View style={styles.bellDot} />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.heroText}>
            Do you need a parking{'\n'}space for your car?
          </Text>
        </SafeAreaView>
      </View>

      {/* ── Scrollable Content ──────────────────────────────── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Map Preview Card */}
        <View style={styles.mapCard}>
          {MapView ? (
            <MapView
              style={styles.mapPreview}
              provider={PROVIDER_DEFAULT}
              initialRegion={DEFAULT_LOCATION}
              scrollEnabled={true}
              zoomEnabled={true}
              pitchEnabled={true}
              rotateEnabled={true}
            />
          ) : (
            <View style={[styles.mapPreview, styles.mapPlaceholder]}>
              <Ionicons name="map-outline" size={32} color={palette.textSecondary} />
            </View>
          )}
          {/* Location chip */}
          <View style={styles.locationChip}>
            <Ionicons name="location" size={14} color={palette.white} />
            <View>
              <Text style={styles.locationLabel}>Your location</Text>
              <Text style={styles.locationAddress} numberOfLines={1}>
                {CURRENT_ADDRESS}
              </Text>
            </View>
          </View>
        </View>

        {/* Category */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Category</Text>
        </View>
        <View style={styles.categoryRow}>
          {CATEGORIES.map((cat) => (
            <CategoryButton
              key={cat.type}
              type={cat.type}
              label={cat.label}
              isSelected={selectedCategory === cat.type}
              onPress={() => setSelectedCategory(cat.type)}
            />
          ))}
        </View>

        {/* Most visited */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your most visited car parks</Text>
        </View>
        <View style={styles.parkingList}>
          {mockParkingLots.map((lot) => (
            <ParkingCard key={lot.id} lot={lot} />
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.offWhite,
  },

  // ── Header ─────────────────────────────────────────────
  header: {
    backgroundColor: palette.darkBg,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.darkBg2,
    borderRadius: radius.full,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: palette.darkCard,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.borderDark,
  },
  greetingText: {
    gap: 1,
  },
  greetingSmall: {
    fontSize: 11,
    color: palette.textMuted,
    fontWeight: '400',
  },
  greetingName: {
    fontSize: 13,
    color: palette.white,
    fontWeight: '600',
  },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.darkBg2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  balanceHeaderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: palette.darkBg2,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: palette.white + '10',
  },
  balanceHeaderText: {
    color: palette.white,
    fontSize: 13,
    fontWeight: '700',
  },
  bellDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF453A',
    borderWidth: 1.5,
    borderColor: palette.darkBg2,
  },
  heroText: {
    fontSize: 30,
    fontWeight: '800',
    color: palette.white,
    lineHeight: 38,
    letterSpacing: -0.5,
  },

  // ── Scroll Content ────────────────────────────────────
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },

  // ── Map Card ──────────────────────────────────────────
  mapCard: {
    height: 180,
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  mapPreview: {
    ...StyleSheet.absoluteFillObject,
  },
  mapPlaceholder: {
    backgroundColor: palette.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationChip: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: palette.darkBg,
    borderRadius: radius.full,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  locationLabel: {
    fontSize: 10,
    color: palette.textMuted,
    fontWeight: '400',
  },
  locationAddress: {
    fontSize: 13,
    color: palette.white,
    fontWeight: '600',
    maxWidth: 180,
  },

  // ── Sections ──────────────────────────────────────────
  sectionHeader: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h2,
    color: palette.textPrimary,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  parkingList: {
    gap: 0,
  },
});
