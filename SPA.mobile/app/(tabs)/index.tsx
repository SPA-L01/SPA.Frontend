import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
  Dimensions,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, spacing, radius, typography, shadows } from '@/constants/theme';
import { ParkingCard } from '@/components/ui/ParkingCard';
import { CategoryButton } from '@/components/ui/CategoryButton';
import { DEFAULT_LOCATION, CURRENT_ADDRESS } from '@/constants/mockData';
import { useWallet } from '@/context/WalletContext';
import { parkingService, userService } from '@/services/api';
import * as Sentry from '@sentry/react-native';

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
  { type: 'car', label: 'Ô tô' },
  { type: 'truck', label: 'Xe tải' },
  { type: 'motor', label: 'Xe máy' },
  { type: 'bicycle', label: 'Xe đạp' },
];

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('car');
  const [search, setSearch] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [parkingLots, setParkingLots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { balance, reload } = useWallet();
  const insets = useSafeAreaInsets();

  const loadData = async () => {
    try {
      // Load profile và bãi đỗ độc lập để nếu chưa đăng nhập (lỗi 401) vẫn load được danh sách bãi xe
      userService.getMe()
        .then((user) => setProfile(user))
        .catch(() => setProfile(null));

      const popular = await parkingService.getLocations({ sortBy: 'viewCount', limit: 5 });
      setParkingLots(Array.isArray(popular) ? popular : popular.data || []);
    } catch (e) {
      console.error('Home load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => {
    loadData();
    reload();
  }, []));

  // Search effect
  useEffect(() => {
    if (search.length === 0) {
      loadData();
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await parkingService.getLocations({ search, limit: 10 });
        setParkingLots(Array.isArray(data) ? data : data.data || []);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    }, 600);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const displayName = profile 
    ? `${profile.lastName || ''} ${profile.firstName || ''}`.trim() || 'User'
    : 'Guest';

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={palette.darkBg} />

      {/* ── Dark Header ─────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.md) }]}>
        <View style={styles.headerInner}>
          {/* User greeting */}
          <TouchableOpacity style={styles.userRow} onPress={() => router.push('/(tabs)/profile')}>
            {profile?.avatarUrl ? (
              <Image
                source={{ uri: profile.avatarUrl }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={20} color={palette.textMuted} />
              </View>
            )}
            <View style={styles.greetingText}>
              <Text style={styles.greetingSmall}>Chào mừng quay trở lại!</Text>
              <Text style={styles.greetingName} numberOfLines={1}>{displayName}</Text>
            </View>
          </TouchableOpacity>
          {/* Balance Chip & Bell */}
          <View style={styles.topActions}>
            <TouchableOpacity 
              style={styles.balanceHeaderChip}
              onPress={() => router.push('/wallet')}
            >
              <Ionicons name="wallet-outline" size={14} color={palette.white} />
              <Text style={styles.balanceHeaderText}>
                {balance.toLocaleString()}đ
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.bellBtn}>
              <Ionicons name="notifications" size={22} color={palette.white} />
              <View style={styles.bellDot} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.heroText}>
          Bạn cần tìm{'\n'}chỗ đỗ xe ô tô?
        </Text>

        {/* Search Bar in Header */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={palette.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm bãi xe theo tên, địa chỉ..."
            placeholderTextColor={palette.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => {
              Sentry.addBreadcrumb({ category: 'user.action', message: 'User cleared search', level: 'info', data: { screen: 'HomeScreen' } });
              setSearch('');
            }}>
              <Ionicons name="close-circle" size={18} color={palette.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Scrollable Content ──────────────────────────────── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Map Preview Card */}
        <TouchableOpacity style={styles.mapCard} onPress={() => router.push('/(tabs)/map')}>
          {MapView ? (
            <MapView
              style={styles.mapPreview}
              provider={PROVIDER_DEFAULT}
              initialRegion={DEFAULT_LOCATION}
              scrollEnabled={false}
              zoomEnabled={false}
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
              <Text style={styles.locationLabel}>Vị trí của bạn</Text>
              <Text style={styles.locationAddress} numberOfLines={1}>
                {CURRENT_ADDRESS}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Category */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Danh mục</Text>
        </View>
        <View style={styles.categoryRow}>
          {CATEGORIES.map((cat) => (
            <CategoryButton
              key={cat.type}
              type={cat.type}
              label={cat.label}
              isSelected={selectedCategory === cat.type}
              onPress={() => {
                Sentry.addBreadcrumb({ category: 'user.action', message: 'User changed category filter', level: 'info', data: { screen: 'HomeScreen', filter: cat.type } });
                setSelectedCategory(cat.type);
              }}
            />
          ))}
        </View>

        {/* List Results */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {search.length > 0 ? 'Kết quả tìm kiếm' : 'Bãi xe bạn hay ghé thăm'}
          </Text>
        </View>
        
        {loading ? (
          <ActivityIndicator size="large" color={palette.darkBg} style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.parkingList}>
            {parkingLots.length === 0 ? (
              <Text style={styles.emptyText}>Không tìm thấy bãi đỗ xe nào</Text>
            ) : (
              parkingLots.map((lot) => (
                <ParkingCard key={lot.id} lot={lot} />
              ))
            )}
          </View>
        )}

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
    fontSize: 28,
    fontWeight: '800',
    color: palette.white,
    lineHeight: 34,
    letterSpacing: -0.5,
    marginBottom: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.darkBg2,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 48,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: palette.white + '10',
  },
  searchInput: {
    flex: 1,
    color: palette.white,
    fontSize: 15,
  },
  emptyText: {
    ...typography.body,
    color: palette.textSecondary,
    textAlign: 'center',
    marginTop: 20,
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
